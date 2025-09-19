import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { SettingsService, SystemSettings } from '@/app/api/modules/shared/services/settings.service';

// GET: Get all system settings
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

    const settings = await SettingsService.getAllSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error in /api/admin/settings GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Update system settings (admin only)
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

    const updates = await req.json();
    
    // Validate required fields
    if (updates.platformCurrency && !['LRD', 'USD'].includes(updates.platformCurrency)) {
      return NextResponse.json({ error: 'Invalid platform currency. Must be LRD or USD' }, { status: 400 });
    }
    
    if (updates.listingExpirationDays && (updates.listingExpirationDays < 1 || updates.listingExpirationDays > 365)) {
      return NextResponse.json({ error: 'Listing expiration days must be between 1 and 365' }, { status: 400 });
    }
    
    if (updates.maxListingPhotos && (updates.maxListingPhotos < 1 || updates.maxListingPhotos > 20)) {
      return NextResponse.json({ error: 'Max listing photos must be between 1 and 20' }, { status: 400 });
    }

    await SettingsService.updateSettings(updates);
    
    const updatedSettings = await SettingsService.getAllSettings();
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error('Error in /api/admin/settings POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update individual setting (admin only)
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
    
    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    // Validate specific settings
    if (key === 'platformCurrency' && !['LRD', 'USD'].includes(value)) {
      return NextResponse.json({ error: 'Invalid platform currency. Must be LRD or USD' }, { status: 400 });
    }
    
    if (key === 'listingExpirationDays' && (value < 1 || value > 365)) {
      return NextResponse.json({ error: 'Listing expiration days must be between 1 and 365' }, { status: 400 });
    }
    
    if (key === 'maxListingPhotos' && (value < 1 || value > 20)) {
      return NextResponse.json({ error: 'Max listing photos must be between 1 and 20' }, { status: 400 });
    }

    // Map property name to database key
    const dbKey = SettingsService.getSettingKey(key as keyof SystemSettings);
    if (!dbKey) {
      return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
    }
    
    await SettingsService.updateSetting(dbKey, value);
    
    const updatedSettings = await SettingsService.getAllSettings();
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error('Error in /api/admin/settings PATCH:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
