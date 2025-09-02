import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserMessageQueue extends Document {
  userId: mongoose.Types.ObjectId;
  announcementId: mongoose.Types.ObjectId;
  messageType: 'announcement' | 'system' | 'admin';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  showAsToast: boolean;
  showInChat: boolean;
  isDelivered: boolean;
  deliveredAt?: Date;
  queuedAt: Date;
  expiresAt?: Date;
  metadata?: {
    announcementType?: string;
    originalSender?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
}

export interface UserMessageQueueModel extends Model<IUserMessageQueue> {
  queueMessageForUser(userId: string, announcementId: string, messageData: any): Promise<IUserMessageQueue>;
  getQueuedMessagesForUser(userId: string, markAsDelivered?: boolean): Promise<IUserMessageQueue[]>;
  markAsDelivered(messageId: string): Promise<void>;
  cleanupExpiredMessages(): Promise<number>;
  queueAnnouncementForAllUsers(announcement: any, excludeUserIds?: string[]): Promise<number>;
}

const userMessageQueueSchema = new Schema<IUserMessageQueue, UserMessageQueueModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ['announcement', 'system', 'admin'],
      default: 'announcement',
      index: true,
    },
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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    showAsToast: {
      type: Boolean,
      default: true,
    },
    showInChat: {
      type: Boolean,
      default: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    queuedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
userMessageQueueSchema.index({ userId: 1, isDelivered: 1 });
userMessageQueueSchema.index({ userId: 1, queuedAt: -1 });
userMessageQueueSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
userMessageQueueSchema.index({ isDelivered: 1, queuedAt: 1 });

// Static methods
userMessageQueueSchema.statics.queueMessageForUser = async function(
  userId: string,
  announcementId: string,
  messageData: any
) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30); // Messages expire after 30 days

  return this.create({
    userId: new mongoose.Types.ObjectId(userId),
    announcementId: new mongoose.Types.ObjectId(announcementId),
    messageType: messageData.messageType || 'announcement',
    title: messageData.title,
    content: messageData.content,
    priority: messageData.priority || 'medium',
    showAsToast: messageData.showAsToast !== false,
    showInChat: messageData.showInChat !== false,
    expiresAt: expirationDate,
    metadata: messageData.metadata || {},
  });
};

userMessageQueueSchema.statics.getQueuedMessagesForUser = async function(
  userId: string,
  markAsDelivered = true
) {
  const messages = await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isDelivered: false,
    $or: [
      { expiresAt: { $gte: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  })
  .populate('announcementId', 'type displaySettings')
  .sort({ priority: -1, queuedAt: -1 });

  if (markAsDelivered && messages.length > 0) {
    const messageIds = messages.map(msg => msg._id);
    await this.updateMany(
      { _id: { $in: messageIds } },
      { 
        isDelivered: true,
        deliveredAt: new Date()
      }
    );
  }

  return messages;
};

userMessageQueueSchema.statics.markAsDelivered = async function(messageId: string) {
  await this.findByIdAndUpdate(messageId, {
    isDelivered: true,
    deliveredAt: new Date()
  });
};

userMessageQueueSchema.statics.cleanupExpiredMessages = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { queuedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } // 90 days old
    ]
  });
  return result.deletedCount || 0;
};

userMessageQueueSchema.statics.queueAnnouncementForAllUsers = async function(
  announcement: any,
  excludeUserIds: string[] = []
) {
  // Import User model here to avoid circular dependency
  const User = mongoose.models.User || require('./User').default;
  
  // Get target users based on announcement settings
  let query: any = { isActive: true };

  switch (announcement.targetAudience) {
    case 'all':
      break;
    case 'buyers':
      query['activity.totalPurchases'] = { $gt: 0 };
      break;
    case 'sellers':
      query['activity.totalListings'] = { $gt: 0 };
      break;
    case 'premium':
      query['profile.isPremium'] = true;
      break;
    case 'specific':
      if (announcement.specificUsers && announcement.specificUsers.length > 0) {
        query._id = { $in: announcement.specificUsers };
      } else {
        return 0;
      }
      break;
  }

  // Exclude specific users if provided
  if (excludeUserIds.length > 0) {
    query._id = query._id ? 
      { ...query._id, $nin: excludeUserIds.map(id => new mongoose.Types.ObjectId(id)) } :
      { $nin: excludeUserIds.map(id => new mongoose.Types.ObjectId(id)) };
  }

  const targetUsers = await User.find(query).select('_id').lean();

  // Queue messages for all target users
  const queuePromises = targetUsers.map((user: any) => 
    this.queueMessageForUser(
      user._id.toString(),
      announcement._id.toString(),
      {
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        messageType: 'announcement',
        showAsToast: announcement.type === 'popup' || announcement.type === 'banner',
        showInChat: announcement.type === 'chat',
        metadata: {
          announcementType: announcement.type,
          displaySettings: announcement.displaySettings,
        }
      }
    )
  );

  await Promise.all(queuePromises);
  return targetUsers.length;
};

// Use the existing model if it exists, otherwise create a new one
const UserMessageQueue = mongoose.models.UserMessageQueue || 
  mongoose.model<IUserMessageQueue, UserMessageQueueModel>("UserMessageQueue", userMessageQueueSchema);

export default UserMessageQueue;
