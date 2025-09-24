import ActivityLog from "@/models/ActivityLog";
import Employee from "@/models/Employee";
import { Types } from "mongoose";
import crypto from "crypto";

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
  EMPLOYEE_BAN = "employee_ban",
  EMPLOYEE_UNBAN = "employee_unban",
  
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
  SETTINGS_RESET = "settings_reset",
  MONETIZATION_TOGGLE = "monetization_toggle",
  MONETIZATION_PRICES_UPDATE = "monetization_prices_update",
  MONETIZATION_PAYMENT_DETAILS_UPDATE = "monetization_payment_details_update",
  CURRENCY_UPDATE = "currency_update",
  BRANDING_UPDATE = "branding_update",
  LOGO_UPLOAD = "logo_upload",
  LOGO_DELETE = "logo_delete",
  LISTING_EXPIRATION_UPDATE = "listing_expiration_update",
  MAX_PHOTOS_UPDATE = "max_photos_update",
  REGISTRATION_TOGGLE = "registration_toggle",
  MAINTENANCE_MODE_TOGGLE = "maintenance_mode_toggle",
  
  // System Management
  SYSTEM_MAINTENANCE = "system_maintenance",
  DATA_EXPORT = "data_export",
  DATA_IMPORT = "data_import",
  
  // Reports Management
  REPORT_VIEW = "report_view",
  REPORT_ACTION = "report_action",
  REPORT_RESOLVE = "report_resolve",
  
  // Announcement Management
  ANNOUNCEMENT_CREATE = "announcement_create",
  ANNOUNCEMENT_UPDATE = "announcement_update",
  ANNOUNCEMENT_DELETE = "announcement_delete",
  ANNOUNCEMENT_SEND = "announcement_send",
  
  // Withdrawal Management
  WITHDRAWAL_CREATE = "withdrawal_create",
  
  // Message Management
  MESSAGE_DELETE = "message_delete",
  
  // Static Pages Management
  STATIC_PAGE_CREATE = "static_page_create",
  STATIC_PAGE_UPDATE = "static_page_update",
  STATIC_PAGE_DELETE = "static_page_delete"
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
  REPORT_MANAGEMENT = "report_management",
  ANNOUNCEMENT_MANAGEMENT = "announcement_management",
  MESSAGE_MANAGEMENT = "message_management",
  DATA_MANAGEMENT = "data_management"
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
  userRole?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Base Audit Logger Class
 */
export class AuditLogger {
  private userId: string | Types.ObjectId;
  private ipAddress?: string;
  private userAgent?: string;
  private userRole?: string;
  private userEmail?: string;
  private userName?: string;

  constructor(
    userId: string | Types.ObjectId, 
    ipAddress?: string, 
    userAgent?: string,
    userRole?: string,
    userEmail?: string,
    userName?: string
  ) {
    this.userId = userId;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.userRole = userRole;
    this.userEmail = userEmail;
    this.userName = userName;
  }

  /**
   * Create a new audit log entry
   */
  async log(entry: Omit<IAuditLogEntry, 'userId' | 'ipAddress' | 'userAgent' | 'userRole' | 'userEmail' | 'userName'>): Promise<void> {
    try {
      console.log('Creating audit log entry:', {
        userId: this.userId,
        module: entry.module,
        operation: entry.operation,
        entityId: entry.entityId,
        userRole: this.userRole,
        userEmail: this.userEmail
      });

      // Ensure userId is a valid ObjectId
      let userId: Types.ObjectId;
      if (Types.ObjectId.isValid(this.userId)) {
        userId = new Types.ObjectId(this.userId);
      } else {
        // For non-ObjectId user IDs, create a deterministic ObjectId based on the user identifier
        // This ensures the same user always gets the same ObjectId
        const userString = String(this.userId);
        const hash = crypto.createHash('md5').update(userString).digest('hex');
        const objectIdString = hash.substring(0, 24);
        userId = new Types.ObjectId(objectIdString);
        console.log('Created deterministic ObjectId for user:', this.userId, '->', userId.toString());
      }

      const logEntry = {
        user: userId,
        action: `${entry.module}.${entry.operation}`,
        details: this.formatDetails({
          ...entry,
          originalUserId: this.userId, // Store the original user identifier
          userRole: this.userRole,
          userEmail: this.userEmail,
          userName: this.userName,
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
  [OperationType.EMPLOYEE_BAN]: 'Banned employee',
  [OperationType.EMPLOYEE_UNBAN]: 'Unbanned employee',
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
      [OperationType.SETTINGS_RESET]: 'Reset settings',
      [OperationType.MONETIZATION_TOGGLE]: 'Toggled monetization',
      [OperationType.MONETIZATION_PRICES_UPDATE]: 'Updated monetization prices',
      [OperationType.MONETIZATION_PAYMENT_DETAILS_UPDATE]: 'Updated payment details',
      [OperationType.CURRENCY_UPDATE]: 'Updated currency',
      [OperationType.BRANDING_UPDATE]: 'Updated branding',
      [OperationType.LOGO_UPLOAD]: 'Uploaded logo',
      [OperationType.LOGO_DELETE]: 'Deleted logo',
      [OperationType.LISTING_EXPIRATION_UPDATE]: 'Updated listing expiration',
      [OperationType.MAX_PHOTOS_UPDATE]: 'Updated max photos',
      [OperationType.REGISTRATION_TOGGLE]: 'Toggled registration',
      [OperationType.MAINTENANCE_MODE_TOGGLE]: 'Toggled maintenance mode',
      [OperationType.SYSTEM_MAINTENANCE]: 'Performed system maintenance',
      [OperationType.DATA_EXPORT]: 'Exported data',
      [OperationType.DATA_IMPORT]: 'Imported data',
      [OperationType.REPORT_VIEW]: 'Viewed report',
      [OperationType.REPORT_ACTION]: 'Took action on report',
      [OperationType.REPORT_RESOLVE]: 'Resolved report',
      [OperationType.ANNOUNCEMENT_CREATE]: 'Created announcement',
      [OperationType.ANNOUNCEMENT_UPDATE]: 'Updated announcement',
      [OperationType.ANNOUNCEMENT_DELETE]: 'Deleted announcement',
      [OperationType.ANNOUNCEMENT_SEND]: 'Sent announcement',
      [OperationType.WITHDRAWAL_CREATE]: 'Created withdrawal log',
      [OperationType.MESSAGE_DELETE]: 'Deleted message',
      [OperationType.STATIC_PAGE_CREATE]: 'Created static page',
      [OperationType.STATIC_PAGE_UPDATE]: 'Updated static page',
      [OperationType.STATIC_PAGE_DELETE]: 'Deleted static page'
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
  userAgent?: string,
  userRole?: string,
  userEmail?: string,
  userName?: string
): AuditLogger {
  return new AuditLogger(userId, ipAddress, userAgent, userRole, userEmail, userName);
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
