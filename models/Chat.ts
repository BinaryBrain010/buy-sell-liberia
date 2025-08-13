import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  sentAt: Date;
  readBy: mongoose.Types.ObjectId[];
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: true }
);

export interface IChat extends Document {
  product: mongoose.Types.ObjectId; // The product being discussed
  user1: mongoose.Types.ObjectId; // Initiator (buyer)
  user2: mongoose.Types.ObjectId; // Product owner (seller)
  messages: IMessage[];
  lastMessageAt: Date;
  isActive: boolean;
  getMessageById(messageId: string): IMessage | undefined;
}

export interface ChatModel extends Model<IChat> {
  deleteChatsByProduct(productId: mongoose.Types.ObjectId | string): Promise<any>;
}

const chatSchema = new Schema<IChat, ChatModel>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound unique index to ensure one chat per product per user pair
chatSchema.index({ product: 1, user1: 1, user2: 1 }, { unique: true });
chatSchema.index({ lastMessageAt: -1 });

// Static method to delete all chats for a product
chatSchema.statics.deleteChatsByProduct = async function (productId: mongoose.Types.ObjectId) {
  return this.deleteMany({ product: productId });
};

// Helper method to get a message by its _id
chatSchema.methods.getMessageById = function (messageId: string) {
  // @ts-ignore
  return this.messages.find((msg: any) => msg._id?.toString() === messageId);
};

const Chat = mongoose.model<IChat, ChatModel>("Chat", chatSchema);
export default Chat;
