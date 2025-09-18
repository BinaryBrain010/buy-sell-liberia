import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';

// GET: Get platform currency
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const currency = await SettingsService.getPlatformCurrency();
    return NextResponse.json({ currency });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/currency GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Update platform currency
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { currency } = await req.json();
    
    if (!['LRD', 'USD'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency. Must be LRD or USD' }, { status: 400 });
    }

    await SettingsService.updateSetting('platform_currency', currency);
    
    return NextResponse.json({ success: true, currency });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/currency POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update platform currency (same as POST for individual updates)
export async function PATCH(req: NextRequest) {
  return POST(req);
}
