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
import { useRouter } from "next/navigation";

export default function UserActions() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Guard clause: do not render if user is not logged in
  if (!user) return null;

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
          {/* <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
            2
          </Badge> */}
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
