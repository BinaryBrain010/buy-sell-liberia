import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Announcement from '../../../../../models/Announcement';
import AnnouncementInteraction from '../../../../../models/AnnouncementInteraction';
import jwt from 'jsonwebtoken';

/**
 * POST /api/announcements/[id]/interact
 * Record user interaction with an announcement (view, click, dismiss)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: User must be logged in
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;
    const body = await request.json();
    const { action, deviceInfo } = body;

    // Validate announcement ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
    }

    // Validate action
    if (!['viewed', 'clicked', 'dismissed'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be: viewed, clicked, or dismissed' 
      }, { status: 400 });
    }

    // Check if announcement exists
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Check if announcement is active and not expired
    const now = new Date();
    if (!announcement.isActive) {
      return NextResponse.json({ error: 'Announcement is not active' }, { status: 400 });
    }

    if (announcement.expiryTime && announcement.expiryTime < now) {
      return NextResponse.json({ error: 'Announcement has expired' }, { status: 400 });
    }

    // Check if user has already performed this action (prevent duplicates)
    const existingInteraction = await AnnouncementInteraction.findOne({
      announcementId: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
      action: action
    });

    if (existingInteraction) {
      return NextResponse.json({
        success: true,
        message: 'Interaction already recorded',
        data: existingInteraction
      });
    }

    // Record the interaction
    const interaction = await AnnouncementInteraction.create({
      announcementId: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
      action,
      deviceInfo: deviceInfo || {},
      timestamp: new Date()
    });

    // Update announcement statistics
    const statField = `stats.total${action.charAt(0).toUpperCase() + action.slice(1)}`;
    await Announcement.findByIdAndUpdate(id, {
      $inc: { [statField]: 1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction recorded successfully',
      data: interaction
    });

  } catch (error) {
    console.error('Error recording announcement interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
