import { NextRequest, NextResponse } from 'next/server';
import { isMonetizationEnabled } from './monetization.util';

export async function requireMonetizationEnabled(req: NextRequest) {
  const enabled = await isMonetizationEnabled();
  if (!enabled) {
    return NextResponse.json({ error: 'Monetization features are currently disabled.' }, { status: 403 });
  }
  return null; // Continue if enabled
}
