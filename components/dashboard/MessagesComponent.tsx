"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";
import { userClient } from "@/app/services/User.Service";
import { socket } from "@/lib/socket";
import { ChatItem } from "./messages/chat-item";
import { MessageThread } from "./messages/message-thread";
import { LoadingState } from "./messages/loading-state";
import { ErrorState } from "./messages/error-state";

interface MessagesComponentProps {
  sellerId?: string;
  productId?: string;
}

export const MessagesComponent = ({
  sellerId,
  productId,
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
        if (chat.user2.firstName && chat.user2.lastName) {
          return `${chat.user2.firstName} ${chat.user2.lastName}`;
        } else if (chat.user2.firstName) {
          return chat.user2.firstName;
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
        if (chat.user1.firstName && chat.user1.lastName) {
          return `${chat.user1.firstName} ${chat.user1.lastName}`;
        } else if (chat.user1.firstName) {
          return chat.user1.firstName;
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastMessage = (chat: any) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return {
        content: lastMsg.content,
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
        return { ...prev, messages: [...(prev.messages || []), newMessage] } as any;
      });

      await sendMessage(String(targetChatId), newMessage);
      setMessageInput("");

      const chat = chats.find((c) => c._id === targetChatId) || currentChat;
      if (chat) {
        const u1 = typeof chat.user1 === "object" ? chat.user1._id : chat.user1;
        const u2 = typeof chat.user2 === "object" ? chat.user2._id : chat.user2;
        const otherUserId = u1 === uid ? u2 : u1;
        if (otherUserId) {
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
        const msgs = (prev.messages || []).filter((m: any) => m._id !== newMessage._id);
        return { ...prev, messages: msgs } as any;
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId || !sellerId || !productId) return;

      const newMessage = {
        _id: Date.now().toString(),
        sender: currentUserId,
        content: `Hi! I'm interested in your product: ${
          productTitle || `Product ${productId.slice(-6)}`
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

      const newChat = await createOrUpdateChat(chatRequest);
      if (newChat) {
        setCurrentChat(newChat);
        setMessageInput("");
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
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
      if (otherObj && (otherObj.firstName || otherObj.lastName)) return;

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
            const name = contact?.name?.trim();
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

    const onPresenceList = (data: { online: string[] }) => {
      const map: Record<string, boolean> = {};
      data.online.forEach((id) => (map[id] = true));
      setOnlineUsers(map);
    };

    const onPresenceUpdate = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }));
    };

    const onSocketMessage = (data: any) => {
      // Accept both old and new payloads. Must involve this user.
      if (data.from !== userId && data.to !== userId) return;

      // If the current thread matches, append immediately for instant UI
      if (data.chatId && currentChat?._id === data.chatId && data.message) {
        setCurrentChat((prev) => {
          if (!prev) return prev;
          // avoid duplicate if already appended
          const already = (prev.messages || []).some((m: any) => m._id === data.message._id);
          if (already) return prev;
          return { ...prev, messages: [...(prev.messages || []), data.message] } as any;
        });
      }

      // Then do a lightweight refresh to keep lists in sync
      getChatsLight({ userId });
    };

    socket.on("presence:list", onPresenceList);
    socket.on("presence:update", onPresenceUpdate);
  socket.on("message", onSocketMessage);

    return () => {
      socket.off("presence:list", onPresenceList);
      socket.off("presence:update", onPresenceUpdate);
    socket.off("message", onSocketMessage);
    };
  }, [getChatsLight, currentUserId, currentChat, setCurrentChat]);

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
      <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <MessageCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <MessageCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState error={error} onRetry={clearError} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-[520px] flex flex-col dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          {isMobileView && !showChatList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToChats}
              className="mr-2 p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <MessageCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          Messages
        </CardTitle>

        {sellerId && productId && !isValidObjectId(productId) && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-1">
              <span>⚠️</span>
              <span className="font-medium">Invalid Product ID</span>
            </div>
            <p>
              The product ID "{productId}" is not in the correct format. Chat
              creation may fail.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex overflow-hidden p-0">
        {/* Left Column - Chat List */}
        <div
          className={`${
            isMobileView ? (showChatList ? "w-full" : "hidden") : "w-64"
          } border-r border-gray-200 dark:border-gray-700 flex flex-col`}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1.5">
              {sortedChats.map((chat) => (
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
              ))}
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
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">
                  Select a conversation
                </p>
                <p className="text-sm">
                  Choose a chat from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
