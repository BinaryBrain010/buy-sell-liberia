import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/app/api/modules/shared/models/setting.model';
import { AdminAuthService } from '@/app/api/modules/auth/services/admin-auth.service';

const MONETIZATION_KEY = 'monetization_enabled';

// GET: Get monetization status
export async function GET() {
  const setting = await Setting.findOne({ key: MONETIZATION_KEY });
  return NextResponse.json({ enabled: !!(setting && setting.value) });
}

// POST: Set monetization status (admin only)
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
}
