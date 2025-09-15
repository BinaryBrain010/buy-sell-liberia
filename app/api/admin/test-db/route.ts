import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import AdminLog from '@/models/AdminLog';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection and AdminLog model...');
    
    await connectDB();
    console.log('Database connected');
    
    // Test: Create a simple log entry
    const testLog = await AdminLog.create({
      adminId: 'test-id-123',
      adminName: 'Test Admin',
      adminEmail: 'test@example.com',
      adminRole: 'super_admin',
      action: 'test_action',
      module: 'tests',
      description: 'Test log entry to verify database storage',
      timestamp: new Date()
    });
    
    console.log('Log created successfully:', testLog._id);
    
    // Test: Count all logs
    const totalLogs = await AdminLog.countDocuments();
    console.log('Total logs in DB:', totalLogs);
    
    // Test: Find the log we just created
    const foundLog = await AdminLog.findById(testLog._id);
    console.log('Found log:', !!foundLog);
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed successfully',
      results: {
        logCreated: !!testLog._id,
        logId: testLog._id,
        totalLogs,
        logFound: !!foundLog
      },
      createdLog: {
        _id: testLog._id,
        adminName: testLog.adminName,
        action: testLog.action,
        description: testLog.description,
        timestamp: testLog.timestamp
      }
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
