/**
 * Audit Logger Usage Examples
 * 
 * This file demonstrates how to use the audit logging system
 * across different admin operations.
 */

import { createAuditLogger, OperationType, ModuleType, withAuditLog } from './audit-logger';
import { createAdminAuditLogger } from './admin-audit-middleware';

/**
 * Example 1: Basic Usage in Admin Route
 */
export async function exampleUserBanRoute(request: Request, adminUserId: string) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  // Perform the ban operation
  const user = await banUser(userId);
  
  // Log the operation
  await logger.logUserOperation(OperationType.USER_BAN, userId, {
    banReason: 'Violation of terms',
    userEmail: user.email,
    previousStatus: 'active',
    newStatus: 'banned'
  });
  
  return user;
}

/**
 * Example 2: Using the withAuditLog wrapper
 */
export async function examplePaymentApproval(request: Request, adminUserId: string, paymentId: string) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  return await withAuditLog(
    logger,
    async () => {
      // Your payment approval logic here
      const payment = await approvePayment(paymentId);
      return payment;
    },
    {
      module: ModuleType.PAYMENT_MANAGEMENT,
      operation: OperationType.PAYMENT_APPROVE,
      entityId: paymentId,
      entityType: 'Payment',
      details: {
        amount: 100,
        currency: 'USD',
        adminUserId
      }
    }
  );
}

/**
 * Example 3: Custom Operation Logging
 */
export async function exampleCustomOperation(request: Request, adminUserId: string) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  // Log a custom system operation
  await logger.logCustomOperation(
    ModuleType.SYSTEM_MANAGEMENT,
    OperationType.SYSTEM_MAINTENANCE,
    'maintenance-001',
    'System',
    {
      maintenanceType: 'database_cleanup',
      duration: '2 hours',
      affectedRecords: 1500
    }
  );
}

/**
 * Example 4: Batch Operations
 */
export async function exampleBatchOperations(request: Request, adminUserId: string, userIds: string[]) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  // Log each operation individually
  for (const userId of userIds) {
    await logger.logUserOperation(OperationType.USER_BLOCK, userId, {
      batchOperation: true,
      totalUsers: userIds.length,
      adminUserId
    });
  }
}

/**
 * Example 5: Error Handling
 */
export async function exampleWithErrorHandling(request: Request, adminUserId: string, listingId: string) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  try {
    // Attempt to feature the listing
    const listing = await featureListing(listingId);
    
    // Log successful operation
    await logger.logListingOperation(OperationType.LISTING_FEATURE, listingId, {
      success: true,
      adminUserId,
      listingTitle: listing.title
    });
    
    return listing;
  } catch (error) {
    // Log failed operation
    await logger.logCustomOperation(
      ModuleType.LISTING_MANAGEMENT,
      OperationType.LISTING_FEATURE,
      listingId,
      'Product',
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId
      }
    );
    
    throw error;
  }
}

/**
 * Example 6: Settings Update with Detailed Logging
 */
export async function exampleSettingsUpdate(request: Request, adminUserId: string, settings: any) {
  const logger = createAdminAuditLogger(request, adminUserId);
  
  // Get previous settings for comparison
  const previousSettings = await getCurrentSettings();
  
  // Update settings
  const updatedSettings = await updateSettings(settings);
  
  // Log the changes
  await logger.logSettingsOperation(OperationType.SETTINGS_UPDATE, 'general', {
    adminUserId,
    changes: settings,
    previousSettings,
    updatedSettings,
    changeCount: Object.keys(settings).length
  });
  
  return updatedSettings;
}

// Mock functions for examples
async function banUser(userId: string) {
  return { id: userId, email: 'user@example.com' };
}

async function approvePayment(paymentId: string) {
  return { id: paymentId, status: 'approved' };
}

async function featureListing(listingId: string) {
  return { id: listingId, title: 'Sample Listing' };
}

async function getCurrentSettings() {
  return { theme: 'light', language: 'en' };
}

async function updateSettings(settings: any) {
  return { ...settings, updatedAt: new Date() };
}
