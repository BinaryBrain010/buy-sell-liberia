import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Announcement from '../../../../models/Announcement';
import AnnouncementInteraction from '../../../../models/AnnouncementInteraction';
import User from '../../../../models/User';
import Chat from '../../../../models/Chat';
import UserMessageQueue from '../../../../models/UserMessageQueue';

/**
 * GET /api/admin/announcements
 * Fetch all announcements with pagination and filters
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const targetAudience = searchParams.get('targetAudience');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch announcements
    const [announcements, totalCount] = await Promise.all([
      Announcement.find(query)
        .populate('createdBy', 'fullName username email')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(query)
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/announcements
 * Create a new announcement
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      content,
      type,
      priority = 'medium',
      targetAudience = 'all',
      specificUsers = [],
      scheduleTime,
      expiryTime,
      displaySettings = {},
      sendImmediately = false
    } = body;

    // Validation
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    if (!['popup', 'email', 'banner', 'chat'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid announcement type' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    if (!['all', 'buyers', 'sellers', 'premium', 'specific'].includes(targetAudience)) {
      return NextResponse.json(
        { error: 'Invalid target audience' },
        { status: 400 }
      );
    }

    // Create announcement
    const announcement = await Announcement.create({
      title,
      content,
      type,
      priority,
      targetAudience,
      specificUsers: specificUsers.map((id: string) => new mongoose.Types.ObjectId(id)),
      scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
      expiryTime: expiryTime ? new Date(expiryTime) : undefined,
      displaySettings: {
        showOnDashboard: displaySettings.showOnDashboard ?? true,
        showOnHomepage: displaySettings.showOnHomepage ?? false,
        dismissible: displaySettings.dismissible ?? true,
        autoCloseAfter: displaySettings.autoCloseAfter ?? 0,
      },
      createdBy: new mongoose.Types.ObjectId(payload.id),
      sentAt: sendImmediately ? new Date() : undefined,
    });

    // If should be sent immediately, queue messages for users
    if (sendImmediately) {
      try {
        if (type === 'chat') {
          await broadcastAnnouncementToChats(announcement);
        } else {
          // For popup and banner types, queue for toast notifications
          await (UserMessageQueue as any).queueAnnouncementForAllUsers(announcement);
        }
      } catch (error) {
        console.error('Error broadcasting announcement:', error);
        // Don't fail the creation if broadcast fails
      }
    }

    // Populate the created announcement
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'fullName username email');

    return NextResponse.json({
      success: true,
      data: populatedAnnouncement,
      message: 'Announcement created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to broadcast announcement to all users via chat
 */
async function broadcastAnnouncementToChats(announcement: any) {
  try {
    // Get all active users
    const users = await User.find({ isActive: true }).select('_id');
    
    // Create admin user ID (assuming there's a system admin)
    const adminUser = await User.findOne({ role: 'super_admin' }).select('_id');
    if (!adminUser) {
      console.error('No admin user found for broadcasting');
      return;
    }

    // Determine target users based on announcement settings
    let targetUsers = users;
    
    if (announcement.targetAudience === 'specific' && announcement.specificUsers?.length > 0) {
      targetUsers = users.filter(user => 
        announcement.specificUsers.some((specificId: any) => 
          specificId.toString() === (user as any)._id.toString()
        )
      );
    }

    // For each target user, find or create a chat with admin and send the announcement
    const broadcastPromises = targetUsers.map(async (user) => {
      try {
        // Skip if it's the admin user itself
        if ((user as any)._id.toString() === (adminUser as any)._id.toString()) {
          return;
        }

        // Find an existing chat between admin and user, or create a system chat
        let chat = await Chat.findOne({
          $or: [
            { user1: adminUser._id, user2: user._id },
            { user1: user._id, user2: adminUser._id }
          ]
        });

        // If no chat exists, we'll create a system announcement chat
        // For this, we need a special "product" that represents system announcements
        // For now, we'll use a placeholder - you might want to create a special system product
        if (!chat) {
          // Create a new chat for system announcements
          // You might want to create a special "system" product for announcements
          const systemProductId = new mongoose.Types.ObjectId(); // Placeholder
          
          chat = await Chat.create({
            product: systemProductId,
            user1: (adminUser as any)._id,
            user2: (user as any)._id,
            messages: [],
            lastMessageAt: new Date(),
            isActive: true,
          });
        }

        // Add the announcement message to the chat
        const announcementMessage = {
          _id: new mongoose.Types.ObjectId(),
          sender: adminUser._id,
          content: `📢 ${announcement.title}\n\n${announcement.content}`,
          sentAt: new Date(),
          readBy: [],
        };

        chat.messages.push(announcementMessage as any);
        chat.lastMessageAt = new Date();
        await chat.save();

        return true;
      } catch (error) {
        console.error(`Error sending announcement to user ${user._id}:`, error);
        return false;
      }
    });

    const results = await Promise.allSettled(broadcastPromises);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    // Update announcement stats
    await Announcement.findByIdAndUpdate(announcement._id, {
      'stats.totalSent': successCount,
    });

    console.log(`Announcement broadcast completed. Sent to ${successCount} users.`);
    
  } catch (error) {
    console.error('Error broadcasting announcement:', error);
  }
}
