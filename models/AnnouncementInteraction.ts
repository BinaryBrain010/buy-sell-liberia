import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnnouncementInteraction extends Document {
  announcementId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: 'viewed' | 'clicked' | 'dismissed';
  timestamp: Date;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
  };
}

export interface AnnouncementInteractionModel extends Model<IAnnouncementInteraction> {
  hasUserInteracted(announcementId: string, userId: string, action?: string): Promise<boolean>;
  recordInteraction(announcementId: string, userId: string, action: string, deviceInfo?: any): Promise<IAnnouncementInteraction>;
}

const announcementInteractionSchema = new Schema<IAnnouncementInteraction, AnnouncementInteractionModel>(
  {
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['viewed', 'clicked', 'dismissed'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
announcementInteractionSchema.index({ announcementId: 1, userId: 1 });
announcementInteractionSchema.index({ announcementId: 1, action: 1 });
announcementInteractionSchema.index({ userId: 1, timestamp: -1 });

// Static methods
announcementInteractionSchema.statics.hasUserInteracted = async function(
  announcementId: string, 
  userId: string, 
  action?: string
) {
  const query: any = {
    announcementId: new mongoose.Types.ObjectId(announcementId),
    userId: new mongoose.Types.ObjectId(userId),
  };
  
  if (action) {
    query.action = action;
  }
  
  const interaction = await this.findOne(query);
  return !!interaction;
};

announcementInteractionSchema.statics.recordInteraction = async function(
  announcementId: string,
  userId: string,
  action: string,
  deviceInfo?: any
) {
  return this.create({
    announcementId: new mongoose.Types.ObjectId(announcementId),
    userId: new mongoose.Types.ObjectId(userId),
    action,
    deviceInfo,
  });
};

// Use the existing model if it exists, otherwise create a new one
const AnnouncementInteraction = mongoose.models.AnnouncementInteraction || 
  mongoose.model<IAnnouncementInteraction, AnnouncementInteractionModel>("AnnouncementInteraction", announcementInteractionSchema);

export default AnnouncementInteraction;
