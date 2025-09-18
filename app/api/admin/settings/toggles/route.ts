import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';

// GET: Get all toggle settings
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

    const [monetizationEnabled, registrationEnabled, maintenanceMode] = await Promise.all([
      SettingsService.isMonetizationEnabled(),
      SettingsService.isRegistrationEnabled(),
      SettingsService.isMaintenanceMode()
    ]);

    return NextResponse.json({
      monetizationEnabled,
      registrationEnabled,
      maintenanceMode
    });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/toggles GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Update toggle settings
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

    const { monetizationEnabled, registrationEnabled, maintenanceMode } = await req.json();
    
    const updates: any = {};
    
    if (typeof monetizationEnabled === 'boolean') {
      updates.monetizationEnabled = monetizationEnabled;
    }
    if (typeof registrationEnabled === 'boolean') {
      updates.registrationEnabled = registrationEnabled;
    }
    if (typeof maintenanceMode === 'boolean') {
      updates.maintenanceMode = maintenanceMode;
    }

    await SettingsService.updateSettings(updates);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/toggles POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update individual toggle setting
export async function PATCH(req: NextRequest) {
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

    const { key, value } = await req.json();
    
    if (!key || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Key and boolean value are required' }, { status: 400 });
    }

    const validKeys = ['monetizationEnabled', 'registrationEnabled', 'maintenanceMode'];
    if (!validKeys.includes(key)) {
      return NextResponse.json({ error: 'Invalid toggle key' }, { status: 400 });
    }

    await SettingsService.updateSetting(key, value);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/toggles PATCH:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
