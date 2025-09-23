import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { Types } from "mongoose";

/**
 * Audit Log Levels
 */
export enum LogLevel {
  INFO = "info",
  WARNING = "warning", 
  ERROR = "error",
  SUCCESS = "success"
}

/**
 * Admin Operation Types
 */
export enum OperationType {
  // User Management
  USER_BAN = "user_ban",
  USER_UNBAN = "user_unban", 
  USER_BLOCK = "user_block",
  USER_UNBLOCK = "user_unblock",
  USER_PASSWORD_RESET = "user_password_reset",
  
  // Admin Management
  ADMIN_CREATE = "admin_create",
  ADMIN_UPDATE = "admin_update",
  ADMIN_DELETE = "admin_delete",
  
  // Employee Management
  EMPLOYEE_CREATE = "employee_create",
  EMPLOYEE_UPDATE = "employee_update",
  EMPLOYEE_DELETE = "employee_delete",
  
  // Listing Management
  LISTING_APPROVE = "listing_approve",
  LISTING_REJECT = "listing_reject",
  LISTING_FEATURE = "listing_feature",
  LISTING_UNFEATURE = "listing_unfeature",
  LISTING_DELETE = "listing_delete",
  
  // Payment Management
  PAYMENT_APPROVE = "payment_approve",
  PAYMENT_REJECT = "payment_reject",
  PAYMENT_PROCESS = "payment_process",
  
  // Category Management
  CATEGORY_CREATE = "category_create",
  CATEGORY_UPDATE = "category_update",
  CATEGORY_DELETE = "category_delete",
  CATEGORY_ACTIVATE = "category_activate",
  CATEGORY_DEACTIVATE = "category_deactivate",
  
  // Settings Management
  SETTINGS_UPDATE = "settings_update",
  MONETIZATION_TOGGLE = "monetization_toggle",
  CURRENCY_UPDATE = "currency_update",
  BRANDING_UPDATE = "branding_update",
  
  // System Management
  SYSTEM_MAINTENANCE = "system_maintenance",
  DATA_EXPORT = "data_export",
  DATA_IMPORT = "data_import",
  
  // Reports Management
  REPORT_VIEW = "report_view",
  REPORT_ACTION = "report_action",
  REPORT_RESOLVE = "report_resolve"
}

/**
 * Module Types
 */
export enum ModuleType {
  USER_MANAGEMENT = "user_management",
  LISTING_MANAGEMENT = "listing_management", 
  PAYMENT_MANAGEMENT = "payment_management",
  CATEGORY_MANAGEMENT = "category_management",
  SETTINGS_MANAGEMENT = "settings_management",
  SYSTEM_MANAGEMENT = "system_management",
  REPORT_MANAGEMENT = "report_management"
}

/**
 * Audit Log Entry Interface
 */
export interface IAuditLogEntry {
  userId: string | Types.ObjectId;
  module: ModuleType;
  operation: OperationType;
  entityId?: string | Types.ObjectId;
  entityType?: string;
  method?: string;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  originalUserId?: string | Types.ObjectId;
}

/**
 * Base Audit Logger Class
 */
export class AuditLogger {
  private userId: string | Types.ObjectId;
  private ipAddress?: string;
  private userAgent?: string;

  constructor(userId: string | Types.ObjectId, ipAddress?: string, userAgent?: string) {
    this.userId = userId;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
  }

