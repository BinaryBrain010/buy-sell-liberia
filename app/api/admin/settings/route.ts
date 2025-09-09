import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/app/api/modules/shared/models/setting.model';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { connectDB } from '@/lib/mongoose';

const MONETIZATION_KEY = 'monetization_enabled';

// GET: Get monetization status
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
    const setting = await Setting.findOne({ key: MONETIZATION_KEY });
    return NextResponse.json({ enabled: !!(setting && setting.value) });
  } catch (error: any) {
    console.error('Error in /api/admin/settings GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Set monetization status (admin only)
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
    const { enabled } = await req.json();
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
    }
    await Setting.findOneAndUpdate(
      { key: MONETIZATION_KEY },
      { value: enabled },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, enabled });
  } catch (error: any) {
    console.error('Error in /api/admin/settings POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
