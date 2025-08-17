"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-900/70 p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-transparent bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/60 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        disabled={disabled}
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        size="sm"
        className="h-9 px-3 rounded-lg"
      >
        {disabled ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
