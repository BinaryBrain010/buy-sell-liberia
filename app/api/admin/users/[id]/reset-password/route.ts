import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../../models/User';
import bcrypt from 'bcryptjs';

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

    const { newPassword } = await request.json();
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'A valid newPassword (min 6 chars) is required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(
      params.id,
      { password: hashed },
      { new: true, select: '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken' }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password reset successfully', user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reset password' }, { status: 500 });
  }
}
