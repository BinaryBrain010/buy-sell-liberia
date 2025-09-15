import AdminLog from '@/models/AdminLog';
import { connectDB } from '@/lib/mongoose';
import { NextRequest } from 'next/server';

export interface LogAdminActionParams {
  // Admin/Employee info
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  
  // Action details
  action: string;
  module: 'users' | 'listings' | 'payments' | 'settings' | 'categories' | 'reports' | 'admins';
  
  // Target details (optional)
  targetType?: string;
  targetId?: string;
  targetName?: string;
  
  // Action context
  details?: Record<string, any>;
  description?: string;
  
  // Request metadata (optional)
  request?: NextRequest;
}

/**
 * Log admin action to database
 * 
 * @example
 * await logAdminAction({
 *   adminId: payload.id,
 *   adminName: payload.name,
 *   adminEmail: payload.email,
 *   adminRole: payload.role,
 *   action: 'banned_user',
 *   module: 'users',
 *   targetType: 'user',
 *   targetId: userId,
 *   targetName: user.fullName,
 *   details: { reason: 'Spam activity', previousStatus: 'active' },
 *   description: `Banned user ${user.fullName} (ID: ${userId}) for spam activity`,
 *   request
 * });
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    await connectDB();

    const {
      adminId,
      adminName,
      adminEmail,
      adminRole,
      action,
      module,
      targetType,
      targetId,
      targetName,
      details = {},
      description,
      request
    } = params;

    // Generate description if not provided
    const finalDescription = description || generateDescription(params);

    // Extract request metadata
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = getClientIP(request);
      userAgent = request.headers.get('user-agent') || undefined;
    }

    // Create log entry
    const logEntry = await AdminLog.create({
      adminId,
      adminName,
      adminEmail,
      adminRole,
      action,
      module,
      targetType,
      targetId: targetId ? targetId : undefined,
      targetName,
      details,
      description: finalDescription,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    console.log(`[AUDIT LOG SAVED] Log entry created with ID: ${logEntry._id}`);

    console.log(`[AUDIT LOG] ${adminName} (${adminRole}): ${finalDescription}`);
  } catch (error) {
    console.error('[AUDIT LOG ERROR] Failed to log admin action:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Generate human-readable description from action params
 */
