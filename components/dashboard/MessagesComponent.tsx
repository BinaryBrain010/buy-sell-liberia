'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useChats } from '@/hooks/use-chats';

interface MessagesComponentProps {
  sellerId?: string;
  productId?: string;
}

export const MessagesComponent = ({ sellerId, productId }: MessagesComponentProps) => {
  console.log('MessagesComponent rendered with props:', { sellerId, productId });
  
  // Check if productId looks like a valid MongoDB ObjectId
  const isValidObjectId = (id: string) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  if (productId && !isValidObjectId(productId)) {
    console.warn('ProductId does not look like a valid MongoDB ObjectId:', productId);
    console.warn('Expected format: 24 character hex string (e.g., 507f1f77bcf86cd799439011)');
    console.warn('Received format:', typeof productId, productId);
  }
  
  if (sellerId && !isValidObjectId(sellerId)) {
    console.warn('SellerId does not look like a valid MongoDB ObjectId:', sellerId);
    console.warn('Expected format: 24 character hex string (e.g., 507f1f77bcf86cd799439011)');
    console.warn('Received format:', typeof sellerId, sellerId);
  }

  const {
    chats,
    currentChat,
    isLoading,
    error,
    getChats,
    createOrUpdateChat,
    sendMessage,
    setCurrentChat,
    clearError
  } = useChats();

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasAttemptedNewChat, setHasAttemptedNewChat] = useState(false);

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      console.log('🔍 Searching for user ID...');
      
      // First priority: try to get userId from JWT tokens (this is what the user's system provides)
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      console.log('📋 Available tokens:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });
      
      if (accessToken) {
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          console.log('🔐 Decoded access token payload:', decoded);
          if (decoded && decoded.userId) {
            console.log('✅ Found user ID in JWT access token:', decoded.userId);
            return decoded.userId;
          }
        } catch (error) {
          console.error('❌ Error decoding JWT access token:', error);
        }
      }
      
      if (refreshToken) {
        try {
          const base64Url = refreshToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          console.log('🔐 Decoded refresh token payload:', decoded);
          if (decoded && decoded.userId) {
            console.log('✅ Found user ID in JWT refresh token:', decoded.userId);
            return decoded.userId;
          }
        } catch (error) {
          console.error('❌ Error decoding JWT refresh token:', error);
        }
      }

      // Fallback: try different possible keys where user data might be stored
      const possibleUserDataKeys = ['userData', 'user', 'currentUser', 'authUser'];
      console.log('🔍 Checking localStorage keys:', possibleUserDataKeys);
      
      for (const key of possibleUserDataKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`📦 Parsed ${key}:`, parsed);
            if (parsed && parsed._id) {
              console.log(`✅ Found user ID in localStorage.${key}:`, parsed._id);
              return parsed._id;
            }
          } catch (e) {
            console.log(`❌ Failed to parse ${key}:`, e);
          }
        }
      }
    }
    console.log('❌ No user ID found in JWT tokens or localStorage');
    return null;
  };

  // Load chats on component mount
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      getChats({ userId: currentUserId });
    }
  }, [getChats]);

  // Create new chat if sellerId and productId are provided
  useEffect(() => {
    console.log('🔄 useEffect triggered with:', { sellerId, productId, hasAttemptedNewChat });
    
    if (sellerId && productId && !hasAttemptedNewChat) {
      const currentUserId = getCurrentUserId();
      console.log('👤 Current user ID:', currentUserId);
      console.log('🏪 Seller ID:', sellerId);
      console.log('📦 Product ID:', productId);
      console.log('🔍 ObjectId validation:', {
        sellerIdValid: isValidObjectId(sellerId),
        productIdValid: isValidObjectId(productId),
        currentUserIdValid: currentUserId ? isValidObjectId(currentUserId) : false
      });
      
      if (currentUserId && currentUserId !== sellerId) {
        console.log('✅ All conditions met, attempting to create new chat with:', { sellerId, productId, currentUserId });
        handleCreateNewChat();
        setHasAttemptedNewChat(true);
      } else {
        console.log('❌ Cannot create chat:', { 
          hasCurrentUserId: !!currentUserId, 
          currentUserId, 
          sellerId, 
          isSameUser: currentUserId === sellerId 
        });
      }
    } else {
      console.log('❌ Conditions not met for new chat:', { 
        hasSellerId: !!sellerId, 
        hasProductId: !!productId, 
        hasAttemptedNewChat 
      });
    }
  }, [sellerId, productId, hasAttemptedNewChat]);

  const handleCreateNewChat = async () => {
    console.log('🚀 handleCreateNewChat called');
    const currentUserId = getCurrentUserId();
    console.log('👤 Current user ID from function:', currentUserId);
    
    if (!currentUserId || !sellerId || !productId) {
      console.log('❌ Missing required data for new chat:', { currentUserId, sellerId, productId });
      return;
    }

    // Check if productId is a valid MongoDB ObjectId
    if (!isValidObjectId(productId)) {
      console.error('❌ Cannot create chat: productId is not a valid MongoDB ObjectId:', productId);
      console.error('This usually means the ContactSellerButton is not receiving the actual product ID');
      return;
    }

    if (!isValidObjectId(sellerId)) {
      console.error('❌ Cannot create chat: sellerId is not a valid MongoDB ObjectId:', sellerId);
      return;
    }

    console.log('✅ All validations passed, creating new chat...');
    console.log('📤 Data being sent:', { currentUserId, sellerId, productId });
    
    const newMessage = {
      _id: Date.now().toString(),
      sender: currentUserId,
      content: `Hi! I'm interested in your product: ${productId}`,
      sentAt: new Date(),
      readBy: [currentUserId]
    };

    console.log('💬 New message object:', newMessage);

    try {
      const chatRequest = {
        product: productId,
        user1: currentUserId,
        user2: sellerId,
        message: newMessage
      };
      
      console.log('📨 Chat request being sent to API:', chatRequest);
      
      const newChat = await createOrUpdateChat(chatRequest);

      if (newChat) {
        console.log('✅ New chat created successfully:', newChat);
        setCurrentChat(newChat);
        setMessageInput('');
      } else {
        console.log('❌ createOrUpdateChat returned null');
      }
    } catch (error) {
      console.error('❌ Failed to create new chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChat) return;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const newMessage = {
      _id: Date.now().toString(),
      sender: currentUserId,
      content: messageInput.trim(),
      sentAt: new Date(),
      readBy: [currentUserId]
    };

    setIsSending(true);
    try {
      await sendMessage(String(currentChat._id), newMessage);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherUserName = (chat: any) => {
    const currentUserId = getCurrentUserId();
    if (chat.user1._id === currentUserId) {
      return chat.user2.firstName || chat.user2.username || 'User';
    } else {
      return chat.user1.firstName || chat.user1.username || 'User';
    }
  };

  const getLastMessage = (chat: any) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return {
        content: lastMsg.content,
        time: formatDate(lastMsg.sentAt),
        isOwn: lastMsg.sender === getCurrentUserId()
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={clearError} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          {sellerId && productId && (
            <p className="text-sm text-muted-foreground">
              Chat about: <span className="font-medium">{productId}</span>
            </p>
          )}
          {sellerId && productId && (
            <p className="text-xs text-muted-foreground">
              Seller ID: {sellerId} | Product: {productId}
            </p>
          )}
          {sellerId && productId && !isValidObjectId(productId) && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
              ⚠️ Warning: Product ID is not valid. Chat creation may fail. 
              This usually means the product ID is not being passed correctly.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No messages yet</p>
              {sellerId && productId && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleCreateNewChat} 
                    className="mx-auto"
                    disabled={!isValidObjectId(productId) || !isValidObjectId(sellerId)}
                  >
                    Start New Chat
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Click to start chatting about this product
                  </p>
                  {(!isValidObjectId(productId) || !isValidObjectId(sellerId)) && (
                    <p className="text-xs text-red-500">
                      Cannot start chat: Invalid ID format
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chat List */}
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat._id?.toString() || Date.now().toString()}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentChat?._id === chat._id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setCurrentChat(chat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getOtherUserName(chat)}
                        </p>
                        {getLastMessage(chat) && (
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessage(chat)?.isOwn ? 'You: ' : ''}
                            {getLastMessage(chat)?.content}
                          </p>
                        )}
                      </div>
                      {getLastMessage(chat) && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {getLastMessage(chat)?.time}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Chat Messages */}
              {currentChat && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-medium">
                      Chat with {getOtherUserName(currentChat)}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentChat(null)}
                    >
                      Close
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {currentChat.messages.map((message) => {
                      const isOwn = message.sender === getCurrentUserId();
                      return (
                        <div
                          key={message._id?.toString() || Date.now().toString()}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDate(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isSending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isSending}
                      size="sm"
                    >
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
