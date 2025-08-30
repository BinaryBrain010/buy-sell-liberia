import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import WithdrawalLog from '../../../../models/WithdrawalLog';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';

// GET: List all withdrawal logs (admin only)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const payload = AdminAuthService.verifyAccessToken(token);
  if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Optional: date range filter
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null;
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null;
  const query: any = {};
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const logs = await WithdrawalLog.find(query).populate('admin', 'email name role').sort({ date: -1 });
  return NextResponse.json({ logs });
}

// POST: Add a new withdrawal log (admin only)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const payload = AdminAuthService.verifyAccessToken(token);
  if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { amount, date, destination, note } = await req.json();
  if (typeof amount !== 'number' || !date || !destination) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const log = await WithdrawalLog.create({
    amount,
    date: new Date(date),
    destination,
    note,
    admin: payload._id || payload.id, // support both _id and id
  });
  return NextResponse.json({ success: true, log });
}
