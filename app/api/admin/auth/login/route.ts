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
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 });
  }
}
