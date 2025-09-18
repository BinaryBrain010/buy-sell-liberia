import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditLogger } from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";
import dbConnect from "../../../../lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log('Test log endpoint called');
    
    // Ensure database connection
    await dbConnect();
    console.log('Database connected for test');
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    // Create a test logger
    const logger = createAdminAuditLogger(req, 'test-admin-id');
    console.log('Test logger created');
    
    // Try to log a simple operation with structured data
    await logger.logCustomOperation(
      ModuleType.SYSTEM_MANAGEMENT,
      OperationType.SYSTEM_MAINTENANCE,
      'test-entity-id',
      'Test',
      {
        test: true,
        message: 'This is a test log entry',
        adminAction: 'Testing audit system',
        summary: 'Test maintenance operation to verify structured logging',
        timestamp: new Date().toISOString()
      }
    );
    
    // Log a user operation
    await logger.logUserOperation(OperationType.USER_BAN, 'test-user-123', {
      reason: 'Test ban for audit logging',
      adminAction: 'Testing user management audit',
      summary: 'Test ban operation to verify user audit logging'
    });
    
    console.log('Test log operation completed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test log created successfully' 
    });
  } catch (error: any) {
    console.error('Test log error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create test log',
      stack: error.stack 
    }, { status: 500 });
  }
}
