import { NextRequest, NextResponse } from 'next/server';
import Setting from '@/models/Setting';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { getSetting } from '@/lib/settings';

const PRICES_KEY = 'monetization_prices';
const PAYMENT_DETAILS_KEY = 'monetization_payment_details';

// GET: Get all monetization settings (prices and payment details)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const payload = AdminAuthService.verifyAccessToken(token);
  if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if monetization is enabled
  const monetizationEnabled = await getSetting('monetization_enabled');
  if (!monetizationEnabled) {
    return NextResponse.json({ error: 'Monetization is currently disabled' }, { status: 403 });
  }

  const pricesSetting = await Setting.findOne({ key: PRICES_KEY });
  const paymentDetailsSetting = await Setting.findOne({ key: PAYMENT_DETAILS_KEY });
  return NextResponse.json({
    prices: pricesSetting?.value || {},
    paymentDetails: paymentDetailsSetting?.value || {},
  });
}

// POST: Update monetization settings (prices or payment details)
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

  // Check if monetization is enabled
  const monetizationEnabled = await getSetting('monetization_enabled');
  if (!monetizationEnabled) {
    return NextResponse.json({ error: 'Monetization is currently disabled' }, { status: 403 });
  }

  const { prices, paymentDetails } = await req.json();
  if (prices) {
    await Setting.findOneAndUpdate(
      { key: PRICES_KEY },
      { value: prices },
      { upsert: true, new: true }
    );
  }
  if (paymentDetails) {
    await Setting.findOneAndUpdate(
      { key: PAYMENT_DETAILS_KEY },
      { value: paymentDetails },
      { upsert: true, new: true }
    );
  }
  return NextResponse.json({ success: true });
}
