import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import Chat from '../../../../models/Chat';

export async function GET(request: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get users with pagination
    const users = await User.find(
      {},
      '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken'
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Extract all user IDs
    const userIds = users.map(user => new mongoose.Types.ObjectId(user._id.toString()));

    // Find all chats where users are participants with populated user details
    const chats = await Chat.find({
      $or: [
        { user1: { $in: userIds } },
        { user2: { $in: userIds } }
      ]
    })
    .populate('user1', 'fullName username email')
    .populate('user2', 'fullName username email')
    .populate('product', 'name title description')
    .lean();

    // Create a map to store chat conversations for each user
    const chatsByUser = new Map<string, any[]>();

    // Initialize empty arrays for all users
    users.forEach(user => {
      chatsByUser.set(user._id.toString(), []);
    });

    // Process chats and group by user
    chats.forEach((chat: any) => {
      const user1Id = chat.user1?._id?.toString();
      const user2Id = chat.user2?._id?.toString();

      // Sort messages chronologically within each chat
      const sortedMessages = (chat.messages || []).sort((a: any, b: any) => {
        const dateA = new Date(a.sentAt || 0).getTime();
        const dateB = new Date(b.sentAt || 0).getTime();
        return dateA - dateB; // Ascending order (oldest first)
      });

      // Calculate message stats for this chat
      const user1Messages = sortedMessages.filter((msg: any) => 
        msg.sender?.toString() === user1Id
      );
      const user2Messages = sortedMessages.filter((msg: any) => 
        msg.sender?.toString() === user2Id
      );

      const chatData = {
        chatId: chat._id,
        product: chat.product,
        participants: {
          user1: chat.user1,
          user2: chat.user2
        },
        messages: sortedMessages,
        chatStats: {
          totalMessages: sortedMessages.length,
          user1Messages: user1Messages.length,
          user2Messages: user2Messages.length
        },
        lastMessageAt: chat.lastMessageAt,
        isActive: chat.isActive,
        createdAt: chat.created_at || chat.createdAt
      };

      // Add this chat to both users
      if (user1Id && chatsByUser.has(user1Id)) {
        chatsByUser.get(user1Id)!.push({
          ...chatData,
          otherParticipant: chat.user2,
          myRole: 'user1',
          myMessages: user1Messages.length,
          otherMessages: user2Messages.length
        });
      }

      if (user2Id && chatsByUser.has(user2Id)) {
        chatsByUser.get(user2Id)!.push({
          ...chatData,
          otherParticipant: chat.user1,
          myRole: 'user2',
          myMessages: user2Messages.length,
          otherMessages: user1Messages.length
        });
      }
    });

    // Build the response with users and their complete chat conversations
    const usersWithChats = users.map((user: any) => {
      const userId = user._id.toString();
      const userChats = chatsByUser.get(userId) || [];
      
      // Sort chats by last message date (most recent first)
      const sortedChats = userChats.sort((a: any, b: any) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      // Calculate overall statistics
      const totalMessages = sortedChats.reduce((sum, chat) => sum + chat.chatStats.totalMessages, 0);
      const totalSentMessages = sortedChats.reduce((sum, chat) => sum + chat.myMessages, 0);
      const totalReceivedMessages = sortedChats.reduce((sum, chat) => sum + chat.otherMessages, 0);

      return {
        ...user,
        chatConversations: sortedChats,
        overallStats: {
          totalChats: sortedChats.length,
          activeChats: sortedChats.filter(chat => chat.isActive).length,
          totalMessages,
          sentMessages: totalSentMessages,
          receivedMessages: totalReceivedMessages
        },
        lastActivity: sortedChats.length > 0 ? sortedChats[0].lastMessageAt : null
      };
    });

    // Get total count for pagination
    const total = await User.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithChats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      },
      message: 'Users with complete chat conversations fetched successfully'
    });

  } catch (error: any) {
    console.error('Error fetching users with chat conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch users with chat conversations',
        data: null
      },
      { status: 500 }
    );
  }
}