  /**
   * Create a new audit log entry
   */
  async log(entry: Omit<IAuditLogEntry, 'userId' | 'ipAddress' | 'userAgent'>): Promise<void> {
    try {
      console.log('Creating audit log entry:', {
        userId: this.userId,
        module: entry.module,
        operation: entry.operation,
        entityId: entry.entityId
      });

      // Ensure userId is a valid ObjectId
      let userId: Types.ObjectId;
      if (Types.ObjectId.isValid(this.userId)) {
        userId = new Types.ObjectId(this.userId);
      } else {
        // Create a new ObjectId for non-ObjectId user IDs (like admin emails)
        userId = new Types.ObjectId();
        console.log('Created new ObjectId for user:', this.userId, '->', userId.toString());
      }

      const logEntry = {
        user: userId,
        action: `${entry.module}.${entry.operation}`,
        details: this.formatDetails({
          ...entry,
          originalUserId: this.userId, // Store the original user identifier
        }),
        createdAt: new Date(),
        ...(this.ipAddress && { ipAddress: this.ipAddress }),
        ...(this.userAgent && { userAgent: this.userAgent })
      };

      console.log('Log entry to be created:', logEntry);
      
      const result = await ActivityLog.create(logEntry);
      console.log('Audit log created successfully:', result._id);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Don't throw error to prevent breaking the main operation
    }
  }

  /**
   * Log user management operations
   */
  async logUserOperation(
    operation: OperationType,
    targetUserId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.USER_MANAGEMENT,
      operation,
      entityId: targetUserId,
      entityType: 'User',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'User', targetUserId),
      details
    });
  }

  /**
   * Log listing management operations
   */
  async logListingOperation(
    operation: OperationType,
    listingId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.LISTING_MANAGEMENT,
      operation,
      entityId: listingId,
      entityType: 'Product',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'Listing', listingId),
      details
    });
  }

  /**
   * Log payment management operations
   */
  async logPaymentOperation(
    operation: OperationType,
    paymentId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.PAYMENT_MANAGEMENT,
      operation,
      entityId: paymentId,
      entityType: 'Payment',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'Payment', paymentId),
      details
    });
  }

  /**
   * Log category management operations
   */
  async logCategoryOperation(
    operation: OperationType,
    categoryId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.CATEGORY_MANAGEMENT,
      operation,
      entityId: categoryId,
      entityType: 'Category',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'Category', categoryId),
      details
    });
  }

  /**
   * Log settings management operations
   */
  async logSettingsOperation(
    operation: OperationType,
    settingKey?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.SETTINGS_MANAGEMENT,
      operation,
      entityId: settingKey,
      entityType: 'Settings',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'Settings', settingKey),
      details
    });
  }

  /**
   * Log system management operations
   */
  async logSystemOperation(
    operation: OperationType,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.SYSTEM_MANAGEMENT,
      operation,
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'System'),
      details
    });
  }

  /**
   * Log report management operations
   */
  async logReportOperation(
    operation: OperationType,
    reportId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module: ModuleType.REPORT_MANAGEMENT,
      operation,
      entityId: reportId,
      entityType: 'Report',
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, 'Report', reportId),
      details
    });
  }

  /**
   * Log custom operations
   */
  async logCustomOperation(
    module: ModuleType,
    operation: OperationType,
    entityId?: string,
    entityType?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      module,
      operation,
      entityId,
      entityType,
      level: LogLevel.INFO,
      message: this.getOperationMessage(operation, entityType || 'Entity', entityId),
      details
    });
  }

  /**
   * Format details for storage
   */
  private formatDetails(entry: Omit<IAuditLogEntry, 'userId' | 'ipAddress' | 'userAgent'>): string {
    const details = {
      module: entry.module,
      operation: entry.operation,
      entityId: entry.entityId,
      entityType: entry.entityType,
      method: entry.method,
      level: entry.level,
      message: entry.message,
      timestamp: new Date().toISOString(),
      ...entry.details,
      ...entry.metadata
    };

    return JSON.stringify(details, null, 2);
  }

  /**
   * Generate operation message
   */
  private getOperationMessage(operation: OperationType, entityType: string, entityId?: string): string {
    const actionMap: Record<OperationType, string> = {
      [OperationType.USER_BAN]: 'Banned user',
      [OperationType.USER_UNBAN]: 'Unbanned user',
      [OperationType.USER_BLOCK]: 'Blocked user',
      [OperationType.USER_UNBLOCK]: 'Unblocked user',
      [OperationType.USER_PASSWORD_RESET]: 'Reset user password',
      [OperationType.ADMIN_CREATE]: 'Created admin',
      [OperationType.ADMIN_UPDATE]: 'Updated admin',
      [OperationType.ADMIN_DELETE]: 'Deleted admin',
      [OperationType.EMPLOYEE_CREATE]: 'Created employee',
      [OperationType.EMPLOYEE_UPDATE]: 'Updated employee',
      [OperationType.EMPLOYEE_DELETE]: 'Deleted employee',
      [OperationType.LISTING_APPROVE]: 'Approved listing',
      [OperationType.LISTING_REJECT]: 'Rejected listing',
      [OperationType.LISTING_FEATURE]: 'Featured listing',
      [OperationType.LISTING_UNFEATURE]: 'Unfeatured listing',
      [OperationType.LISTING_DELETE]: 'Deleted listing',
      [OperationType.PAYMENT_APPROVE]: 'Approved payment',
      [OperationType.PAYMENT_REJECT]: 'Rejected payment',
      [OperationType.PAYMENT_PROCESS]: 'Processed payment',
      [OperationType.CATEGORY_CREATE]: 'Created category',
      [OperationType.CATEGORY_UPDATE]: 'Updated category',
      [OperationType.CATEGORY_DELETE]: 'Deleted category',
      [OperationType.CATEGORY_ACTIVATE]: 'Activated category',
      [OperationType.CATEGORY_DEACTIVATE]: 'Deactivated category',
      [OperationType.SETTINGS_UPDATE]: 'Updated settings',
      [OperationType.MONETIZATION_TOGGLE]: 'Toggled monetization',
      [OperationType.CURRENCY_UPDATE]: 'Updated currency',
      [OperationType.BRANDING_UPDATE]: 'Updated branding',
      [OperationType.SYSTEM_MAINTENANCE]: 'Performed system maintenance',
      [OperationType.DATA_EXPORT]: 'Exported data',
      [OperationType.DATA_IMPORT]: 'Imported data',
      [OperationType.REPORT_VIEW]: 'Viewed report',
      [OperationType.REPORT_ACTION]: 'Took action on report',
      [OperationType.REPORT_RESOLVE]: 'Resolved report'
    };

    const action = actionMap[operation] || 'Performed action';
    const entityInfo = entityId ? ` (${entityId})` : '';
    return `${action} ${entityType}${entityInfo}`;
  }
}

