import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ManualPayment from '../../../../../../models/ManualPayment';
import Product from '../../../../../../models/Product';
import User from '../../../../../../models/User';
import Chat from '../../../../../../models/Chat';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import { createAdminAuditLogger } from '../../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from '../../../../../../lib/audit-logger';

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

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminId);

    const payment = await ManualPayment.findById(params.id).populate('user').populate('listing');
    if (!payment) {
      return NextResponse.json({ error: 'Manual payment not found' }, { status: 404 });
    }
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    // Accept adminNotes from body
    let adminNotes = '';
    try {
      const body = await request.json();
      adminNotes = body.adminNotes || '';
    } catch (e) {
      // No body or not JSON, ignore
    }

    // Mark payment as approved
    payment.status = 'approved';
    payment.reviewedBy = adminId;
    payment.reviewedAt = new Date();
    payment.adminNotes = adminNotes;
    await payment.save();

    // Mark product as featured (direct update, no validation)
    let productDoc = null;
    if (payment.listing && typeof payment.listing === 'object' && 'featured' in payment.listing) {
      productDoc = payment.listing;
    } else {
      productDoc = await Product.findById(payment.listing);
    }
    if (productDoc && typeof productDoc === 'object' && productDoc !== null) {
      const productIdToUpdate = productDoc._id || payment.listing;
      await Product.updateOne({ _id: productIdToUpdate }, { $set: { featured: true } });
    }

    // Send message to user via chat
    const userId = payment.user._id;
    let senderId = adminId;
    // Defensive: ensure senderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      // Try to fetch admin by email or fallback
      const adminUser = await User.findOne({ email: payload.email });
      if (adminUser) senderId = adminUser._id;
      else senderId = userId; // fallback to userId to avoid validation error
    }
    const productTitle = productDoc && typeof productDoc === 'object' && productDoc !== null && 'title' in productDoc ? productDoc.title : '';
    const productId = productDoc && typeof productDoc === 'object' && productDoc !== null && '_id' in productDoc ? productDoc._id : payment.listing;
    let chat = await Chat.findOne({ product: productId, user2: userId });
    if (!chat) {
      chat = await Chat.create({ product: productId, user1: senderId, user2: userId, messages: [] });
      console.log('Created new chat:', chat._id);
    }
    chat.messages.push({ sender: senderId, content: `Your manual payment for featuring the product "${productTitle}" has been approved. Your product is now featured.`, sentAt: new Date(), readBy: [] });
    chat.lastMessageAt = new Date();
    console.log('Pushed message to chat:', chat._id, 'Sender:', senderId);
    await chat.save();

    // Log the payment approval operation
    await logger.logPaymentOperation(OperationType.PAYMENT_APPROVE, params.id, {
      adminNotes,
      productId: productId.toString(),
      productTitle,
      userId: userId.toString(),
      userEmail: payment.user.email,
      amount: payment.amount,
      adminUserId: adminId,
      previousStatus: 'pending',
      newStatus: 'approved'
    });

    return NextResponse.json({ success: true, message: 'Payment approved and user notified.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to approve manual payment.' }, { status: 500 });
  }
}
