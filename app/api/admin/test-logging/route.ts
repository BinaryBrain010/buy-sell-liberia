import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { logAdminAction } from '@/lib/admin-logger';
import AdminLog from '@/models/AdminLog';
import { connectDB } from '@/lib/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('=== TESTING ADMIN LOGGING ===');
    console.log('Admin payload:', payload);

    // Ensure DB connection
    await connectDB();
    console.log('Database connected');

    // Test 1: Check if AdminLog model works
    console.log('Testing AdminLog model...');
    const testLog = await AdminLog.create({
      adminId: 'test-admin-id',
      adminName: 'Test Admin',
      adminEmail: 'test@admin.com',
      adminRole: 'super_admin',
      action: 'test_action',
      module: 'users', // changed from 'tests' to 'users'
      description: 'Test log entry created directly',
      timestamp: new Date()
    });
    console.log('Direct AdminLog.create() successful:', testLog._id);

    // Test 2: Test logAdminAction function
    console.log('Testing logAdminAction function...');
    await logAdminAction({
      adminId: (payload as any).id || (payload as any).adminId || 'unknown',
      adminName: (payload as any).name || 'Test Admin',
      adminEmail: (payload as any).email || 'test@admin.com',
      adminRole: (payload as any).role || 'admin',
      action: 'test_logging_function',
      module: 'users', // changed from 'tests' to 'users'
      targetType: 'test',
      targetName: 'Test Target',
      details: { testData: true },
      description: 'Test log entry via logAdminAction function',
      request
    });
    console.log('logAdminAction() completed');

    // Test 3: Count total logs
    const totalLogs = await AdminLog.countDocuments();
    console.log('Total logs in database:', totalLogs);

    // Test 4: Get recent logs
    const recentLogs = await AdminLog.find().sort({ timestamp: -1 }).limit(5);
    console.log('Recent logs:', recentLogs.length);

    return NextResponse.json({
      success: true,
      message: 'Logging test completed',
      results: {
        directCreateSuccess: !!testLog._id,
        totalLogsInDB: totalLogs,
        recentLogsCount: recentLogs.length,
        testLogId: testLog._id,
        adminPayload: {
          id: (payload as any).id,
          name: (payload as any).name,
          email: (payload as any).email,
          role: (payload as any).role
        }
      },
      recentLogs: recentLogs.map(log => ({
        _id: log._id,
        adminName: log.adminName,
        action: log.action,
        module: log.module,
        description: log.description,
        timestamp: log.timestamp
      }))
    });

  } catch (error: any) {
    console.error('Logging test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
