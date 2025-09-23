import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Chat from '../../../../../models/Chat';
import { createAdminAuditLogger } from '../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from '../../../../../lib/audit-logger';

export async function DELETE(request: NextRequest, { params }: { params: { messageId: string } }) {
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

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { messageId } = params;
    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId parameter' }, { status: 400 });
    }

    // Find the chat containing this message
    const chat = await Chat.findOne({ 'messages._id': messageId });
    if (!chat) {
      return NextResponse.json({ error: 'Message not found in any chat' }, { status: 404 });
    }

    // Find the message to get its content for logging
    const messageToDelete = chat.messages.find((msg: any) => msg._id.toString() === messageId);
    
    // Remove the message from the chat
    chat.messages = chat.messages.filter((msg: any) => msg._id.toString() !== messageId);
    await chat.save();

    // Create audit logger and log message deletion
    const logger = createAdminAuditLogger(request, payload._id || payload.id || 'unknown');
    await logger.logCustomOperation(ModuleType.MESSAGE_MANAGEMENT, OperationType.MESSAGE_DELETE, messageId, 'Message', {
      adminUserId: payload._id || payload.id || 'unknown',
      messageId,
      chatId: chat._id.toString(),
      messageContent: messageToDelete?.content?.substring(0, 100) || 'Unknown content',
      messageSender: messageToDelete?.sender?.toString() || 'Unknown',
      summary: `Deleted message from chat ${chat._id}`
    });

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete message',
      },
      { status: 500 }
    );
  }
}
