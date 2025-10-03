import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';

/**
 * GET /api/products/bump-plans
 * Get available bump plans and pricing
 */
export async function GET(req: NextRequest) {
  try {
    const settings = await SettingsService.getAllSettings();

    // Check if monetization is enabled
    if (!settings.monetizationEnabled) {
      return NextResponse.json({
        enabled: false,
        message: 'Monetization features are currently disabled'
      }, { status: 200 });
    }

    // Get bump pricing structure
    const prices = settings.monetizationPrices || {};
    const bumpPricing = prices.bump_listing || {
      "1_bump": { price: 100, credits: 1, label: "1 Bump" },
      "3_bumps": { price: 250, credits: 3, label: "3 Bumps" },
      "5_bumps": { price: 400, credits: 5, label: "5 Bumps" },
      "10_bumps": { price: 750, credits: 10, label: "10 Bumps" }
    };

    // Get payment details (admin accounts)
    const paymentDetails = settings.monetizationPaymentDetails || {};

    return NextResponse.json({
      enabled: true,
      paymentDetails: {
        mtn: paymentDetails.mtn || null,
        orange: paymentDetails.orange || null,
        bank: paymentDetails.bank || null
      },
      plans: bumpPricing,
      currency: settings.platformCurrency || "LRD"
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/products/bump-plans GET:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch bump plans' 
    }, { status: 500 });
  }
}
