"use client"

import { useRef, useEffect } from "react"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
// import { ChatHeader } from "./chat-header"

interface MessageThreadProps {
  chat: any
  otherUserName: string
  productTitle: string
  isOtherUserOnline: boolean
  messageInput: string
  setMessageInput: (value: string) => void
  onSendMessage: (chatId: string) => void
  isSending: boolean
  formatDate: (date: Date) => string
  getCurrentUserId: () => string | null
}

export const MessageThread = ({
  chat,
  otherUserName,
  productTitle,
  isOtherUserOnline,
  messageInput,
  setMessageInput,
  onSendMessage,
  isSending,
  formatDate,
  getCurrentUserId,
}: MessageThreadProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = messagesContainerRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat.messages])

  return (
  <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/60 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700">
      {/* <ChatHeader
        chat={chat}
        otherUserName={otherUserName}
        productTitle={productTitle}
        isOtherUserOnline={isOtherUserOnline}
        messageCount={chat.messages?.length || 0}
      /> */}

      <div
        ref={messagesContainerRef}
  className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2.5 mb-2.5 sm:mb-3 pr-1 sm:pr-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {chat.messages.map((message: any) => {
          const isOwn = message.sender === getCurrentUserId()
          return (
            <MessageBubble
              key={message._id?.toString() || Date.now().toString()}
              message={message}
              isOwn={isOwn}
              formatDate={formatDate}
            />
          )
        })}
      </div>

      <MessageInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={() => onSendMessage(chat._id)}
        disabled={isSending}
      />
    </div>
  )
}
