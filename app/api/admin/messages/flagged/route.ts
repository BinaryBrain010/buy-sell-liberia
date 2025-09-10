import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Chat from '../../../../../models/Chat';

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

    // Find all flagged chats
    const flaggedChats = await Chat.find({ flagged: true })
      .populate('user1', 'fullName username email')
      .populate('user2', 'fullName username email')
      .populate('product', 'title slug')
      .lean();

    return NextResponse.json({
      success: true,
      data: flaggedChats,
      message: 'Flagged conversations fetched successfully',
    });
  } catch (error: any) {
    console.error('Error fetching flagged conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch flagged conversations',
        data: null,
      },
      { status: 500 }
    );
  }
}
