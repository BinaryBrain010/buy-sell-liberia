import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../../models/User';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    return NextResponse.json({ success: true, message: 'User blocked successfully' });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to block user',
      },
      { status: 500 }
    );
  }
}
