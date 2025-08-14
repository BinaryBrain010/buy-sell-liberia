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
  const [productTitle, setProductTitle] = useState<string>('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Helper functions
  const getOtherUserName = (chat: any) => {
    const currentUserId = getCurrentUserId();
    
    // Debug logging to see what we're working with
    console.log('🔍 getOtherUserName - Chat data:', {
      chatId: chat._id,
      user1: chat.user1,
      user2: chat.user2,
      currentUserId,
      userNames
    });
    
    // Check if user1 is the current user, then return user2's name
    if (chat.user1._id === currentUserId || chat.user1 === currentUserId) {
      console.log('👤 User1 is current user, getting user2 name');
      
      // Handle both populated and unpopulated user2
      if (chat.user2 && typeof chat.user2 === 'object' && chat.user2._id) {
        console.log('📋 User2 object (populated):', chat.user2);
        // If user2 is populated, use the actual name data
        if (chat.user2.firstName && chat.user2.lastName) {
          return `${chat.user2.firstName} ${chat.user2.lastName}`;
        } else if (chat.user2.firstName) {
          return chat.user2.firstName;
        } else if (chat.user2.username) {
          return chat.user2.username;
        } else if (chat.user2.email) {
          return chat.user2.email.split('@')[0];
        }
      }
      
      // If user2 is just an ID string, try to get cached name or fetch
      const userId = typeof chat.user2 === 'string' ? chat.user2 : chat.user2._id?.toString();
      if (userId) {
        if (userNames[userId]) {
          return userNames[userId];
        }
        // Fetch user data if not available
        fetchUserDetails(userId);
        return 'Loading...';
      }
      
      return 'Unknown User';
    } else {
      console.log('👤 User2 is current user, getting user1 name');
      
      // Handle both populated and unpopulated user1
      if (chat.user1 && typeof chat.user1 === 'object' && chat.user1._id) {
        console.log('📋 User1 object (populated):', chat.user1);
        // If user1 is populated, use the actual name data
        if (chat.user1.firstName && chat.user1.lastName) {
          return `${chat.user1.firstName} ${chat.user1.lastName}`;
        } else if (chat.user1.firstName) {
          return chat.user1.firstName;
        } else if (chat.user1.username) {
          return chat.user1.username;
        } else if (chat.user1.email) {
          return chat.user1.email.split('@')[0];
        }
      }
      
      // If user1 is just an ID string, try to get cached name or fetch
      const userId = typeof chat.user1 === 'string' ? chat.user1 : chat.user1._id?.toString();
      if (userId) {
        if (userNames[userId]) {
          return userNames[userId];
        }
        // Fetch user data if not available
        fetchUserDetails(userId);
        return 'Loading...';
      }
      
      return 'Unknown User';
    }
  };

  const getCurrentUserName = (chat: any) => {
    // For current user, always return "You"
    return 'You';
  };

  const getProductTitle = (chat: any) => {
    if (chat.product && typeof chat.product === 'object' && chat.product.title) {
      return chat.product.title;
    }
    return 'Unknown Product';
  };

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

  // Fetch user details for all chats when chats are loaded
  useEffect(() => {
    if (chats.length > 0) {
      console.log('📱 Chats loaded, checking user data:', chats);
      
      chats.forEach(chat => {
        console.log('🔍 Processing chat:', {
          chatId: chat._id,
          user1: chat.user1,
          user2: chat.user2,
          user1Type: typeof chat.user1,
          user2Type: typeof chat.user2
        });
        
        // Get the other user's ID (not the current user)
        const currentUserId = getCurrentUserId();
        let otherUserId = '';
        
        // Check if user1 is populated and has an _id
        if (typeof chat.user1 === 'object' && chat.user1._id === currentUserId) {
          // user1 is current user, so user2 is the other user
          if (typeof chat.user2 === 'object' && chat.user2._id) {
            otherUserId = chat.user2._id.toString();
          } else if (typeof chat.user2 === 'string') {
            otherUserId = chat.user2;
          }
        } else {
          // user2 is current user, so user1 is the other user
          if (typeof chat.user1 === 'object' && chat.user1._id) {
            otherUserId = chat.user1._id.toString();
          } else if (typeof chat.user1 === 'string') {
            otherUserId = chat.user1;
          }
        }
        
        console.log('👤 Other user ID:', otherUserId);
        
        // Fetch user details if we don't have them and they're not populated
        if (otherUserId && !userNames[otherUserId]) {
          // Check if we need to fetch (only if not already populated)
          const needsFetch = (typeof chat.user1 === 'string' || !chat.user1.firstName) &&
                           (typeof chat.user2 === 'string' || !chat.user2.firstName);
          
          console.log('🔄 Needs fetch:', needsFetch);
          
          if (needsFetch) {
            console.log('🚀 Fetching user details for:', otherUserId);
            fetchUserDetails(otherUserId);
          }
        }
      });
    }
  }, [chats, userNames]);

  // Fetch product title when productId is available
  useEffect(() => {
    if (productId && isValidObjectId(productId)) {
      // Try to get product title from URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const titleFromUrl = urlParams.get('productTitle');
      if (titleFromUrl) {
        setProductTitle(decodeURIComponent(titleFromUrl));
      } else {
        // Fetch the actual product details from the API
        fetchProductDetails(productId);
      }
    }
  }, [productId]);

  // Create new chat if sellerId and productId are provided
  useEffect(() => {
    console.log('🔄 useEffect triggered with:', { sellerId, productId, hasAttemptedNewChat, chatsLength: chats.length });
    
    if (sellerId && productId && !hasAttemptedNewChat && chats.length > 0) {
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
        console.log('✅ All conditions met, checking for existing chat...');
        handleCheckOrCreateChat();
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
        hasAttemptedNewChat,
        chatsLength: chats.length
      });
    }
  }, [sellerId, productId, hasAttemptedNewChat, chats.length]);

  const handleCheckOrCreateChat = async () => {
    console.log('🔍 handleCheckOrCreateChat called - checking for existing chat');
    
    // Prevent multiple simultaneous chat creation attempts
    if (isCreatingChat) {
      console.log('⏭️ Chat creation already in progress, skipping...');
      return;
    }
    
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId || !sellerId || !productId) {
      console.log('❌ Missing required data for chat check:', { currentUserId, sellerId, productId });
      return;
    }

    // Check if productId is a valid MongoDB ObjectId
    if (!isValidObjectId(productId)) {
      console.error('❌ Cannot check chat: productId is not a valid MongoDB ObjectId:', productId);
      return;
    }

    if (!isValidObjectId(sellerId)) {
      console.error('❌ Cannot check chat: sellerId is not a valid MongoDB ObjectId:', sellerId);
      return;
    }

    console.log('✅ All validations passed, checking for existing chat...');
    
    // First, check if a chat already exists between these users for this product
    const existingChat = chats.find(chat => {
      // Check if this chat is between the current user and seller for the same product
      const chatProductId = typeof chat.product === 'object' ? chat.product._id : chat.product;
      const user1Id = typeof chat.user1 === 'object' ? chat.user1._id : chat.user1;
      const user2Id = typeof chat.user2 === 'object' ? chat.user2._id : chat.user2;
      
      console.log('🔍 Checking chat for match:', {
        chatProductId,
        user1Id,
        user2Id,
        targetProductId: productId,
        currentUserId,
        sellerId,
        isMatch: chatProductId === productId && 
                ((user1Id === currentUserId && user2Id === sellerId) ||
                 (user1Id === sellerId && user2Id === currentUserId))
      });
      
      return chatProductId === productId && 
             ((user1Id === currentUserId && user2Id === sellerId) ||
              (user1Id === sellerId && user2Id === currentUserId));
    });

    if (existingChat) {
      console.log('✅ Existing chat found:', existingChat);
      // Open the existing chat instead of creating a new one
      setCurrentChat(existingChat);
      return;
    }

    console.log('❌ No existing chat found, creating new one...');
    // If no existing chat, create a new one
    await handleCreateNewChat();
  };

  const handleCreateNewChat = async () => {
    console.log('🚀 handleCreateNewChat called');
    
    // Set loading state to prevent multiple calls
    setIsCreatingChat(true);
    
    try {
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
        content: `Hi! I'm interested in your product: ${productTitle || `Product ${productId.slice(-6)}`}`,
        sentAt: new Date(),
        readBy: [currentUserId]
      };

      console.log('💬 New message object:', newMessage);

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
    } finally {
      // Always reset loading state
      setIsCreatingChat(false);
    }
  };

  const handleSendMessage = async (chatId?: string) => {
    const targetChatId = chatId || currentChat?._id;
    if (!messageInput.trim() || !targetChatId) return;

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
      await sendMessage(String(targetChatId), newMessage);
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

  const fetchProductDetails = async (productId: string) => {
    if (!productId || !isValidObjectId(productId)) return;
    
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        if (product.title) {
          setProductTitle(product.title);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    if (!userId || !isValidObjectId(userId)) return;
    
    console.log('🚀 fetchUserDetails called for userId:', userId);
    
    // Don't fetch if we already have the name or are currently fetching
    if (userNames[userId] || isLoadingUsers) {
      console.log('⏭️ Skipping fetch - already have name or currently loading');
      return;
    }
    
    setIsLoadingUsers(true);
    try {
      console.log('📡 Fetching from API:', `/api/users/${userId}`);
      
      // Try to fetch user details from a general users endpoint
      // For now, we'll use a fallback approach since the users API might not exist
      const response = await fetch(`/api/users/${userId}`);
      console.log('📥 API response status:', response.status);
      
      if (response.ok) {
        const user = await response.json();
        console.log('📋 User data received:', user);
        
        if (user) {
          // Create a display name from available fields
          let displayName = '';
          if (user.firstName && user.lastName) {
            displayName = `${user.firstName} ${user.lastName}`;
          } else if (user.firstName) {
            displayName = user.firstName;
          } else if (user.username) {
            displayName = user.username;
          } else if (user.email) {
            displayName = user.email.split('@')[0]; // Use part before @ as name
          } else {
            displayName = `User ${userId.slice(-6)}`; // Last resort fallback
          }
          
          console.log('🏷️ Setting display name:', displayName);
          setUserNames(prev => ({ ...prev, [userId]: displayName }));
        }
      } else {
        console.log('❌ API response not ok, using fallback');
        // If the endpoint doesn't exist or fails, use a fallback
        setUserNames(prev => ({ ...prev, [userId]: `User ${userId.slice(-6)}` }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch user details:', error);
      // Set a fallback name if fetch fails
      setUserNames(prev => ({ ...prev, [userId]: `User ${userId.slice(-6)}` }));
    } finally {
      setIsLoadingUsers(false);
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

          {sellerId && productId && !isValidObjectId(productId) && (
            <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <span>⚠️</span>
                <span className="font-medium">Invalid Product ID</span>
              </div>
              <p className="text-red-600">
                The product ID "{productId}" is not in the correct format. 
                Chat creation may fail. Please ensure you're accessing this page from a valid product listing.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No messages yet</p>
              {sellerId && productId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">
                    {productTitle ? `Start chatting about "${productTitle}"` : 'Start New Chat'}
                  </p>
                  <Button 
                    onClick={handleCheckOrCreateChat} 
                    className="mx-auto"
                    disabled={!isValidObjectId(productId) || !isValidObjectId(sellerId) || isCreatingChat}
                  >
                    {isCreatingChat ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Chat...
                      </span>
                    ) : (
                      'Start New Chat'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {isCreatingChat ? 'Setting up your chat...' : 'Click to start chatting about this product'}
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
                  <div key={chat._id?.toString() || Date.now().toString()}>
                    {/* Chat Item */}
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentChat?._id === chat._id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentChat(currentChat?._id === chat._id ? null : chat)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Product Image Thumbnail */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {chat.product && typeof chat.product === 'object' && chat.product.images && chat.product.images.length > 0 ? (
                            <img
                              src={chat.product.images[0]}
                              alt={getProductTitle(chat)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">📦</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {getOtherUserName(chat)}
                                {getOtherUserName(chat) === 'Loading...' && (
                                  <span className="inline-flex items-center gap-1 ml-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                Chat with {getOtherUserName(chat)} • You: {getCurrentUserName(chat)}
                              </p>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-primary font-medium truncate">
                                  {getProductTitle(chat)}
                                </p>
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                  {chat.messages?.length || 0} messages
                                </span>
                              </div>
                              {getLastMessage(chat) && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {getLastMessage(chat)?.isOwn ? 'You: ' : ''}
                                  {getLastMessage(chat)?.content}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getLastMessage(chat) && (
                                <span className="text-xs text-muted-foreground">
                                  {getLastMessage(chat)?.time}
                                </span>
                              )}
                              <div className={`w-4 h-4 transition-transform duration-200 ${
                                currentChat?._id === chat._id ? 'rotate-90' : 'rotate-0'
                              }`}>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inline Messages for this chat */}
                    {currentChat?._id === chat._id && (
                      <div className="mt-3 ml-12 border-l-2 border-primary/20 pl-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Chat Info */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Chatting about:</p>
                              <p className="text-sm font-medium text-primary">{getProductTitle(chat)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Between:</p>
                              <p className="text-sm font-medium">
                                {getCurrentUserName(chat)} ↔ {getOtherUserName(chat)}
                                {getOtherUserName(chat) === 'Loading...' && (
                                  <span className="inline-flex items-center gap-1 ml-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                          {chat.messages.map((message) => {
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
                        <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(chat._id)}
                            placeholder="Type your message..."
                            className="flex-1 px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
                            disabled={isSending}
                          />
                          <Button
                            onClick={() => handleSendMessage(chat._id)}
                            disabled={!messageInput.trim() || isSending}
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            {isSending ? '...' : 'Send'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
