import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ManualPayment from '../../../../models/ManualPayment';
import Product from '../../../../models/Product';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';

export async function GET(req: NextRequest) {
  // Admin auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const payload = AdminAuthService.verifyAccessToken(token);
  if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse date range
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null;
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null;

  // Build query
  const query: any = { status: 'approved' };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  // Aggregate payments
  const payments = await ManualPayment.find(query).populate('listing');

  // Total revenue
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Breakdown by payment method
  const breakdownByPaymentMethod: Record<string, number> = {};
  payments.forEach((p) => {
    breakdownByPaymentMethod[p.method] = (breakdownByPaymentMethod[p.method] || 0) + (p.amount || 0);
  });

  // Breakdown by feature type (Boosts = featured listing, Other = not featured)
  const breakdownByFeatureType: Record<string, number> = { Boosts: 0, Other: 0 };
  payments.forEach((p) => {
    const product = p.listing as any;
    if (product && product.featured) {
      breakdownByFeatureType.Boosts += p.amount || 0;
    } else {
      breakdownByFeatureType.Other += p.amount || 0;
    }
  });

  return NextResponse.json({
    totalRevenue,
    breakdownByPaymentMethod,
    breakdownByFeatureType,
    payments: payments.map((p) => ({
      _id: p._id,
      amount: p.amount,
      method: p.method,
      createdAt: p.createdAt,
      listing: p.listing?._id,
      featured: (p.listing as any)?.featured || false,
    })),
  });
}
