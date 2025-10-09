"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Heart,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { useChats } from "@/hooks/use-chats";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

export default function UserActions() {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useChats();
  const [unread, setUnread] = useState<number>(0);
  const router = useRouter();

  // Guard clause: do not render if user is not logged in
  if (!user) return null;

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        if (!user?.id) {
          setUnread(0);
          return;
        }
        const count = await getUnreadCount(user.id);
        if (mounted) setUnread(count);
      } catch {
        if (mounted) setUnread(0);
      }
    };
    const handleImmediateRefresh = () => {
      fetchUnread();
    };
    const handleSocketMessage = (payload: any) => {
      try {
        // Only refresh if the message is addressed to this user and not sent by them
        const toId = String(payload?.to || "");
        const fromId = String(payload?.from || "");
        if (
          user?.id &&
          toId === String(user.id) &&
          fromId !== String(user.id)
        ) {
          fetchUnread();
        }
      } catch {
        // no-op
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    if (typeof window !== "undefined") {
      window.addEventListener("bsl:unread-updated", handleImmediateRefresh);
    }
    socket.on("message", handleSocketMessage);
    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "bsl:unread-updated",
          handleImmediateRefresh
        );
      }
      socket.off("message", handleSocketMessage);
    };
  }, [user?.id, getUnreadCount]);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1 lg:space-x-2">
        {/* <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
          <Heart className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
            3
          </Badge>
        </Button> */}

        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 btn-shadow"
          onClick={() => router.push("/dashboard?tab=messages")}
        >
          <MessageCircle className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center px-1 p-0 text-[10px] card-shadow bg-red-600 text-white">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>

        {/* <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
            5
          </Badge>
        </Button> */}
      </div>
    </div>
  );
}
