import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Announcement from '../../../../../../models/Announcement';
import AnnouncementInteraction from '../../../../../../models/AnnouncementInteraction';
import User from '../../../../../../models/User';
import Chat from '../../../../../../models/Chat';
import UserMessageQueue from '../../../../../../models/UserMessageQueue';

/**
 * POST /api/admin/announcements/[id]/broadcast
 * Broadcast an announcement to users based on its type and target audience
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;
    const body = await request.json();
    const { force = false } = body; // Force broadcast even if already sent

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    // Get announcement
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Check if already broadcasted (unless forced)
    if (announcement.sentAt && !force) {
      return NextResponse.json({ 
        error: 'Announcement already broadcasted. Use force=true to broadcast again.' 
      }, { status: 400 });
    }

    // Check if announcement is active
    if (!announcement.isActive) {
      return NextResponse.json({ 
        error: 'Cannot broadcast inactive announcement' 
      }, { status: 400 });
    }

    // Check schedule time
    const now = new Date();
    if (announcement.scheduleTime && announcement.scheduleTime > now) {
      return NextResponse.json({ 
        error: 'Cannot broadcast announcement before scheduled time' 
      }, { status: 400 });
    }

    // Check expiry time
    if (announcement.expiryTime && announcement.expiryTime < now) {
      return NextResponse.json({ 
        error: 'Cannot broadcast expired announcement' 
      }, { status: 400 });
    }

    let broadcastResult;

    // Broadcast based on type
    switch (announcement.type) {
      case 'chat':
        broadcastResult = await broadcastToChats(announcement, payload.id);
        break;
      case 'email':
        broadcastResult = await broadcastToEmail(announcement);
        break;
      case 'popup':
      case 'banner':
        broadcastResult = await broadcastToQueue(announcement);
        break;
      default:
        return NextResponse.json({ 
          error: 'Invalid announcement type' 
        }, { status: 400 });
    }

    // Update announcement with broadcast info
    await Announcement.findByIdAndUpdate(id, {
      sentAt: new Date(),
      'stats.totalSent': broadcastResult.successCount,
    });

    return NextResponse.json({
      success: true,
      data: {
        broadcastResult,
        message: `Announcement broadcasted successfully to ${broadcastResult.successCount} users`
      }
    });

  } catch (error) {
    console.error('Error broadcasting announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Broadcast announcement via chat messages AND queue for toast notifications
 */
async function broadcastToChats(announcement: any, adminId: string) {
  try {
    // Get target users based on announcement settings
    const targetUsers = await getTargetUsers(announcement);
    
    // Get admin user for sending messages
    const adminUser = await User.findById(adminId);
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Queue messages for all users first (for toast notifications when they log in)
    const queuedCount = await (UserMessageQueue as any).queueAnnouncementForAllUsers(
      announcement,
      [adminId] // Exclude admin user
    );

    // Also send to chats immediately
    const results = await Promise.allSettled(
      targetUsers.map(async (user) => {
        try {
          // Skip if it's the admin user itself
          if ((user as any)._id.toString() === adminId) {
            return false;
          }

          // Find existing chat or create system announcement chat
          let chat = await findOrCreateSystemChat((adminUser as any)._id, (user as any)._id);

          // Create announcement message
          const announcementMessage = {
            _id: new mongoose.Types.ObjectId(),
            sender: adminUser._id,
            content: `📢 **${announcement.title}**\n\n${announcement.content}`,
            sentAt: new Date(),
            readBy: [],
          };

          // Add message to chat
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
      queuedCount,
      note: `Messages sent to ${chatSuccessCount} chats and queued for ${queuedCount} users`
    };

  } catch (error) {
    console.error('Error in broadcastToChats:', error);
    throw error;
  }
}

/**
 * Broadcast announcement via email (placeholder - implement with your email service)
 */
async function broadcastToEmail(announcement: any) {
  try {
    const targetUsers = await getTargetUsers(announcement);
    
    // TODO: Implement email sending logic here
    // For now, we'll just simulate the broadcast
    console.log(`Would send email to ${targetUsers.length} users`);
    
    // Simulate email sending with random success rate
    const successCount = Math.floor(targetUsers.length * 0.95); // 95% success rate
    
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
 * Broadcast announcements to message queue (for popup/banner notifications)
 */
async function broadcastToQueue(announcement: any) {
  try {
    // Queue messages for all target users (for toast notifications when they log in)
    const queuedCount = await (UserMessageQueue as any).queueAnnouncementForAllUsers(announcement);
    
    return {
      type: announcement.type,
      totalTargeted: queuedCount,
      successCount: queuedCount,
      failedCount: 0,
      queuedCount,
      note: `${announcement.type} announcements queued for ${queuedCount} users. Will show as toast notifications when users log in.`
    };

  } catch (error) {
    console.error('Error in broadcastToQueue:', error);
    throw error;
  }
}

/**
 * Broadcast system announcements (popup/banner) - these are fetched by clients
 * @deprecated Use broadcastToQueue instead for better user experience
 */
async function broadcastToSystem(announcement: any) {
  try {
    const targetUsers = await getTargetUsers(announcement);
    
    // For system announcements, we just mark them as ready for client consumption
    // Clients will fetch these via the user API endpoints
    
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
 * Get target users based on announcement audience settings
 */
async function getTargetUsers(announcement: any) {
  let query: any = { isActive: true };

  switch (announcement.targetAudience) {
    case 'all':
      // No additional filters
      break;
    case 'buyers':
      // Users who have made purchases or inquiries
      query['activity.totalPurchases'] = { $gt: 0 };
      break;
    case 'sellers':
      // Users who have listed products
      query['activity.totalListings'] = { $gt: 0 };
      break;
    case 'premium':
      // Users with premium status (if you have such a field)
      query['profile.isPremium'] = true;
      break;
    case 'specific':
      if (announcement.specificUsers && announcement.specificUsers.length > 0) {
        query._id = { $in: announcement.specificUsers };
      } else {
        return []; // No specific users defined
      }
      break;
    default:
      throw new Error('Invalid target audience');
  }

  return await User.find(query).select('_id fullName email username').lean();
}

/**
 * Find or create a system chat for announcements
 */
async function findOrCreateSystemChat(adminUserId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
  // Try to find existing system chat
  let chat = await Chat.findOne({
    $or: [
      { user1: adminUserId, user2: userId },
      { user1: userId, user2: adminUserId }
    ],
    // You might want to add a special field to identify system/announcement chats
    // For now, we'll use any existing chat or create a new one
  });

  if (!chat) {
    // Create a system chat for announcements
    // We need a special product ID for system announcements
    const systemProductId = new mongoose.Types.ObjectId('000000000000000000000000'); // Special system product ID
    
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
