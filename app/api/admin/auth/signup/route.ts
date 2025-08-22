import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import { Admin } from '../../../modules/auth/models/admin.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
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

    const { email, password, name, role } = await request.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, password: hashed, name, role });
    return NextResponse.json({
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
      _id: newAdmin._id,
      createdAt: newAdmin.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}