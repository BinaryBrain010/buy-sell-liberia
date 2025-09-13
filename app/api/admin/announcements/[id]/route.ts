import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Announcement from '@/models/Announcement';
import { AdminAuthService } from '@/app/api/modules/auth/services/admin-auth.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const announcement = await Announcement.findById(params.id).lean();
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    return NextResponse.json({ announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch announcement' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await request.json();
    const updateFields: any = {};
    if (body.title) updateFields.title = body.title;
    if (body.content) updateFields.content = body.content;
    if (body.type) updateFields.type = body.type;
    if (body.status) updateFields.status = body.status;
    if (body.scheduledAt) updateFields.scheduledAt = body.scheduledAt;
    if (body.expiresAt) updateFields.expiresAt = body.expiresAt;
    if (body.targetAudience) updateFields.targetAudience = body.targetAudience;
    const announcement = await Announcement.findByIdAndUpdate(params.id, updateFields, { new: true, runValidators: true }).lean();
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    return NextResponse.json({ announcement, message: 'Announcement updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const announcement = await Announcement.findByIdAndDelete(params.id).lean();
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    return NextResponse.json({ message: 'Announcement deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete announcement' }, { status: 500 });
  }
}
