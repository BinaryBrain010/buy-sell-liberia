import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Report from '../../../../models/Report';
import Product from '../../../../models/Product';
import User from '../../../../models/User';

// GET: View all reports, filter by reason, status, product, user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(request.url);
    const filter: any = {};
    if (searchParams.get('reason')) filter.reason = searchParams.get('reason');
    if (searchParams.get('status')) filter.status = searchParams.get('status');
    if (searchParams.get('product_id')) filter.product_id = searchParams.get('product_id');
    if (searchParams.get('user_id')) filter.reported_by = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const reports = await Report.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .populate('product_id')
      .populate('reported_by', '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken')
      .lean();
    const total = await Report.countDocuments(filter);
    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

// PATCH: Admin actions (approve, remove, warn, ban)
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { reportId, action, adminNotes } = await request.json();
    if (!reportId || !action) {
      return NextResponse.json({ error: 'reportId and action are required' }, { status: 400 });
    }
    const report = await Report.findById(reportId);
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    let product, user;
    switch (action) {
      case 'approve':
        report.status = 'approved';
        report.adminAction = 'approve';
        break;
      case 'remove':
        report.status = 'removed';
        report.adminAction = 'remove';
        product = await Product.findById(report.product_id);
        if (product) {
          product.status = 'removed';
          await product.save();
        }
        break;
      case 'warn':
        report.status = 'resolved';
        report.adminAction = 'warn';
        user = await User.findById(report.reported_by);
        if (user) {
          user.isBlocked = true;
          await user.save();
        }
        break;
      case 'ban':
        report.status = 'resolved';
        report.adminAction = 'ban';
        user = await User.findById(report.reported_by);
        if (user) {
          user.isBanned = true;
          user.banReason = 'Flagged by admin via report';
          user.bannedAt = new Date();
          await user.save();
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (adminNotes) report.adminNotes = adminNotes;
    await report.save();
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update report' }, { status: 500 });
  }
}
