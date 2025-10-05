"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import ThemeToggle from "@/components/theme-toggle";

interface Props {
  includeThemeToggle?: boolean;
}

export default function DropDownMenu({ includeThemeToggle = false }: Props) {
  const { user, logout }: any = useAuth();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click (covers mobile taps too)
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            className="relative h-8 w-8 rounded-full btn-shadow z-50"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Open account menu"
          >
            <Avatar className="h-8 w-8 card-shadow">
              <AvatarImage src="" alt={user?.name || ""} />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={contentRef}
          className="w-56 glass border-0 modal-shadow"
          align="end"
        >
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">
                {user?.name && user.name.trim().length > 0
                  ? user.name
                  : user?.email
                  ? user.email.split("@")[0]
                  : "User"}
              </p>
              {user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          {includeThemeToggle && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault(); // prevent menu close before toggle (we control close explicitly)
                }}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {/* Icons mimic button state via ThemeToggle internal logic */}
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  Theme
                </span>
                {/* Render the actual toggle button (icon only) */}
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <Link href="/dashboard" passHref>
            <DropdownMenuItem asChild onSelect={() => setOpen(false)}>
              <span className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
