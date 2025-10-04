"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  ArrowLeft,
  Users,
  Clock,
  Send,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BuySellLoader from "@/components/loader/BuySellLoader";
import { useChats } from "@/hooks/use-chats";
import { userClient } from "@/app/services/User.Service";
import { socket } from "@/lib/socket";
import { ChatItem } from "./messages/chat-item";
import { MessageThread } from "./messages/message-thread";
import { LoadingState } from "./messages/loading-state";
import { ErrorState } from "./messages/error-state";
import { useAuthLogout } from "@/hooks/use-auth-logout";

interface MessagesComponentProps {
  sellerId?: string;
  productId?: string;
  productTitle?: string;
}

export const MessagesComponent = ({
  sellerId,
  productId,
  productTitle: propProductTitle,
}: MessagesComponentProps) => {
  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  const {
    chats,
    currentChat,
    isLoading,
    error,
    getChats,
    getChatsLight,
    createOrUpdateChat,
    sendMessage,
    setCurrentChat,
    clearError,
  } = useChats();

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasAttemptedNewChat, setHasAttemptedNewChat] = useState(false);
  const [productTitle, setProductTitle] = useState<string>("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Listen for logout events and clear state
  useAuthLogout(() => {
    setMessageInput("");
    setHasAttemptedNewChat(false);
    setProductTitle("");
    setUserNames({});
    setIsCreatingChat(false);
    setOnlineUsers({});
    setCurrentUserId(null);
    setShowChatList(true);
    console.log("[MESSAGES_COMPONENT] State cleared due to logout");
  });

  const getCurrentUserId = () => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const base64Url = accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const decoded = JSON.parse(jsonPayload);
          if (decoded && decoded.userId) {
            return decoded.userId;
          }
        } catch (error) {
          console.error("Error decoding JWT:", error);
        }
      }
    }
    return null;
  };

  const getOtherUserName = (chat: any) => {
    const currentUserId = getCurrentUserId();

    if (chat.user1._id === currentUserId || chat.user1 === currentUserId) {
      if (chat.user2 && typeof chat.user2 === "object" && chat.user2._id) {
        if (chat.user2.fullName && chat.user2.username) {
          return `${chat.user2.fullName} (${chat.user2.username})`;
        } else if (chat.user2.fullName) {
          return chat.user2.fullName;
        } else if (chat.user2.username) {
          return chat.user2.username;
        }
      }
      const userId =
        typeof chat.user2 === "string"
          ? chat.user2
          : chat.user2._id?.toString();
      if (userId && userNames[userId]) {
        return userNames[userId];
      }
      return "Loading...";
    } else {
      if (chat.user1 && typeof chat.user1 === "object" && chat.user1._id) {
        if (chat.user1.fullName && chat.user1.username) {
          return `${chat.user1.fullName} (${chat.user1.username})`;
        } else if (chat.user1.fullName) {
          return chat.user1.fullName;
        } else if (chat.user1.username) {
          return chat.user1.username;
        }
      }
      const userId =
        typeof chat.user1 === "string"
          ? chat.user1
          : chat.user1._id?.toString();
      if (userId && userNames[userId]) {
        return userNames[userId];
      }
      return "Loading...";
    }
  };

  const getProductTitle = (chat: any) => {
    if (
      chat.product &&
      typeof chat.product === "object" &&
      chat.product.title
    ) {
      return chat.product.title;
    }
    return "Unknown Product";
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown time";
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid date";
      
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Date:", date);
      return "Invalid date";
    }
  };

  const getLastMessage = (chat: any) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return {
        content: lastMsg.content || "",
        time: formatDate(lastMsg.sentAt),
        isOwn: lastMsg.sender === getCurrentUserId(),
      };
    }
    return null;
  };

  const isOtherUserOnline = (chat: { user1: any; user2: any }) => {
    const uid = currentUserId || getCurrentUserId();
    const u1 = typeof chat.user1 === "object" ? chat.user1._id : chat.user1;
    const u2 = typeof chat.user2 === "object" ? chat.user2._id : chat.user2;
    const otherId = u1 === uid ? u2 : u1;
    return !!(otherId && onlineUsers[String(otherId)]);
  };

  const handleSendMessage = async (chatId?: string) => {
    const targetChatId = chatId || currentChat?._id;
    if (!messageInput.trim() || !targetChatId) return;

    const uid = currentUserId || getCurrentUserId();
    if (!uid) return;

    const newMessage = {
      _id: Date.now().toString(),
      sender: uid,
      content: messageInput.trim(),
      sentAt: new Date(),
      readBy: [uid],
    };

    setIsSending(true);
    try {
      // Optimistic update: append to current chat UI immediately
      setCurrentChat((prev) => {
        if (!prev) return prev;
        if (prev._id !== String(targetChatId)) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage],
        } as any;
      });

      // Clear input immediately for better UX
      setMessageInput("");

      // Send message to server
      await sendMessage(String(targetChatId), newMessage);

      // Find the chat to get the other user's ID for socket emission
      const chat = chats.find((c) => c._id === targetChatId) || currentChat;
      if (chat) {
        const u1 = typeof chat.user1 === "object" ? chat.user1._id : chat.user1;
        const u2 = typeof chat.user2 === "object" ? chat.user2._id : chat.user2;
        const otherUserId = u1 === uid ? u2 : u1;

        if (otherUserId) {
          // Emit socket message to notify other user
          socket.emit("message", {
            chatId: String(targetChatId),
            from: String(uid),
            to: String(otherUserId),
            message: newMessage,
          } as any);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Rollback optimistic UI on failure
      setCurrentChat((prev) => {
        if (!prev) return prev;
        if (prev._id !== String(targetChatId)) return prev;
        const msgs = (prev.messages || []).filter(
          (m: any) => m._id !== newMessage._id
        );
        return { ...prev, messages: msgs } as any;
      });
      // Restore the message input on error
      setMessageInput(newMessage.content);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewChat = async () => {
    console.log("🔍 Chat Debug - handleCreateNewChat called with:", {
      sellerId,
      productId,
      currentUserId,
      productTitle: propProductTitle,
    });

    setIsCreatingChat(true);
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId || !sellerId || !productId) {
        console.log("🔍 Chat Debug - Missing required parameters:", {
          currentUserId,
          sellerId,
          productId,
        });
        return;
      }

      const newMessage = {
        _id: Date.now().toString(),
        sender: currentUserId,
        content: `Hi! I'm interested in your product: ${
          propProductTitle || `Product ${productId.slice(-6)}`
        }`,
        sentAt: new Date(),
        readBy: [currentUserId],
      };

      const chatRequest = {
        product: productId,
        user1: currentUserId,
        user2: sellerId,
        message: newMessage,
      };

      console.log("🔍 Chat Debug - Creating chat with request:", chatRequest);

      const newChat = await createOrUpdateChat(chatRequest);
      console.log("🔍 Chat Debug - Chat creation result:", newChat);

      if (newChat) {
        setCurrentChat(newChat);
        setMessageInput("");
      }
    } catch (error) {
      console.error("🔍 Chat Debug - Failed to create new chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleChatSelect = (chat: any) => {
    setCurrentChat(currentChat?._id === chat._id ? null : chat);
    if (isMobileView && chat) {
      setShowChatList(false);
    }
  };

  const handleBackToChats = () => {
    setShowChatList(true);
    setCurrentChat(null);
  };

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    const uid = currentUserId || getCurrentUserId();
    if (uid) {
      getChats({ userId: uid });
    }
  }, [getChats, currentUserId]);

  // Resolve and cache display names for the other participant in each chat
  useEffect(() => {
    const uid = currentUserId || getCurrentUserId();
    if (!uid || !chats?.length) return;

    // Collect other user IDs that we don't have names for yet
    const missingIds = new Set<string>();

    chats.forEach((chat) => {
      const u1 = typeof chat.user1 === "object" ? chat.user1._id : chat.user1;
      const u2 = typeof chat.user2 === "object" ? chat.user2._id : chat.user2;
      // If the other user is already populated with a name object, skip
      const otherObj =
        typeof chat.user1 === "object" && u2 === uid
          ? chat.user1
          : typeof chat.user2 === "object" && u1 === uid
          ? chat.user2
          : null;
      if (otherObj && (otherObj.fullName || otherObj.username)) return;
      const otherId = u1 === uid ? u2 : u1;
      const key = otherId ? String(otherId) : "";
      if (key && !userNames[key]) missingIds.add(key);
    });

    if (missingIds.size === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        Array.from(missingIds).map(async (id) => {
          try {
            const contact = await userClient.getUserContact(id);
            const name = contact?.name || "Unknown User";
            return [
              id,
              name && name.length > 0 ? name : "Unknown User",
            ] as const;
          } catch {
            return [id, "Unknown User"] as const;
          }
        })
      );

      if (cancelled) return;
      setUserNames((prev) => {
        const next = { ...prev };
        entries.forEach(([id, name]) => {
          next[id] = name;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [chats, currentUserId, userNames]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Socket listeners
  useEffect(() => {
    const userId = currentUserId || getCurrentUserId();
    if (!userId) return;

    socket.emit("user:online", { userId });
    socket.emit("presence:subscribe");

    const handlePresenceUpdate = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }));
    };

    const handlePresenceList = (data: { online: string[] }) => {
      const map: Record<string, boolean> = {};
      data.online.forEach((id) => (map[id] = true));
      setOnlineUsers(map);
    };

    const handleNewMessage = (data: {
      from: string;
      message: string | any;
      to: string;
      chatId?: string;
    }) => {
      if (data.chatId === currentChat?._id) {
        // Check if this message is already in the current chat to prevent duplicates
        const messageExists = currentChat?.messages?.some((msg: any) => {
          // Check by ID first (most reliable)
          if (msg._id === data.message._id) return true;

          // Check by content, sender, and time (fallback for optimistic updates)
          if (
            msg.content === data.message.content &&
            msg.sender === data.message.sender
          ) {
            const timeDiff = Math.abs(
              new Date(msg.sentAt).getTime() -
                new Date(data.message.sentAt).getTime()
            );
            // If messages are within 2 seconds and have same content/sender, consider them duplicates
            return timeDiff < 2000;
          }

          return false;
        });

        // Don't add the message if it's from the current user and already exists
        // This prevents duplicate messages from optimistic updates
        if (
          !messageExists &&
          data.from !== (currentUserId || getCurrentUserId())
        ) {
          setCurrentChat((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...(prev.messages || []), data.message],
            } as any;
          });
        }
      }
      getChatsLight({ userId });
    };

    socket.on("presence:update", handlePresenceUpdate);
    socket.on("presence:list", handlePresenceList);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("presence:list", handlePresenceList);
      socket.off("message", handleNewMessage);
    };
  }, [getChatsLight, currentUserId, currentChat, setCurrentChat]);

  // Auto-create new chat when sellerId and productId are provided
  useEffect(() => {
    console.log("🔍 Chat Debug - useEffect triggered:", {
      sellerId,
      productId,
      currentUserId,
      hasAttemptedNewChat,
      chatsLength: chats.length,
    });

    if (sellerId && productId && currentUserId && !hasAttemptedNewChat) {
      console.log("🔍 Chat Debug - Attempting to create/find chat");

      // Check if a chat already exists for this product and users
      const existingChat = chats.find((chat) => {
        const u1 = typeof chat.user1 === "object" ? chat.user1._id : chat.user1;
        const u2 = typeof chat.user2 === "object" ? chat.user2._id : chat.user2;
        const chatProductId =
          typeof chat.product === "object" ? chat.product._id : chat.product;

        console.log("🔍 Chat Debug - Checking chat:", {
          chatId: chat._id,
          u1,
          u2,
          chatProductId,
          productId,
          currentUserId,
          sellerId,
          matches:
            chatProductId === productId &&
            ((u1 === currentUserId && u2 === sellerId) ||
              (u1 === sellerId && u2 === currentUserId)),
        });

        return (
          chatProductId === productId &&
          ((u1 === currentUserId && u2 === sellerId) ||
            (u1 === sellerId && u2 === currentUserId))
        );
      });

      if (!existingChat) {
        console.log("🔍 Chat Debug - No existing chat found, creating new one");
        // Auto-create new chat
        handleCreateNewChat();
        setHasAttemptedNewChat(true);
      } else {
        console.log(
          "🔍 Chat Debug - Existing chat found, setting as current:",
          existingChat
        );
        // Set existing chat as current
        setCurrentChat(existingChat);
        setHasAttemptedNewChat(true);
      }
    }
  }, [sellerId, productId, currentUserId, chats, hasAttemptedNewChat]);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const getTimestamp = (chat: any) => {
        if (chat.messages && chat.messages.length > 0) {
          return new Date(
            chat.messages[chat.messages.length - 1].sentAt
          ).getTime();
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [chats]);

  if (isLoading) {
    return (
      <div className="p-6">
        <BuySellLoader label="Loading your messages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-6">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            Error Loading Messages
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={clearError}
            className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative">
        {/* Background accent */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl opacity-50" />

        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Messages
                  </h2>
                  <p className="text-muted-foreground">
                    Connect with buyers and sellers
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {chats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {chats.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Chats
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(onlineUsers).filter(Boolean).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Online</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-600">
                    {chats.reduce(
                      (sum, chat) => sum + (chat.messages?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      chats.filter((chat) => {
                        const lastMessage =
                          chat.messages?.[chat.messages.length - 1];
                        return (
                          lastMessage &&
                          !lastMessage.readBy?.includes(
                            currentUserId || getCurrentUserId() || ""
                          )
                        );
                      }).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Unread</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Messages Interface */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 rounded-2xl opacity-50" />

        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
          {/* Messages Header */}
          <div className="p-6 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && !showChatList && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToChats}
                    className="p-2 h-10 w-10 rounded-xl hover:bg-muted/50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Your Conversations
                  </h3>
                </div>
              </div>

              {sellerId && productId && (
                <Button
                  onClick={handleCreateNewChat}
                  disabled={isCreatingChat}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreatingChat ? "Creating..." : "New Chat"}
                </Button>
              )}
            </div>

            {sellerId && productId && !isValidObjectId(productId) && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600">⚠️</span>
                  <span className="font-medium text-red-800 dark:text-red-200">
                    Invalid Product ID
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  The product ID "{productId}" is not in the correct format.
                  Chat creation may fail.
                </p>
              </div>
            )}
          </div>

          {/* Messages Content */}
          <div className="flex h-[520px]">
            {/* Left Column - Chat List */}
            <div
              className={`${
                isMobileView ? (showChatList ? "w-full" : "hidden") : "w-80"
              } border-r border-border/30 flex flex-col`}
            >
              {/* Chat List Header */}
              <div className="p-4 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/30 focus:border-primary/50 transition-colors bg-background/50"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {sortedChats.length > 0 ? (
                    sortedChats.map((chat) => (
                      <ChatItem
                        key={chat._id?.toString() || Date.now().toString()}
                        chat={chat}
                        isActive={currentChat?._id === chat._id}
                        otherUserName={getOtherUserName(chat)}
                        productTitle={getProductTitle(chat)}
                        isOtherUserOnline={isOtherUserOnline(chat)}
                        lastMessage={getLastMessage(chat)}
                        onClick={() => handleChatSelect(chat)}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        No conversations yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Message Thread */}
            <div
              className={`${
                isMobileView ? (showChatList ? "hidden" : "w-full") : "flex-1"
              } flex flex-col`}
            >
              {currentChat ? (
                <MessageThread
                  chat={currentChat}
                  otherUserName={getOtherUserName(currentChat)}
                  productTitle={getProductTitle(currentChat)}
                  isOtherUserOnline={isOtherUserOnline(currentChat)}
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  onSendMessage={handleSendMessage}
                  isSending={isSending}
                  formatDate={formatDate}
                  getCurrentUserId={getCurrentUserId}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">
                        {sellerId && productId
                          ? "Ready to start chatting?"
                          : "No conversation selected"}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {sellerId && productId
                          ? `Start a conversation about: ${
                              propProductTitle || "this product"
                            }`
                          : "Select a conversation from the list to start messaging"}
                      </p>
                    </div>
                    {sellerId && productId && (
                      <Button
                        onClick={handleCreateNewChat}
                        disabled={isCreatingChat}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                      >
                        {isCreatingChat ? (
                          <>
                            <BuySellLoader
                              variant="inline"
                              size={16}
                              hideLabel
                              label="Creating Chat"
                              className="mr-2"
                            />
                            Creating Chat...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Start Chat
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