/**
 * Factory function to create audit logger
 */
export function createAuditLogger(
  userId: string | Types.ObjectId,
  ipAddress?: string,
  userAgent?: string
): AuditLogger {
  return new AuditLogger(userId, ipAddress, userAgent);
}

/**
 * Helper function to extract IP and User Agent from request
 */
export function extractRequestInfo(request: Request): { ipAddress?: string; userAgent?: string } {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

/**
 * Async wrapper for operations with automatic logging
 */
export async function withAuditLog<T>(
  logger: AuditLogger,
  operation: () => Promise<T>,
  logConfig: {
    module: ModuleType;
    operation: OperationType;
    entityId?: string;
    entityType?: string;
    details?: Record<string, any>;
  }
): Promise<T> {
  try {
    const result = await operation();
    
    // Log successful operation
    await logger.logCustomOperation(
      logConfig.module,
      logConfig.operation,
      logConfig.entityId,
      logConfig.entityType,
      {
        ...logConfig.details,
        success: true,
        timestamp: new Date().toISOString()
      }
    );
    
    return result;
  } catch (error) {
    // Log failed operation
    await logger.logCustomOperation(
      logConfig.module,
      logConfig.operation,
      logConfig.entityId,
      logConfig.entityType,
      {
        ...logConfig.details,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    );
    
    throw error;
  }
}
