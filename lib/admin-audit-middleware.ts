import { NextRequest } from "next/server";
import { createAuditLogger, extractRequestInfo, AuditLogger, ModuleType, OperationType } from "./audit-logger";

// Re-export the enums and functions for easier importing
export { ModuleType, OperationType, createAuditLogger, extractRequestInfo } from "./audit-logger";

/**
 * Admin Audit Middleware
 * Provides easy integration with admin API routes
 */

/**
 * Create audit logger from request
 */
export function createAdminAuditLogger(
  request: NextRequest, 
  userId: string, 
  userRole?: string, 
  userEmail?: string, 
  userName?: string
): AuditLogger {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  return createAuditLogger(userId, ipAddress, userAgent, userRole, userEmail, userName);
}

/**
 * Higher-order function to wrap admin operations with audit logging
 */
export function withAdminAudit<T>(
  operation: (logger: AuditLogger) => Promise<T>,
  config: {
    module: ModuleType;
    operation: OperationType;
    entityId?: string;
    entityType?: string;
    details?: Record<string, any>;
  }
) {
  return async (request: NextRequest, userId: string): Promise<T> => {
    const logger = createAdminAuditLogger(request, userId);
    
    try {
      const result = await operation(logger);
      
      // Log successful operation
      await logger.logCustomOperation(
        config.module,
        config.operation,
        config.entityId,
        config.entityType,
        {
          ...config.details,
          success: true,
          timestamp: new Date().toISOString()
        }
      );
      
      return result;
    } catch (error) {
      // Log failed operation
      await logger.logCustomOperation(
        config.module,
        config.operation,
        config.entityId,
        config.entityType,
        {
          ...config.details,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      );
      
      throw error;
    }
  };
}

/**
 * Common admin operation wrappers
 */
export const AdminAuditOperations = {
  /**
   * User ban operation
   */
  userBan: (userId: string, targetUserId: string, reason?: string) =>
    withAdminAudit(
      async (logger) => {
        // This will be implemented in the actual route
        return { success: true };
      },
      {
        module: ModuleType.USER_MANAGEMENT,
        operation: OperationType.USER_BAN,
        entityId: targetUserId,
        entityType: 'User',
        details: { reason, adminUserId: userId }
      }
    ),

  /**
   * User unban operation
   */
  userUnban: (userId: string, targetUserId: string) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.USER_MANAGEMENT,
        operation: OperationType.USER_UNBAN,
        entityId: targetUserId,
        entityType: 'User',
        details: { adminUserId: userId }
      }
    ),

  /**
   * Payment approval operation
   */
  paymentApprove: (userId: string, paymentId: string, amount?: number) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.PAYMENT_MANAGEMENT,
        operation: OperationType.PAYMENT_APPROVE,
        entityId: paymentId,
        entityType: 'Payment',
        details: { adminUserId: userId, amount }
      }
    ),

  /**
   * Payment rejection operation
   */
  paymentReject: (userId: string, paymentId: string, reason?: string) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.PAYMENT_MANAGEMENT,
        operation: OperationType.PAYMENT_REJECT,
        entityId: paymentId,
        entityType: 'Payment',
        details: { adminUserId: userId, reason }
      }
    ),

  /**
   * Listing feature operation
   */
  listingFeature: (userId: string, listingId: string, featured: boolean) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.LISTING_MANAGEMENT,
        operation: featured ? OperationType.LISTING_FEATURE : OperationType.LISTING_UNFEATURE,
        entityId: listingId,
        entityType: 'Product',
        details: { adminUserId: userId, featured }
      }
    ),

  /**
   * Category update operation
   */
  categoryUpdate: (userId: string, categoryId: string, changes: Record<string, any>) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.CATEGORY_MANAGEMENT,
        operation: OperationType.CATEGORY_UPDATE,
        entityId: categoryId,
        entityType: 'Category',
        details: { adminUserId: userId, changes }
      }
    ),

  /**
   * Settings update operation
   */
  settingsUpdate: (userId: string, settingKey: string, changes: Record<string, any>) =>
    withAdminAudit(
      async (logger) => {
        return { success: true };
      },
      {
        module: ModuleType.SETTINGS_MANAGEMENT,
        operation: OperationType.SETTINGS_UPDATE,
        entityId: settingKey,
        entityType: 'Settings',
        details: { adminUserId: userId, changes }
      }
    )
};

/**
 * Extract user information from JWT payload
 */
export function extractUserInfoFromPayload(payload: any): {
  userId: string;
  role: string;
  email: string;
  name: string;
} {
  return {
    userId: payload._id || payload.id || payload.email || 'unknown',
    role: payload.role || 'unknown',
    email: payload.email || 'unknown',
    name: payload.name || 'unknown'
  };
}

/**
 * Extract user ID from JWT token
 */
export function extractUserIdFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    // You'll need to implement JWT verification here
    // For now, return a placeholder
    return 'admin-user-id';
  } catch (error) {
    return null;
  }
}
