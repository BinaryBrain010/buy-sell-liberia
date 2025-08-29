

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ManualPayment from '@/models/ManualPayment';
import User from '@/models/User';
import Product from '@/models/Product';
import { AdminAuthService } from '@/app/api/modules/auth/services/admin-auth.service';
import '@/models';
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
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI!);
      }
  
      // Get all manual payments, most recent first
      const payments = await ManualPayment.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'fullName username email')
        .populate('listing', 'title featured')
        .lean();
  
      // Map to include all relevant fields
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
  
      return NextResponse.json({ payments: result });
    } catch (error: any) {
      console.error('Manual payments GET error:', error);
      return NextResponse.json({ error: error.message || 'Failed to fetch manual payments' }, { status: 500 });
    }
  }