"use client";

import { ChevronRight } from "lucide-react";
import BuySellLoader from "@/components/loader/BuySellLoader";
import { ProductThumbnail } from "./product-thumbnail";
import { UserStatus } from "./user-status";

interface ChatItemProps {
  chat: any;
  isActive: boolean;
  otherUserName: string;
  productTitle: string;
  isOtherUserOnline: boolean;
  lastMessage: any;
  onClick: () => void;
}

export const ChatItem = ({
  chat,
  isActive,
  otherUserName,
  productTitle,
  isOtherUserOnline,
  lastMessage,
  onClick,
}: ChatItemProps) => {
  return (
    <div
      className={`p-2 md:p-2.5 lg:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 md:gap-2.5">
        <ProductThumbnail product={chat.product} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 md:gap-1.5">
              <h3 className="font-medium text-xs md:text-[13px] text-gray-900 dark:text-gray-100 truncate">
                {otherUserName}
              </h3>
              <UserStatus isOnline={isOtherUserOnline} />
              {otherUserName === "Loading..." && (
                <BuySellLoader
                  variant="inline"
                  size={10}
                  hideLabel
                  label="Loading user"
                />
              )}
            </div>
            <ChevronRight
              className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                isActive ? "rotate-90" : ""
              }`}
            />
          </div>

          <p className="text-xs md:text-[12px] text-blue-600 dark:text-blue-400 font-medium truncate mb-0.5">
            {productTitle}
          </p>

          <div className="flex items-center justify-between gap-1">
            <div className="flex-1 min-w-0">
              {lastMessage && (
                <p className="text-xs md:text-[12px] text-gray-600 dark:text-gray-300 truncate">
                  {lastMessage.isOwn ? "You: " : ""}
                  {lastMessage.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] md:text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-full">
                {chat.messages?.length || 0}
              </span>
              {lastMessage && (
                <span className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400">
                  {lastMessage.time}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
