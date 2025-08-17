"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Bell, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function UserActions() {
  const { user, logout } = useAuth()

  // Guard clause: do not render if user is not logged in
  if (!user) return null

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
          <Heart className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs card-shadow">3</Badge>
        </Button>
        <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
          <MessageCircle className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs card-shadow">2</Badge>
        </Button>
        <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs card-shadow">5</Badge>
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full btn-shadow">
            <Avatar className="h-8 w-8 card-shadow">
              <AvatarImage src="" alt={user.name || ""} />
              <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 glass border-0 modal-shadow" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name || "User"}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
