"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  sellerId?: string
  productId?: string
  productTitle?: string
  onCreateChat?: () => void
  isCreatingChat?: boolean
  isValidIds?: boolean
}

export const EmptyState = ({
  sellerId,
  productId,
  productTitle,
  onCreateChat,
  isCreatingChat = false,
  isValidIds = true,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-500 mb-6">Start a conversation to get things going</p>

      {sellerId && productId && onCreateChat && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {productTitle ? `Start chatting about "${productTitle}"` : "Start New Chat"}
          </p>
          <Button
            onClick={onCreateChat}
            disabled={!isValidIds || isCreatingChat}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isCreatingChat ? (
              <span className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating Chat...
              </span>
            ) : (
              "Start New Chat"
            )}
          </Button>
          <p className="text-xs text-gray-500">
            {isCreatingChat
              ? "Setting up your chat..."
              : isValidIds
                ? "Click to start chatting about this product"
                : "Cannot start chat: Invalid ID format"}
          </p>
        </div>
      )}
    </div>
  )
}
