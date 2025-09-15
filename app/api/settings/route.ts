import { NextRequest, NextResponse } from "next/server";
import Setting from "@/models/Setting";
import { connectDB } from "@/lib/mongoose";

// Public settings: safe keys used by frontend for UX
const PUBLIC_KEYS = [
  "platform_currency",
  "listing_expiration_days",
  "max_listing_photos",
  "payment_mobile_numbers",
  "payment_bank_info",
  "logo_path",
  "monetization_enabled",
  "registration_enabled",
  "maintenance_mode",
];

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const docs = await Setting.find({ key: { $in: PUBLIC_KEYS } });
    const map: Record<string, any> = {};
    docs.forEach((d) => (map[d.key] = d.value));
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load settings" }, { status: 500 });
  }
}


