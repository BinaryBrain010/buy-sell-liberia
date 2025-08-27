import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  _id: string;
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
  flagged: boolean;
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
    flagged: {
      type: Boolean,
      default: false,
      index: true,
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
chatSchema.methods.getMessageById = function (messageId: string): IMessage | undefined {
  return this.messages.find((msg: { _id: { toString: () => string; }; }) => msg._id.toString() === messageId);
};

// List of abusive keywords (can be expanded)
const ABUSIVE_KEYWORDS = [
  'idiot', 'stupid', 'dumb', 'fool', 'hate','test', 'bastard', 'moron', 'shut up', 'nonsense', 'fuck'
];

// Helper function to check if a message contains abusive keywords
function containsAbusiveKeyword(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return ABUSIVE_KEYWORDS.some(word => lower.includes(word));
}

// Middleware to flag chat if any message is abusive
chatSchema.pre('save', function (next) {
  const chat = this as any;
  if (chat.messages && Array.isArray(chat.messages)) {
    chat.flagged = chat.messages.some((msg: any) => containsAbusiveKeyword(msg.content));
  }
  next();
});

// Use the existing model if it exists, otherwise create a new one
const Chat = mongoose.models.Chat || mongoose.model<IChat, ChatModel>("Chat", chatSchema);
export default Chat;