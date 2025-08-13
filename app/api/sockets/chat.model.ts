import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  messageType?: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
  markAsRead(): Promise<IChatMessage>;
}

// Interface for static methods
interface IChatMessageModel extends Model<IChatMessage> {
  getUnreadCount(userId: string): Promise<number>;
  getMessagesForRoom(roomId: string, limit?: number, skip?: number): Promise<any[]>;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  roomId: { 
    type: String, 
    required: true, 
    index: true,
    trim: true
  },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  receiver: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    index: true
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000,
    trim: true
  },
  read: { 
    type: Boolean, 
    default: false,
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  }
}, { 
  timestamps: true
});

// Create compound indexes manually after schema creation
ChatMessageSchema.index({ roomId: 1, createdAt: 1 });
ChatMessageSchema.index({ receiver: 1, read: 1 });
ChatMessageSchema.index({ sender: 1, createdAt: -1 });
ChatMessageSchema.index({ roomId: 1, sender: 1, receiver: 1 });

// Add instance method to mark message as read
ChatMessageSchema.methods.markAsRead = async function(this: IChatMessage) {
  this.read = true;
  return this.save();
};

// Static method to get unread count for a user
ChatMessageSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ 
    receiver: userId, 
    read: false 
  });
};

// Static method to get messages for a room with pagination
ChatMessageSchema.statics.getMessagesForRoom = function(
  roomId: string, 
  limit: number = 50, 
  skip: number = 0
) {
  return this.find({ roomId })
    .populate('sender', 'username')
    .populate('receiver', 'username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Virtual for formatted created date
ChatMessageSchema.virtual('formattedDate').get(function(this: IChatMessage) {
  return this.createdAt.toLocaleString();
});

// Ensure virtual fields are serialized
ChatMessageSchema.set('toJSON', {
  virtuals: true
});

const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessage, IChatMessageModel>('ChatMessage', ChatMessageSchema);

export default ChatMessage;