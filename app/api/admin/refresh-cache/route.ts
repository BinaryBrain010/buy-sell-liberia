import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { clearSettingsCache } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    // Auth: Only admin/super_admin can clear cache
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Clear settings cache
    clearSettingsCache();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to clear cache' }, { status: 500 });
  }
}
