import { useState, useCallback, useEffect } from 'react';
import ChatService from '@/app/services/Chat.Service';
import { IChat, IMessage, CreateChatRequest, MarkMessageReadRequest, ChatFilters } from '@/types/chat';

interface UseChatsReturn {
  // State
  chats: IChat[];
  currentChat: IChat | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getChats: (filters: ChatFilters) => Promise<void>;
  createOrUpdateChat: (chatData: CreateChatRequest) => Promise<IChat | null>;
  markMessageAsRead: (readData: MarkMessageReadRequest) => Promise<boolean>;
  deleteChatsByProduct: (productId: string) => Promise<boolean>;
  getChatById: (chatId: string) => Promise<IChat | null>;
  sendMessage: (chatId: string, message: IMessage) => Promise<IChat | null>;
  getUnreadCount: (userId: string) => Promise<number>;
  
  // Utility
  setCurrentChat: (chat: IChat | null) => void;
  clearError: () => void;
  refreshChats: () => Promise<void>;
}

export const useChats = (): UseChatsReturn => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getChats = useCallback(async (filters: ChatFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedChats = await ChatService.getChats(filters);
      setChats(fetchedChats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chats';
      setError(errorMessage);
      console.error('Error fetching chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrUpdateChat = useCallback(async (chatData: CreateChatRequest): Promise<IChat | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newChat = await ChatService.createOrUpdateChat(chatData);
      
      // Update chats list if this is a new chat
      setChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(
          chat => chat._id === newChat._id
        );
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = newChat;
          return updatedChats;
        } else {
          // Add new chat to the beginning
          return [newChat, ...prevChats];
        }
      });
      
      return newChat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create/update chat';
      setError(errorMessage);
      console.error('Error creating/updating chat:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markMessageAsRead = useCallback(async (readData: MarkMessageReadRequest): Promise<boolean> => {
    try {
      setError(null);
      const result = await ChatService.markMessageAsRead(readData);
      
      if (result.success) {
        // Update the message read status in local state
        setChats(prevChats => 
          prevChats.map(chat => {
            if (chat._id === readData.chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg => {
                  if (msg._id === readData.messageId) {
                    return {
                      ...msg,
                      readBy: [...msg.readBy, readData.userId]
                    };
                  }
                  return msg;
                })
              } as IChat;
            }
            return chat;
          })
        );
        
        // Update current chat if it's the same one
        if (currentChat?._id === readData.chatId) {
          setCurrentChat(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.map(msg => {
                if (msg._id === readData.messageId) {
                  return {
                    ...msg,
                    readBy: [...msg.readBy, readData.userId]
                  };
                }
                return msg;
              })
            } as IChat;
          });
        }
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark message as read';
      setError(errorMessage);
      console.error('Error marking message as read:', err);
      return false;
    }
  }, [currentChat]);

  const deleteChatsByProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await ChatService.deleteChatsByProduct(productId);
      
      if (result.success) {
        // Remove deleted chats from local state
        setChats(prevChats => 
          prevChats.filter(chat => chat.product.toString() !== productId)
        );
        
        // Clear current chat if it's for the deleted product
        if (currentChat?.product.toString() === productId) {
          setCurrentChat(null);
        }
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chats';
      setError(errorMessage);
      console.error('Error deleting chats:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentChat]);

  const getChatById = useCallback(async (chatId: string): Promise<IChat | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const chat = await ChatService.getChatById(chatId);
      setCurrentChat(chat);
      return chat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chat';
      setError(errorMessage);
      console.error('Error fetching chat:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (chatId: string, message: IMessage): Promise<IChat | null> => {
    try {
      setError(null);
      const updatedChat = await ChatService.sendMessage(chatId, message);
      
      if (updatedChat) {
        // Update chats list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId ? updatedChat : chat
          )
        );
        
        // Update current chat if it's the same one
        if (currentChat?._id === chatId) {
          setCurrentChat(updatedChat);
        }
      }
      
      return updatedChat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      return null;
    }
  }, [currentChat]);

  const getUnreadCount = useCallback(async (userId: string): Promise<number> => {
    try {
      setError(null);
      const result = await ChatService.getUnreadCount(userId);
      return result.count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get unread count';
      setError(errorMessage);
      console.error('Error getting unread count:', err);
      return 0;
    }
  }, []);

  const refreshChats = useCallback(async () => {
    // This would need the current filters to be stored or passed
    // For now, we'll just clear the chats and let the user call getChats again
    setChats([]);
  }, []);

  return {
    // State
    chats,
    currentChat,
    isLoading,
    error,
    
    // Actions
    getChats,
    createOrUpdateChat,
    markMessageAsRead,
    deleteChatsByProduct,
    getChatById,
    sendMessage,
    getUnreadCount,
    
    // Utility
    setCurrentChat,
    clearError,
    refreshChats,
  };
};
