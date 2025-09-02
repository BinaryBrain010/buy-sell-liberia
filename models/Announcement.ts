import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: 'popup' | 'email' | 'banner' | 'chat';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'buyers' | 'sellers' | 'premium' | 'specific';
  specificUsers?: mongoose.Types.ObjectId[];
  isActive: boolean;
  scheduleTime?: Date;
  expiryTime?: Date;
  displaySettings: {
    showOnDashboard?: boolean;
    showOnHomepage?: boolean;
    dismissible?: boolean;
    autoCloseAfter?: number; // seconds
  };
  stats: {
    totalSent: number;
    totalViewed: number;
    totalClicked: number;
    totalDismissed: number;
  };
  createdBy: mongoose.Types.ObjectId;
  sentAt?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AnnouncementModel extends Model<IAnnouncement> {
  getActiveAnnouncements(userId?: string): Promise<IAnnouncement[]>;
  getScheduledAnnouncements(): Promise<IAnnouncement[]>;
  markAsViewed(announcementId: string, userId: string): Promise<void>;
  markAsClicked(announcementId: string, userId: string): Promise<void>;
  markAsDismissed(announcementId: string, userId: string): Promise<void>;
}

const announcementSchema = new Schema<IAnnouncement, AnnouncementModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['popup', 'email', 'banner', 'chat'],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'buyers', 'sellers', 'premium', 'specific'],
      default: 'all',
      index: true,
    },
    specificUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    scheduleTime: {
      type: Date,
      index: true,
    },
    expiryTime: {
      type: Date,
      index: true,
    },
    displaySettings: {
      showOnDashboard: {
        type: Boolean,
        default: true,
      },
      showOnHomepage: {
        type: Boolean,
        default: false,
      },
      dismissible: {
        type: Boolean,
        default: true,
      },
      autoCloseAfter: {
        type: Number,
        default: 0, // 0 means no auto-close
      },
    },
    stats: {
      totalSent: {
        type: Number,
        default: 0,
      },
      totalViewed: {
        type: Number,
        default: 0,
      },
      totalClicked: {
        type: Number,
        default: 0,
      },
      totalDismissed: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for better query performance
announcementSchema.index({ isActive: 1, scheduleTime: 1 });
announcementSchema.index({ isActive: 1, expiryTime: 1 });
announcementSchema.index({ type: 1, isActive: 1 });
announcementSchema.index({ targetAudience: 1, isActive: 1 });
announcementSchema.index({ priority: 1, created_at: -1 });

// Static methods
announcementSchema.statics.getActiveAnnouncements = async function(userId?: string) {
  const now = new Date();
  const baseQuery: any = {
    isActive: true,
    $and: [
      {
        $or: [
          { scheduleTime: { $lte: now } },
          { scheduleTime: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiryTime: { $gte: now } },
          { expiryTime: { $exists: false } }
        ]
      }
    ]
  };

  if (userId) {
    baseQuery.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'buyers' },
      { targetAudience: 'sellers' },
      { targetAudience: 'premium' },
      { targetAudience: 'specific', specificUsers: new mongoose.Types.ObjectId(userId) }
    ];
  }

  return this.find(baseQuery)
    .populate('createdBy', 'fullName username')
    .sort({ priority: -1, created_at: -1 });
};

announcementSchema.statics.getScheduledAnnouncements = async function() {
  const now = new Date();
  return this.find({
    isActive: true,
    scheduleTime: { $gt: now }
  }).sort({ scheduleTime: 1 });
};

announcementSchema.statics.markAsViewed = async function(announcementId: string, userId: string) {
  await this.findByIdAndUpdate(announcementId, {
    $inc: { 'stats.totalViewed': 1 }
  });
};

announcementSchema.statics.markAsClicked = async function(announcementId: string, userId: string) {
  await this.findByIdAndUpdate(announcementId, {
    $inc: { 'stats.totalClicked': 1 }
  });
};

announcementSchema.statics.markAsDismissed = async function(announcementId: string, userId: string) {
  await this.findByIdAndUpdate(announcementId, {
    $inc: { 'stats.totalDismissed': 1 }
  });
};

// Use the existing model if it exists, otherwise create a new one
const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement, AnnouncementModel>("Announcement", announcementSchema);
export default Announcement;
