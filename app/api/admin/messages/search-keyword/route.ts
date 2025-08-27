import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../models/User';
import Chat from '../../../../../models/Chat';
import Product from '../../../../../models/Product';

const ABUSIVE_KEYWORDS = [
  'idiot', 'stupid', 'dumb', 'fool', 'hate', 'bastard', 'moron', 'shut up', 'nonsense', 'fuck', 'abuse1', 'abuse2'
];

function isAbusive(text: string, keywordList: string[]) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywordList.some(word => lower.includes(word));
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

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get keyword param
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword')?.trim().toLowerCase();
    let keywordsToSearch: string[];
    if (keyword) {
      if (!ABUSIVE_KEYWORDS.includes(keyword)) {
        return NextResponse.json({ error: 'Keyword is not in abusive list' }, { status: 400 });
      }
      keywordsToSearch = [keyword];
    } else {
      keywordsToSearch = ABUSIVE_KEYWORDS;
    }

    // Find all chats that have at least one abusive message
    const chats = await Chat.find({ 'messages.content': { $exists: true, $ne: null } })
      .populate('user1', 'fullName username email')
      .populate('user2', 'fullName username email')
      .populate('product', 'title slug')
      .lean();

    // Collect all abusive messages with sender and chat info
    const abusiveMessages: any[] = [];
    for (const chat of chats) {
      for (const msg of chat.messages || []) {
        if (isAbusive(msg.content, keywordsToSearch)) {
          abusiveMessages.push({
            chatId: chat._id,
            product: chat.product,
            sender: msg.sender,
            content: msg.content,
            sentAt: msg.sentAt,
            user1: chat.user1,
            user2: chat.user2,
          });
        }
      }
    }

    // Populate sender info for each abusive message
    const senderIds = [...new Set(abusiveMessages.map(m => m.sender?.toString()).filter(Boolean))];
    const senders = await User.find({ _id: { $in: senderIds } }, 'fullName username email').lean();
    const senderMap = new Map(senders.map(u => [u._id.toString(), u]));
    const results = abusiveMessages.map(m => ({
      ...m,
      sender: senderMap.get(m.sender?.toString()) || null,
    }));

    return NextResponse.json({
      success: true,
      data: results,
      message: keyword
        ? `Messages containing abusive keyword '${keyword}' fetched successfully`
        : 'Messages containing abusive keywords fetched successfully',
    });
  } catch (error: any) {
    console.error('Error searching messages by abusive keyword:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search messages by abusive keyword',
        data: null,
      },
      { status: 500 }
    );
  }
}
