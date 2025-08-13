"use client";


import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export function Chats() {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with real token retrieval (from auth context, cookie, etc.)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const { emit, on } = useSocket({
    token,
    onConnect: () => {
      emit("getChatRooms");
    },
    onError: (err) => {
      setError(err?.message || "Socket error");
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    // Listen for chatRooms event
    const off = on("chatRooms", (data: any) => {
      setChatRooms(data.chatRooms || []);
      setRecentContacts(data.recentContacts || []);
      setLoading(false);
    });
    // Listen for error event
    const offErr = on("error", (err: any) => {
      setError(err?.message || "Socket error");
      setLoading(false);
    });

    // Request chat rooms on mount
    emit("getChatRooms");

    return () => {
      off && off();
      offErr && offErr();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <p>Loading your chats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!chatRooms.length)
    return <p className="text-muted-foreground">No chat history found.</p>;

  return (
    <div className="space-y-4">
      {chatRooms.map((room) => (
        <div key={room.roomId} className="p-4 border rounded-xl bg-muted">
          <h4 className="font-medium">
            With: {room.lastMessage?.sender?.username} / {room.lastMessage?.receiver?.username}
          </h4>
          <p className="text-muted-foreground truncate">
            Last message: {room.lastMessage?.message}
          </p>
          <p className="text-xs text-muted-foreground">
            Unread: {room.unreadCount}
          </p>
        </div>
      ))}
    </div>
  );
}
