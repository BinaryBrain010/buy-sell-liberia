import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../../models/User';
import { createAdminAuditLogger } from '../../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from '../../../../../../lib/audit-logger';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Auth: Allow all admin roles
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    const allowedRoles = ['super_admin', 'admin', 'moderator', 'payment_officer', 'support_agent', 'custom'];
    if (!payload || typeof payload !== 'object' || !allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminUserId = payload._id || payload.id || 'unknown';
    const { isBanned, banReason } = await request.json();
    if (typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'isBanned (boolean) is required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminUserId);

    const update: any = { isBanned };
    if (isBanned) {
      update.banReason = banReason || null;
      update.bannedAt = new Date();
    } else {
      update.banReason = null;
      update.bannedAt = null;
    }

    const user = await User.findByIdAndUpdate(params.id, update, { new: true, select: '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken' });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log the operation
    const operation = isBanned ? OperationType.USER_BAN : OperationType.USER_UNBAN;
    await logger.logUserOperation(operation, params.id, {
      banReason: banReason || null,
      previousStatus: !isBanned ? 'banned' : 'active',
      newStatus: isBanned ? 'banned' : 'active',
      adminUserId,
      userEmail: user.email,
      userName: user.fullName
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user ban status' }, { status: 500 });
  }
}