function generateDescription(params: LogAdminActionParams): string {
  const { adminName, action, module, targetType, targetName, targetId } = params;
  
  const target = targetName || (targetId ? `${targetType} ID: ${targetId}` : '');
  const timestamp = new Date().toISOString();
  
  switch (action) {
    case 'banned_user':
      return `${adminName} banned user ${target} at ${timestamp}`;
    case 'unbanned_user':
      return `${adminName} unbanned user ${target} at ${timestamp}`;
    case 'blocked_user':
      return `${adminName} blocked user ${target} at ${timestamp}`;
    case 'unblocked_user':
      return `${adminName} unblocked user ${target} at ${timestamp}`;
    case 'reset_user_password':
      return `${adminName} reset password for user ${target} at ${timestamp}`;
    case 'approved_listing':
      return `${adminName} approved listing ${target} at ${timestamp}`;
    case 'rejected_listing':
      return `${adminName} rejected listing ${target} at ${timestamp}`;
    case 'deleted_listing':
      return `${adminName} deleted listing ${target} at ${timestamp}`;
    case 'featured_listing':
      return `${adminName} featured listing ${target} at ${timestamp}`;
    case 'approved_payment':
      return `${adminName} approved payment ${target} at ${timestamp}`;
    case 'rejected_payment':
      return `${adminName} rejected payment ${target} at ${timestamp}`;
    case 'toggled_monetization':
      return `${adminName} toggled monetization at ${timestamp}`;
    case 'updated_settings':
      return `${adminName} updated ${module} settings at ${timestamp}`;
    case 'created_category':
      return `${adminName} created category ${target} at ${timestamp}`;
    case 'updated_category':
      return `${adminName} updated category ${target} at ${timestamp}`;
    case 'deleted_category':
      return `${adminName} deleted category ${target} at ${timestamp}`;
    case 'approved_report':
      return `${adminName} approved report ${target} at ${timestamp}`;
    case 'rejected_report':
      return `${adminName} rejected report ${target} at ${timestamp}`;
    case 'created_admin':
      return `${adminName} created admin ${target} at ${timestamp}`;
    case 'updated_admin':
      return `${adminName} updated admin ${target} at ${timestamp}`;
    case 'deleted_admin':
      return `${adminName} deleted admin ${target} at ${timestamp}`;
    case 'reset_admin_password':
      return `${adminName} reset password for admin ${target} at ${timestamp}`;
    default:
      return `${adminName} performed ${action} on ${module} ${target} at ${timestamp}`;
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (xClientIP) {
    return xClientIP;
  }
  
  return 'unknown';
}

/**
 * Middleware wrapper for Next.js API routes to automatically extract admin info
 */
export function createAdminLogger(
  module: LogAdminActionParams['module'],
  action: string,
  getTargetInfo?: (params: any) => {
    targetType?: string;
    targetId?: string;
    targetName?: string;
    details?: Record<string, any>;
  }
) {
  return async (
    adminPayload: any,
    request: NextRequest,
    actionParams?: any
  ) => {
    const targetInfo = getTargetInfo ? getTargetInfo(actionParams) : {};
    
    await logAdminAction({
      adminId: adminPayload.id || adminPayload.adminId || 'unknown',
      adminName: adminPayload.name || adminPayload.adminName || 'Unknown Admin',
      adminEmail: adminPayload.email || adminPayload.adminEmail || 'unknown@admin.com',
      adminRole: adminPayload.role || 'unknown',
      action,
      module,
      ...targetInfo,
      request
    });
  };
}

/**
 * Quick logging functions for common actions
 */
export const QuickLog = {
  userBanned: async (adminPayload: any, userId: string, userName: string, reason?: string, request?: NextRequest) => {
    console.log('[QUICKLOG] userBanned called with:', { adminPayload, userId, userName, reason });
    return logAdminAction({
      adminId: adminPayload.id || adminPayload.adminId || 'unknown',
      adminName: adminPayload.name || 'Unknown Admin',
      adminEmail: adminPayload.email || 'unknown@admin.com',
      adminRole: adminPayload.role || 'unknown',
      action: 'banned_user',
      module: 'users',
      targetType: 'user',
      targetId: userId,
      targetName: userName,
      details: { reason },
      request
    });
  },

  listingApproved: async (adminPayload: any, listingId: string, listingTitle: string, request?: NextRequest) => {
    console.log('[QUICKLOG] listingApproved called with:', { adminPayload, listingId, listingTitle });
    return logAdminAction({
      adminId: adminPayload.id || adminPayload.adminId || 'unknown',
      adminName: adminPayload.name || 'Unknown Admin',
      adminEmail: adminPayload.email || 'unknown@admin.com',
      adminRole: adminPayload.role || 'unknown',
      action: 'approved_listing',
      module: 'listings',
      targetType: 'listing',
      targetId: listingId,
      targetName: listingTitle,
      request
    });
  },

  paymentApproved: async (adminPayload: any, paymentId: string, amount: number, request?: NextRequest) => {
    console.log('[QUICKLOG] paymentApproved called with:', { adminPayload, paymentId, amount });
    return logAdminAction({
      adminId: adminPayload.id || adminPayload.adminId || 'unknown',
      adminName: adminPayload.name || 'Unknown Admin',
      adminEmail: adminPayload.email || 'unknown@admin.com',
      adminRole: adminPayload.role || 'unknown',
      action: 'approved_payment',
      module: 'payments',
      targetType: 'payment',
      targetId: paymentId,
      targetName: `Payment of ${amount}`,
      details: { amount },
      request
    });
  },

  settingsUpdated: async (adminPayload: any, settingKeys: string[], request?: NextRequest) => {
    console.log('[QUICKLOG] settingsUpdated called with:', { adminPayload, settingKeys });
    return logAdminAction({
      adminId: adminPayload.id || adminPayload.adminId || 'unknown',
      adminName: adminPayload.name || 'Unknown Admin',
      adminEmail: adminPayload.email || 'unknown@admin.com',
      adminRole: adminPayload.role || 'unknown',
      action: 'updated_settings',
      module: 'settings',
      details: { updatedKeys: settingKeys },
      description: `${adminPayload.name || 'Unknown Admin'} updated settings: ${settingKeys.join(', ')}`,
      request
    });
  }
};
