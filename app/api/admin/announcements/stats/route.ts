import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Announcement from '../../../../../models/Announcement';
import AnnouncementInteraction from '../../../../../models/AnnouncementInteraction';

/**
 * GET /api/admin/announcements/stats
 * Get comprehensive announcement statistics
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
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get basic announcement counts
    const [
      totalAnnouncements,
      activeAnnouncements,
      scheduledAnnouncements,
      expiredAnnouncements,
      sentAnnouncements
    ] = await Promise.all([
      Announcement.countDocuments(),
      Announcement.countDocuments({ isActive: true }),
      Announcement.countDocuments({ 
        isActive: true, 
        scheduleTime: { $gt: new Date() } 
      }),
      Announcement.countDocuments({ 
        isActive: true, 
        expiryTime: { $lt: new Date() } 
      }),
      Announcement.countDocuments({ sentAt: { $exists: true } })
    ]);

    // Get announcements by type
    const announcementsByType = await Announcement.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get announcements by priority
    const announcementsByPriority = await Announcement.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent announcement activity
    const recentActivity = await Announcement.find({
      created_at: { $gte: startDate }
    })
    .populate('createdBy', 'fullName username')
    .sort({ created_at: -1 })
    .limit(10)
    .select('title type priority created_at sentAt createdBy');

    // Get interaction statistics
    const interactionStats = await AnnouncementInteraction.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top performing announcements (by interactions)
    const topPerformingAnnouncements = await AnnouncementInteraction.aggregate([
      {
        $group: {
          _id: '$announcementId',
          totalInteractions: { $sum: 1 },
          views: {
            $sum: { $cond: [{ $eq: ['$action', 'viewed'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$action', 'clicked'] }, 1, 0] }
          },
          dismissals: {
            $sum: { $cond: [{ $eq: ['$action', 'dismissed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'announcements',
          localField: '_id',
          foreignField: '_id',
          as: 'announcement'
        }
      },
      {
        $unwind: '$announcement'
      },
      {
        $project: {
          title: '$announcement.title',
          type: '$announcement.type',
          priority: '$announcement.priority',
          totalInteractions: 1,
          views: 1,
          clicks: 1,
          dismissals: 1,
          clickThroughRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $multiply: [{ $divide: ['$clicks', '$views'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { totalInteractions: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get announcement effectiveness over time
    const effectivenessOverTime = await AnnouncementInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          interactions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate overall engagement metrics
    const totalInteractions = interactionStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalViews = interactionStats.find(stat => stat._id === 'viewed')?.count || 0;
    const totalClicks = interactionStats.find(stat => stat._id === 'clicked')?.count || 0;
    const totalDismissals = interactionStats.find(stat => stat._id === 'dismissed')?.count || 0;

    const overallMetrics = {
      totalInteractions,
      totalViews,
      totalClicks,
      totalDismissals,
      clickThroughRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
      dismissalRate: totalViews > 0 ? (totalDismissals / totalViews) * 100 : 0,
      engagementRate: totalViews > 0 ? ((totalClicks + totalDismissals) / totalViews) * 100 : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAnnouncements,
          activeAnnouncements,
          scheduledAnnouncements,
          expiredAnnouncements,
          sentAnnouncements
        },
        distribution: {
          byType: announcementsByType,
          byPriority: announcementsByPriority
        },
        recentActivity,
        interactions: {
          overall: overallMetrics,
          breakdown: interactionStats
        },
        topPerforming: topPerformingAnnouncements,
        effectivenessOverTime,
        timeRange: parseInt(timeRange)
      }
    });

  } catch (error) {
    console.error('Error fetching announcement statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
