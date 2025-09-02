import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import UserMessageQueue from '../../../../../models/UserMessageQueue';
import AnnouncementInteraction from '../../../../../models/AnnouncementInteraction';

/**
 * POST /api/admin/announcements/cleanup
 * Clean up expired messages and old interactions
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: Only admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    const { 
      cleanupExpiredMessages = true, 
      cleanupOldInteractions = true,
      oldInteractionDays = 90 
    } = body;

    const results = {
      expiredMessagesDeleted: 0,
      oldInteractionsDeleted: 0,
      errors: [] as string[]
    };

    // Clean up expired messages
    if (cleanupExpiredMessages) {
      try {
        results.expiredMessagesDeleted = await UserMessageQueue.cleanupExpiredMessages();
      } catch (error) {
        console.error('Error cleaning up expired messages:', error);
        results.errors.push('Failed to clean up expired messages');
      }
    }

    // Clean up old interactions
    if (cleanupOldInteractions) {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - oldInteractionDays);
        
        const deleteResult = await AnnouncementInteraction.deleteMany({
          timestamp: { $lt: cutoffDate }
        });
        
        results.oldInteractionsDeleted = deleteResult.deletedCount || 0;
      } catch (error) {
        console.error('Error cleaning up old interactions:', error);
        results.errors.push('Failed to clean up old interactions');
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Cleanup completed. Deleted ${results.expiredMessagesDeleted} expired messages and ${results.oldInteractionsDeleted} old interactions.`
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/announcements/cleanup
 * Get cleanup statistics (what would be cleaned up)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth: Only admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !['admin', 'super_admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const oldInteractionDays = parseInt(searchParams.get('oldInteractionDays') || '90');

    // Count expired messages
    const expiredMessagesCount = await UserMessageQueue.countDocuments({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { queuedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } // 90 days old
      ]
    });

    // Count old interactions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - oldInteractionDays);
    const oldInteractionsCount = await AnnouncementInteraction.countDocuments({
      timestamp: { $lt: cutoffDate }
    });

    // Get storage statistics
    const [
      totalQueuedMessages,
      deliveredMessages,
      pendingMessages,
      totalInteractions
    ] = await Promise.all([
      UserMessageQueue.countDocuments(),
      UserMessageQueue.countDocuments({ isDelivered: true }),
      UserMessageQueue.countDocuments({ isDelivered: false }),
      AnnouncementInteraction.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cleanup: {
          expiredMessagesCount,
          oldInteractionsCount,
          oldInteractionDays
        },
        statistics: {
          totalQueuedMessages,
          deliveredMessages,
          pendingMessages,
          totalInteractions
        },
        recommendations: {
          shouldCleanup: expiredMessagesCount > 0 || oldInteractionsCount > 0,
          estimatedSpaceSaved: `${expiredMessagesCount + oldInteractionsCount} documents`
        }
      }
    });

  } catch (error) {
    console.error('Error getting cleanup statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
