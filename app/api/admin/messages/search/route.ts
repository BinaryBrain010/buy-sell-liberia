import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../models/User';
import Chat from '../../../../../models/Chat';

// Safe import for Product model - only import if it exists and is needed
let Product: any = null;
try {
  Product = require('../../../../../models/Product').default || require('../../../../../models/Product');
} catch (error) {
  // Product model doesn't exist or isn't needed
  console.log('Product model not found, skipping...');
}

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

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get and validate query parameter
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('query')?.trim();
    if (!username) {
      return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
    }

    // Step 1: Find user by username and get their ID
    const user = await User.findOne({ username }, { _id: 1, username: 1, fullName: 1, email: 1 }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user._id;

    // Step 2: Find all chats where this user ID appears
    const populateOptions: any[] = [
      { path: 'user1', select: 'fullName username email' },
      { path: 'user2', select: 'fullName username email' }
    ];

    // Only populate product if the model exists
    if (Product) {
      populateOptions.push({ path: 'product', select: 'title slug' });
    }

    const chats = await Chat.find({
      $or: [
        { user1: userId },
        { user2: userId },
        { 'messages.sender': userId }
      ]
    })
    .populate(populateOptions)
    .lean();

    // Step 3: Filter messages in each chat to only show messages from the searched user
    const chatsWithUserMessages = chats.map((chat: any) => {
      // Get only messages sent by the target user
      const userMessages = (chat.messages || []).filter((msg: any) => 
        msg.sender?.toString() === userId.toString()
      );
      
      return {
        _id: chat._id,
        user1: chat.user1,
        user2: chat.user2,
        product: chat.product,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        totalMessages: chat.messages?.length || 0,
        userMessageCount: userMessages.length,
        userMessages, // Messages sent by the searched user only
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        },
        chats: chatsWithUserMessages,
        summary: {
          totalChats: chats.length,
          totalUserMessages: chatsWithUserMessages.reduce((sum, chat) => sum + chat.userMessageCount, 0)
        }
      },
      message: `Chats and messages for user '${username}' fetched successfully`,
    });

  } catch (error: any) {
    console.error('Error searching messages by user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search messages by user',
        data: null,
      },
      { status: 500 }
    );
  }
}