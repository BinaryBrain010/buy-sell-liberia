"use client"

import { ChevronRight } from "lucide-react"
import { ProductThumbnail } from "./product-thumbnail"
import { UserStatus } from "./user-status"

interface ChatItemProps {
  chat: any
  isActive: boolean
  otherUserName: string
  productTitle: string
  isOtherUserOnline: boolean
  lastMessage: any
  onClick: () => void
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
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <ProductThumbnail product={chat.product} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{otherUserName}</h3>
              <UserStatus isOnline={isOtherUserOnline} />
              {otherUserName === "Loading..." && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 dark:border-blue-400" />
              )}
            </div>
            <ChevronRight
              className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isActive ? "rotate-90" : ""}`}
            />
          </div>

          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate mb-1">{productTitle}</p>

          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {lastMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {lastMessage.isOwn ? "You: " : ""}
                  {lastMessage.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {chat.messages?.length || 0}
              </span>
              {lastMessage && <span className="text-xs text-gray-500 dark:text-gray-400">{lastMessage.time}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
