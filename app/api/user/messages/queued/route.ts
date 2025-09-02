import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import UserMessageQueue from '../../../../../models/UserMessageQueue';
import jwt from 'jsonwebtoken';

/**
 * GET /api/user/messages/queued
 * Get queued messages for the authenticated user (for toast notifications)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth: User must be logged in
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const markAsDelivered = searchParams.get('markAsDelivered') !== 'false'; // default true
    const type = searchParams.get('type'); // 'toast', 'chat', or 'all'

    // Get queued messages for the user
    let messages = await (UserMessageQueue as any).getQueuedMessagesForUser(userId, markAsDelivered);

    // Filter by type if specified
    if (type) {
      messages = messages.filter((message: any) => {
        if (type === 'toast') return message.showAsToast;
        if (type === 'chat') return message.showInChat;
        return true; // 'all' or unspecified
      });
    }

    // Format messages for frontend consumption
    const formattedMessages = messages.map((message: any) => ({
      id: message._id,
      title: message.title,
      content: message.content,
      priority: message.priority,
      messageType: message.messageType,
      showAsToast: message.showAsToast,
      showInChat: message.showInChat,
      queuedAt: message.queuedAt,
      metadata: message.metadata,
      announcementId: message.announcementId,
    }));

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        count: formattedMessages.length,
        delivered: markAsDelivered
      }
    });

  } catch (error) {
    console.error('Error fetching queued messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/messages/queued
 * Mark specific messages as delivered/read
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: User must be logged in
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    const { messageIds, action = 'mark_delivered' } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'messageIds array is required' },
        { status: 400 }
      );
    }

    // Validate that all messageIds belong to the authenticated user
    const userMessages = await UserMessageQueue.find({
      _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (userMessages.length !== messageIds.length) {
      return NextResponse.json(
        { error: 'Some messages do not belong to the authenticated user' },
        { status: 403 }
      );
    }

    let updateResult;
    switch (action) {
      case 'mark_delivered':
        updateResult = await UserMessageQueue.updateMany(
          { 
            _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) },
            userId: new mongoose.Types.ObjectId(userId)
          },
          { 
            isDelivered: true,
            deliveredAt: new Date()
          }
        );
        break;

      case 'delete':
        updateResult = await UserMessageQueue.deleteMany({
          _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) },
          userId: new mongoose.Types.ObjectId(userId)
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "mark_delivered" or "delete"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        processed: (updateResult as any).modifiedCount || (updateResult as any).deletedCount || 0,
        requested: messageIds.length
      },
      message: `Successfully ${action === 'delete' ? 'deleted' : 'marked as delivered'} ${(updateResult as any).modifiedCount || (updateResult as any).deletedCount || 0} messages`
    });

  } catch (error) {
    console.error('Error updating queued messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
