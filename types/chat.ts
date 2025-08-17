export interface IMessage {
  _id: string;
  sender: string; // userId as string
  content: string;
  sentAt: Date;
  readBy: string[]; // array of userIds as strings
}

// Populated product information from the chat API
export interface IPopulatedProduct {
  _id: string;
  title: string;
  images?: string[];
}

// Populated user information from the chat API
export interface IPopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    avatar?: string;
  };
}

export interface IChat {
  _id: string;
  product: string | IPopulatedProduct; // productId as string or populated product object
  user1: string | IPopulatedUser; // userId as string or populated user object
  user2: string | IPopulatedUser; // userId as string or populated user object
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
