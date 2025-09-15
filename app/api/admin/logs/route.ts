import { NextRequest, NextResponse } from 'next/server';
import AdminLog from '@/models/AdminLog';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { connectDB } from '@/lib/mongoose';

// GET: Get admin activity logs (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    // Auth: Only super_admin can view logs
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload as any).role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page
    const adminId = searchParams.get('adminId');
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // Build filter query
    const filter: any = {};
    
    if (adminId) filter.adminId = adminId;
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Text search in description, adminName, adminEmail
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await AdminLog.countDocuments(filter);
    
    // Get logs with pagination
    const logs = await AdminLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v')
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        adminId,
        module,
        action,
        targetType,
        targetId,
        startDate,
        endDate,
        search
      }
    });

  } catch (error: any) {
    console.error('[ADMIN LOGS] Error fetching logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin logs' },
      { status: 500 }
    );
  }
}

// GET stats endpoint for dashboard
export async function POST(request: NextRequest) {
  try {
    // Auth: Only super_admin can view stats
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload as any).role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Super Admin access required.' }, { status: 403 });
    }

    await connectDB();

    const { action } = await request.json();
    
    if (action === 'stats') {
      // Get activity stats
      const today = new Date();
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalLogs,
        logsLast7Days,
        logsLast30Days,
        topAdmins,
        topActions,
        topModules
      ] = await Promise.all([
        // Total logs
        AdminLog.countDocuments(),
        
        // Logs in last 7 days
        AdminLog.countDocuments({ timestamp: { $gte: last7Days } }),
        
        // Logs in last 30 days
        AdminLog.countDocuments({ timestamp: { $gte: last30Days } }),
        
        // Top 5 most active admins
        AdminLog.aggregate([
          { $group: { _id: '$adminEmail', count: { $sum: 1 }, name: { $first: '$adminName' } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        
        // Top 5 most common actions
        AdminLog.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        
        // Activity by module
        AdminLog.aggregate([
          { $group: { _id: '$module', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          totalLogs,
          logsLast7Days,
          logsLast30Days,
          topAdmins,
          topActions,
          topModules
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('[ADMIN LOGS] Error getting stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get admin log stats' },
      { status: 500 }
    );
  }
}
