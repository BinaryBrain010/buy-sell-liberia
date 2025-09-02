import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Announcement from '../../../models/Announcement';
import AnnouncementInteraction from '../../../models/AnnouncementInteraction';
import jwt from 'jsonwebtoken';

/**
 * GET /api/announcements
 * Get active announcements for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // popup, banner, email
    const includeDismissed = searchParams.get('includeDismissed') === 'true';

    // Get user ID from token (optional for public announcements)
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.id;
      } catch (error) {
        // Invalid token, but continue for public announcements
        console.log('Invalid token, showing public announcements only');
      }
    }

    // Build query for active announcements
    const now = new Date();
    let query: any = {
      isActive: true,
      $or: [
        { scheduleTime: { $lte: now } },
        { scheduleTime: { $exists: false } }
      ],
      $and: [
        {
          $or: [
            { expiryTime: { $gte: now } },
            { expiryTime: { $exists: false } }
          ]
        }
      ]
    };

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    // Filter by target audience
    if (userId) {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'specific', specificUsers: new mongoose.Types.ObjectId(userId) }
      ];
    } else {
      // Only show public announcements for non-authenticated users
      query.targetAudience = 'all';
    }

    // Get announcements
    let announcements = await Announcement.find(query)
      .select('_id title content type priority displaySettings created_at')
      .sort({ priority: -1, created_at: -1 });

    // If user is authenticated, filter out dismissed announcements (unless requested)
    if (userId && !includeDismissed) {
      const dismissedInteractions = await AnnouncementInteraction.find({
        userId: new mongoose.Types.ObjectId(userId),
        action: 'dismissed'
      }).select('announcementId');

      const dismissedIds = dismissedInteractions.map(interaction => 
        interaction.announcementId.toString()
      );

      announcements = announcements.filter(announcement => 
        !dismissedIds.includes(announcement._id.toString())
      );
    }

    return NextResponse.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
