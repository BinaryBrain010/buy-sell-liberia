export interface IMessage {
  _id: string;
  sender: string; // userId as string
  content: string;
  sentAt: Date;
  readBy: string[]; // array of userIds as strings
}

export interface IChat {
  _id: string;
  product: string; // productId as string
  user1: string; // userId as string
  user2: string; // userId as string
  messages: IMessage[];
  lastMessageAt: Date;
  isActive: boolean;
}

// Request/Response types for API calls
export interface CreateChatRequest {
  product: string;
  user1: string;
  user2: string;
  message: IMessage;
}

export interface MarkMessageReadRequest {
  chatId: string;
  messageId: string;
  userId: string;
}

export interface ChatFilters {
  userId?: string;
  productId?: string;
}
