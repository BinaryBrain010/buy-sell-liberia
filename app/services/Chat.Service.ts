import BaseService from "./BaseService";
import { IChat, IMessage, CreateChatRequest, MarkMessageReadRequest, ChatFilters } from "@/types/chat";

class ChatService {
  private readonly baseUrl = "/chats";

  /**
   * Fetch chats for a user with optional product filter
   */
  async getChats(filters: ChatFilters): Promise<IChat[]> {
    const params = new URLSearchParams();
    
    if (filters.userId) {
      params.append("userId", filters.userId);
    }
    
    if (filters.productId) {
      params.append("productId", filters.productId);
    }

    const response = await BaseService.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  /**
   * Create a new chat or add a message to existing chat
   */
  async createOrUpdateChat(chatData: CreateChatRequest): Promise<IChat> {
    const response = await BaseService.post(this.baseUrl, chatData);
    return response.data;
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(readData: MarkMessageReadRequest): Promise<{ success: boolean }> {
    const response = await BaseService.put(this.baseUrl, readData);
    return response.data;
  }

  /**
   * Delete all chats for a product
   */
  async deleteChatsByProduct(productId: string): Promise<{ success: boolean }> {
    const response = await BaseService.delete(`${this.baseUrl}?productId=${productId}`);
    return response.data;
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string): Promise<IChat> {
    const response = await BaseService.get(`${this.baseUrl}/${chatId}`);
    return response.data;
  }

  /**
   * Send a message to an existing chat
   */
  async sendMessage(chatId: string, message: IMessage): Promise<IChat> {
    const response = await BaseService.post(`${this.baseUrl}/${chatId}/messages`, { message });
    return response.data;
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const response = await BaseService.get(`${this.baseUrl}/unread-count?userId=${userId}`);
    return response.data;
  }
}

export default new ChatService();
