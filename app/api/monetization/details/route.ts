import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';

/**
 * GET /api/monetization/details
 * Public endpoint for users to get monetization settings (payment details and pricing)
 * Used when user wants to feature their listing
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

    // Get pricing structure
    const prices = settings.monetizationPrices || {};
    const featuredPricing = prices.featured_listing || {
      "3_days": { price: 150, duration: 3, label: "3 Days" },
      "7_days": { price: 300, duration: 7, label: "7 Days" },
      "14_days": { price: 500, duration: 14, label: "14 Days" }
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
      plans: featuredPricing,
      currency: settings.platformCurrency || "LRD"
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/monetization/details GET:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch monetization details' 
    }, { status: 500 });
  }
}
