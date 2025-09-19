import { NextRequest, NextResponse } from 'next/server';

// Redirect to new logo endpoint
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/api/admin/settings/logo', req.url));
}

export async function POST(req: NextRequest) {
  return NextResponse.redirect(new URL('/api/admin/settings/logo', req.url));
}

export async function PATCH(req: NextRequest) {
  return NextResponse.redirect(new URL('/api/admin/settings/logo', req.url));
}
