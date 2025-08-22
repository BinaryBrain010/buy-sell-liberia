import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // For JWT, logout is handled client-side by deleting the token.
  return NextResponse.json({ message: 'Logged out successfully' });
}
