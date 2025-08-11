import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string; // Unique for each user-to-user chat (e.g., sorted user IDs or product+user IDs)
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId; // Optional: for product-based chats
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  roomId: { type: String, required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
