import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Announcement from '../../../../../models/Announcement';
import AnnouncementInteraction from '../../../../../models/AnnouncementInteraction';
import User from '../../../../../models/User';
import Chat from '../../../../../models/Chat';

/**
 * GET /api/admin/announcements/[id]
 * Get a specific announcement by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    // Get announcement with interactions
    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'fullName username email')
      .populate('specificUsers', 'fullName username email');

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Get interaction statistics
    const interactions = await AnnouncementInteraction.aggregate([
      { $match: { announcementId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      }
    ]);

    const interactionStats = {
      viewed: 0,
      clicked: 0,
      dismissed: 0,
      viewedUsers: [],
      clickedUsers: [],
      dismissedUsers: []
    };

    interactions.forEach(interaction => {
      interactionStats[interaction._id as keyof typeof interactionStats] = interaction.count;
      interactionStats[`${interaction._id}Users` as keyof typeof interactionStats] = interaction.users;
    });

    return NextResponse.json({
      success: true,
      data: {
        announcement,
        interactionStats
      }
    });

  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/announcements/[id]
 * Update an announcement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    // Check if announcement exists
    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    const allowedFields = [
      'title', 'content', 'type', 'priority', 'targetAudience', 
      'specificUsers', 'isActive', 'scheduleTime', 'expiryTime', 'displaySettings'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'specificUsers') {
          updateData[field] = body[field].map((id: string) => new mongoose.Types.ObjectId(id));
        } else if (field === 'scheduleTime' || field === 'expiryTime') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Update announcement
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'fullName username email')
     .populate('specificUsers', 'fullName username email');

    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully'
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Delete an announcement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    // Check if announcement exists
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Delete announcement and its interactions
    await Promise.all([
      Announcement.findByIdAndDelete(id),
      AnnouncementInteraction.deleteMany({ announcementId: id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
