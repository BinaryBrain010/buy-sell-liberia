import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

// Public settings subset for client consumption (safe fields only)
export async function GET(req: NextRequest) {
  try {
    const settings = await SettingsService.getAllSettings();
    const paymentDetails = settings.monetizationPaymentDetails || {};
    const contact = (settings as any).paymentContactInfo || {};
    const currency = settings.platformCurrency || "LRD";

    // Normalized paid categories object for consistency
    const paidCategories = {
      enabled: !!(settings as any).paidCategoriesEnabled,
      enforceActive: !!(settings as any).isPaidCategoryActive,
    };

    // Normalize with fallback: if monetizationPaymentDetails are empty, try to coerce paymentContactInfo
    const normalizedPaymentDetails = {
      mtn:
        paymentDetails.mtn ||
        (contact.mtnNumber
          ? { number: contact.mtnNumber, name: contact.mtnName || undefined }
          : null),
      orange:
        paymentDetails.orange ||
        (contact.orangeNumber
          ? {
              number: contact.orangeNumber,
              name: contact.orangeName || undefined,
            }
          : null),
      bank:
        paymentDetails.bank ||
        (contact.bankName ||
        contact.bankAccountNumber ||
        contact.bankAccountName
          ? {
              bankName: contact.bankName || undefined,
              accountName: contact.bankAccountName || undefined,
              accountNumber: contact.bankAccountNumber || undefined,
            }
          : null),
    };

    return NextResponse.json(
      { currency, paymentDetails: normalizedPaymentDetails, paidCategories },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/settings/public GET:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch public settings" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
