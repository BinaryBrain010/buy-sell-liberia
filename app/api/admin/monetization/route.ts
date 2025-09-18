import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';
import { createAdminAuditLogger } from '../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from '../../../../lib/audit-logger';
import { ensureModelsRegistered } from '../../../../lib/ensure-models';
import dbConnect from '../../../../lib/mongoose';

// GET: Get all monetization settings (prices and payment details)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await SettingsService.getAllSettings();
    return NextResponse.json({
      prices: settings.monetizationPrices || {},
      paymentDetails: settings.monetizationPaymentDetails || {},
      enabled: settings.monetizationEnabled
    });
  } catch (error: any) {
    console.error('Error in /api/admin/monetization GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Update monetization settings (prices or payment details)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract admin user ID - try different possible fields
    let adminUserId = payload._id || payload.id || payload.userId;
    
    // If we have an email but no ID, use email as identifier
    if (!adminUserId && payload.email) {
      adminUserId = payload.email;
    }
    
    // If still no ID, create a fallback
    if (!adminUserId) {
      adminUserId = `admin-unknown-${Date.now()}`;
    }
    
    console.log('Admin payload:', payload);
    console.log('Admin user ID:', adminUserId);
    console.log('Admin email:', payload.email);
    console.log('Admin role:', payload.role);
    
    // Ensure database connection
    await dbConnect();
    console.log('Database connected');
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { prices, paymentDetails, enabled } = await req.json();
    
    // Create audit logger
    const logger = createAdminAuditLogger(req, adminUserId);
    console.log('Logger created for user:', adminUserId);
    
    const updates: any = {};
    const changes: Record<string, any> = {};
    
    if (prices !== undefined) {
      updates.monetizationPrices = prices;
      changes.prices = prices;
    }
    if (paymentDetails !== undefined) {
      updates.monetizationPaymentDetails = paymentDetails;
      changes.paymentDetails = paymentDetails;
    }
    if (typeof enabled === 'boolean') {
      updates.monetizationEnabled = enabled;
      changes.enabled = enabled;
    }

    await SettingsService.updateSettings(updates);

    // Log the settings update operation
    console.log('Attempting to log settings operation...');
    try {
      await logger.logSettingsOperation(OperationType.SETTINGS_UPDATE, 'monetization', {
        adminUserId,
        adminEmail: payload.email,
        adminRole: payload.role,
        changes: {
          prices: updates.monetizationPrices ? {
            featured_listing: updates.monetizationPrices.featured_listing,
            premium_listing: updates.monetizationPrices.premium_listing,
            urgent_listing: updates.monetizationPrices.urgent_listing,
            bump_listing: updates.monetizationPrices.bump_listing
          } : 'unchanged',
          paymentDetails: updates.monetizationPaymentDetails ? 'updated' : 'unchanged',
          enabled: typeof enabled === 'boolean' ? enabled : 'unchanged'
        },
        previousSettings: {
          prices: updates.monetizationPrices ? 'updated' : 'unchanged',
          paymentDetails: updates.monetizationPaymentDetails ? 'updated' : 'unchanged',
          enabled: typeof enabled === 'boolean' ? 'updated' : 'unchanged'
        },
        summary: `Updated monetization settings: ${updates.monetizationPrices ? 'prices ' : ''}${updates.monetizationPaymentDetails ? 'payment details ' : ''}${typeof enabled === 'boolean' ? 'enabled status' : ''}`.trim()
      });
      console.log('Settings operation logged successfully');
    } catch (logError) {
      console.error('Failed to log settings operation:', logError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/admin/monetization POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
