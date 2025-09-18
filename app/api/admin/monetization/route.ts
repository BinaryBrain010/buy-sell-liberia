import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';

// GET: Get all monetization settings (prices and payment details)
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
    return NextResponse.json({
      prices: settings.monetizationPrices || {},
      paymentDetails: settings.monetizationPaymentDetails || {},
      enabled: settings.monetizationEnabled
    });
  } catch (error: any) {
    console.error('Error in /api/admin/monetization GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Update monetization settings (prices or payment details)
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

    const { prices, paymentDetails, enabled } = await req.json();
    
    const updates: any = {};
    
    if (prices !== undefined) {
      updates.monetizationPrices = prices;
    }
    if (paymentDetails !== undefined) {
      updates.monetizationPaymentDetails = paymentDetails;
    }
    if (typeof enabled === 'boolean') {
      updates.monetizationEnabled = enabled;
    }

    await SettingsService.updateSettings(updates);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/admin/monetization POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
