import mongoose from 'mongoose';
import Announcement from '../../models/Announcement';
import AnnouncementInteraction from '../../models/AnnouncementInteraction';
import UserMessageQueue from '../../models/UserMessageQueue';
import User from '../../models/User';
import Chat from '../../models/Chat';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: 'popup' | 'email' | 'banner' | 'chat';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: 'all' | 'buyers' | 'sellers' | 'premium' | 'specific';
  specificUsers?: string[];
  scheduleTime?: Date;
  expiryTime?: Date;
  displaySettings?: {
    showOnDashboard?: boolean;
    showOnHomepage?: boolean;
    dismissible?: boolean;
    autoCloseAfter?: number;
  };
  createdBy: string;
}

export interface BroadcastResult {
  type: string;
  totalTargeted: number;
  successCount: number;
  failedCount: number;
  note?: string;
}

export class AnnouncementService {
  /**
   * Create a new announcement
   */
  static async createAnnouncement(data: CreateAnnouncementData) {
    try {
      const announcement = await Announcement.create({
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority || 'medium',
        targetAudience: data.targetAudience || 'all',
        specificUsers: data.specificUsers?.map(id => new mongoose.Types.ObjectId(id)) || [],
        scheduleTime: data.scheduleTime,
        expiryTime: data.expiryTime,
        displaySettings: {
          showOnDashboard: data.displaySettings?.showOnDashboard ?? true,
          showOnHomepage: data.displaySettings?.showOnHomepage ?? false,
          dismissible: data.displaySettings?.dismissible ?? true,
          autoCloseAfter: data.displaySettings?.autoCloseAfter ?? 0,
        },
        createdBy: new mongoose.Types.ObjectId(data.createdBy),
      });

      return await Announcement.findById(announcement._id)
        .populate('createdBy', 'fullName username email');
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  }

  /**
   * Get announcements for a specific user
   */
  static async getUserAnnouncements(userId?: string, type?: string, includeDismissed = false) {
    try {
      const now = new Date();
      let query: any = {
        isActive: true,
        $or: [
          { scheduleTime: { $lte: now } },
          { scheduleTime: { $exists: false } }
        ],
        $and: [
          {
            $or: [
              { expiryTime: { $gte: now } },
              { expiryTime: { $exists: false } }
            ]
          }
        ]
      };

      // Filter by type if specified
      if (type) {
        query.type = type;
      }

      // Filter by target audience
      if (userId) {
        query.$or = [
          { targetAudience: 'all' },
          { targetAudience: 'specific', specificUsers: new mongoose.Types.ObjectId(userId) }
        ];
      } else {
        query.targetAudience = 'all';
      }

      let announcements = await Announcement.find(query)
        .select('_id title content type priority displaySettings created_at')
        .sort({ priority: -1, created_at: -1 });

      // Filter out dismissed announcements if user is authenticated
      if (userId && !includeDismissed) {
        const dismissedInteractions = await AnnouncementInteraction.find({
          userId: new mongoose.Types.ObjectId(userId),
          action: 'dismissed'
        }).select('announcementId');

        const dismissedIds = dismissedInteractions.map(interaction => 
          interaction.announcementId.toString()
        );

        announcements = announcements.filter(announcement => 
          !dismissedIds.includes(announcement._id.toString())
        );
      }

      return announcements;
    } catch (error) {
      console.error('Error fetching user announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }

  /**
   * Record user interaction with announcement
   */
  static async recordInteraction(
    announcementId: string, 
    userId: string, 
    action: 'viewed' | 'clicked' | 'dismissed',
    deviceInfo?: any
  ) {
    try {
      // Check if interaction already exists
      const existingInteraction = await AnnouncementInteraction.findOne({
        announcementId: new mongoose.Types.ObjectId(announcementId),
        userId: new mongoose.Types.ObjectId(userId),
        action
      });

      if (existingInteraction) {
        return existingInteraction;
      }

      // Create new interaction
      const interaction = await AnnouncementInteraction.create({
        announcementId: new mongoose.Types.ObjectId(announcementId),
        userId: new mongoose.Types.ObjectId(userId),
        action,
        deviceInfo: deviceInfo || {},
        timestamp: new Date()
      });

      // Update announcement statistics
      const statField = `stats.total${action.charAt(0).toUpperCase() + action.slice(1)}`;
      await Announcement.findByIdAndUpdate(announcementId, {
        $inc: { [statField]: 1 }
      });

      return interaction;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw new Error('Failed to record interaction');
    }
  }

  /**
   * Broadcast announcement to users
   */
  static async broadcastAnnouncement(announcementId: string, adminId: string, force = false): Promise<BroadcastResult> {
    try {
      const announcement = await Announcement.findById(announcementId);
      if (!announcement) {
        throw new Error('Announcement not found');
      }

      // Validate broadcast conditions
      if (announcement.sentAt && !force) {
        throw new Error('Announcement already broadcasted. Use force=true to broadcast again.');
      }

      if (!announcement.isActive) {
        throw new Error('Cannot broadcast inactive announcement');
      }

      const now = new Date();
      if (announcement.scheduleTime && announcement.scheduleTime > now) {
        throw new Error('Cannot broadcast announcement before scheduled time');
      }

      if (announcement.expiryTime && announcement.expiryTime < now) {
        throw new Error('Cannot broadcast expired announcement');
      }

      let result: BroadcastResult;

      // Broadcast based on type
      switch (announcement.type) {
        case 'chat':
          result = await this.broadcastToChats(announcement, adminId);
          break;
        case 'email':
          result = await this.broadcastToEmail(announcement);
          break;
        case 'popup':
        case 'banner':
          result = await this.broadcastToQueue(announcement);
          break;
        default:
          throw new Error('Invalid announcement type');
      }

      // Update announcement with broadcast info
      await Announcement.findByIdAndUpdate(announcementId, {
        sentAt: new Date(),
        'stats.totalSent': result.successCount,
      });

      return result;
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
      throw error;
    }
  }

  /**
   * Broadcast via chat messages AND queue for notifications
   */
  private static async broadcastToChats(announcement: any, adminId: string): Promise<BroadcastResult> {
    try {
      const targetUsers = await this.getTargetUsers(announcement);
      const adminUser = await User.findById(adminId);
      
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Queue messages for all users first (for toast notifications when they log in)
      const queuedCount = await UserMessageQueue.queueAnnouncementForAllUsers(
        announcement,
        [adminId] // Exclude admin user
      );

      // Also send to chats immediately
      const results = await Promise.allSettled(
        targetUsers.map(async (user) => {
          try {
            if (user._id.toString() === adminId) {
              return false;
            }

            const chat = await this.findOrCreateSystemChat(adminUser._id, user._id);
            
            const announcementMessage = {
              _id: new mongoose.Types.ObjectId(),
              sender: adminUser._id,
              content: `📢 **${announcement.title}**\n\n${announcement.content}`,
              sentAt: new Date(),
              readBy: [],
            };

            chat.messages.push(announcementMessage as any);
            chat.lastMessageAt = new Date();
            await chat.save();

            return true;
          } catch (error) {
            console.error(`Error sending chat to user ${user._id}:`, error);
            return false;
          }
        })
      );

      const chatSuccessCount = results.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;

      return {
        type: 'chat',
        totalTargeted: targetUsers.length,
        successCount: chatSuccessCount,
        failedCount: targetUsers.length - chatSuccessCount,
        note: `Messages sent to ${chatSuccessCount} chats and queued for ${queuedCount} users`
      };
    } catch (error) {
      console.error('Error in broadcastToChats:', error);
      throw error;
    }
  }

  /**
   * Broadcast via email (implement with your email service)
   */
  private static async broadcastToEmail(announcement: any): Promise<BroadcastResult> {
    try {
      const targetUsers = await this.getTargetUsers(announcement);
      
      // TODO: Implement actual email sending logic
      console.log(`Would send email to ${targetUsers.length} users`);
      
      // Simulate email sending
      const successCount = Math.floor(targetUsers.length * 0.95);
      
      return {
        type: 'email',
        totalTargeted: targetUsers.length,
        successCount,
        failedCount: targetUsers.length - successCount,
      };
    } catch (error) {
      console.error('Error in broadcastToEmail:', error);
      throw error;
    }
  }

  /**
   * Broadcast to message queue (for popup/banner notifications)
   */
  private static async broadcastToQueue(announcement: any): Promise<BroadcastResult> {
    try {
      // Queue messages for all target users (for toast notifications when they log in)
      const queuedCount = await UserMessageQueue.queueAnnouncementForAllUsers(announcement);
      
      return {
        type: announcement.type,
        totalTargeted: queuedCount,
        successCount: queuedCount,
        failedCount: 0,
        note: `${announcement.type} announcements queued for ${queuedCount} users. Will show as toast notifications when users log in.`
      };
    } catch (error) {
      console.error('Error in broadcastToQueue:', error);
      throw error;
    }
  }

  /**
   * Broadcast system announcements (popup/banner)
   * @deprecated Use broadcastToQueue instead for better user experience
   */
  private static async broadcastToSystem(announcement: any): Promise<BroadcastResult> {
    try {
      const targetUsers = await this.getTargetUsers(announcement);
      
      return {
        type: announcement.type,
        totalTargeted: targetUsers.length,
        successCount: targetUsers.length,
        failedCount: 0,
        note: 'System announcements are available for client fetch'
      };
    } catch (error) {
      console.error('Error in broadcastToSystem:', error);
      throw error;
    }
  }

  /**
   * Get target users based on announcement settings
   */
  private static async getTargetUsers(announcement: any) {
    let query: any = { isActive: true };

    switch (announcement.targetAudience) {
      case 'all':
        break;
      case 'buyers':
        query['activity.totalPurchases'] = { $gt: 0 };
        break;
      case 'sellers':
        query['activity.totalListings'] = { $gt: 0 };
        break;
      case 'premium':
        query['profile.isPremium'] = true;
        break;
      case 'specific':
        if (announcement.specificUsers && announcement.specificUsers.length > 0) {
          query._id = { $in: announcement.specificUsers };
        } else {
          return [];
        }
        break;
      default:
        throw new Error('Invalid target audience');
    }

    return await User.find(query).select('_id fullName email username').lean();
  }

  /**
   * Find or create system chat for announcements
   */
  private static async findOrCreateSystemChat(adminUserId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    let chat = await Chat.findOne({
      $or: [
        { user1: adminUserId, user2: userId },
        { user1: userId, user2: adminUserId }
      ]
    });

    if (!chat) {
      const systemProductId = new mongoose.Types.ObjectId('000000000000000000000000');
      
      chat = await Chat.create({
        product: systemProductId,
        user1: adminUserId,
        user2: userId,
        messages: [],
        lastMessageAt: new Date(),
        isActive: true,
      });
    }

    return chat;
  }

  /**
   * Get announcement statistics
   */
  static async getAnnouncementStats(timeRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const [
        totalAnnouncements,
        activeAnnouncements,
        sentAnnouncements,
        totalInteractions
      ] = await Promise.all([
        Announcement.countDocuments(),
        Announcement.countDocuments({ isActive: true }),
        Announcement.countDocuments({ sentAt: { $exists: true } }),
        AnnouncementInteraction.countDocuments({
          timestamp: { $gte: startDate }
        })
      ]);

      return {
        totalAnnouncements,
        activeAnnouncements,
        sentAnnouncements,
        totalInteractions,
        timeRange
      };
    } catch (error) {
      console.error('Error getting announcement stats:', error);
      throw new Error('Failed to get announcement statistics');
    }
  }
}
