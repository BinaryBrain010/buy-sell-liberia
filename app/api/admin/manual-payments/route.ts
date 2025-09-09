import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ManualPayment from '../../../../models/ManualPayment';
import User from '../../../../models/User';
import Product from '../../../../models/Product';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import '../../../../models';

export async function GET(request: NextRequest) {
  try {
    // Auth: Allow all admin/employee roles (centralized helper)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check (super_admin only):
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (!payload || typeof payload !== 'object' || !AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to DB if needed
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI!);
    }

    // Pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (status) filter.status = status;

    const total = await ManualPayment.countDocuments(filter);
    const payments = await ManualPayment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('user', 'fullName username email')
      .populate('listing', 'title featured')
      .lean();

    // Add all required details for the panel
    const result = payments.map(payment => ({
      _id: payment._id,
      user: payment.user,
      listing: payment.listing,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId,
      screenshot: payment.screenshot,
      status: payment.status,
      adminNotes: payment.adminNotes,
      userNotes: payment.userNotes,
      createdAt: payment.createdAt,
      reviewedBy: payment.reviewedBy,
      reviewedAt: payment.reviewedAt,
    }));

    return NextResponse.json({
      payments: result,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Manual payments GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch manual payments' }, { status: 500 });
  }
}


