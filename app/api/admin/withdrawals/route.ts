import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import WithdrawalLog from '../../../../models/WithdrawalLog';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { connectDB } from '@/lib/mongoose';
import { Admin } from '../../modules/auth/models/admin.model';

// GET: List all withdrawal logs (admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
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
  } catch (error: any) {
    console.error('Error in /api/admin/withdrawals GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a new withdrawal log (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
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

    let adminId = payload._id || payload.id || null;
    let adminTitle = undefined;
    if (!adminId && payload.role === 'super_admin') {
      adminTitle = 'Super Admin';
    } else if (!adminId && payload.email) {
      const adminDoc = await Admin.findOne({ email: payload.email });
      if (adminDoc) {
        adminId = adminDoc._id;
      }
    }

    // If neither adminId nor adminTitle, error
    if (!adminId && !adminTitle) {
      return NextResponse.json({ error: 'Admin ID or title missing' }, { status: 400 });
    }

    const logData: any = {
      amount,
      date: new Date(date),
      destination,
      note,
      admin: adminId,
    };
    if (adminTitle) logData.adminTitle = adminTitle;

    const log = await WithdrawalLog.create(logData);
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error in /api/admin/withdrawals POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
