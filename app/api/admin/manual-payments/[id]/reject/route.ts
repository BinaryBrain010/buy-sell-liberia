import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ManualPayment from '../../../../../models/ManualPayment';
import Product from '../../../../../models/Product';
import User from '../../../../../models/User';
import Chat from '../../../../../models/Chat';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const adminId = payload._id || payload.id;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI!);
    }

    const payment = await ManualPayment.findById(params.id).populate('user').populate('listing');
    if (!payment) {
      return NextResponse.json({ error: 'Manual payment not found' }, { status: 404 });
    }
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    const { adminNotes } = await request.json();
    payment.status = 'rejected';
    payment.adminNotes = adminNotes || '';
    payment.reviewedBy = adminId;
    payment.reviewedAt = new Date();
    await payment.save();

    // Send message to user via chat
    const userId = payment.user._id;
    const productId = payment.listing._id;
    let chat = await Chat.findOne({ product: productId, user2: userId });
    if (!chat) {
      chat = await Chat.create({ product: productId, user1: adminId, user2: userId, messages: [] });
    }
    chat.messages.push({ sender: adminId, content: `Your manual payment for featuring the product "${payment.listing.title}" has been rejected. Reason: ${adminNotes || 'No reason provided.'}`, sentAt: new Date(), readBy: [] });
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json({ success: true, message: 'Payment rejected and user notified.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reject manual payment.' }, { status: 500 });
  }
}
