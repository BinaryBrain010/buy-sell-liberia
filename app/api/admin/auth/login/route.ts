import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const result = await AdminAuthService.login(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    // If the auth service flagged a banned account, return 403 with structured message
    const msg: string = error?.message || 'Login failed';
    if (typeof msg === 'string' && msg.startsWith('BANNED:')) {
      const reason = msg.replace('BANNED:', '').trim();
      return NextResponse.json({ error: 'banned', isBanned: true, reason }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
