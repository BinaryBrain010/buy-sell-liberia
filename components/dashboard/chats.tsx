"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search, Send, MoreVertical } from "lucide-react"

interface Message {
  _id: string
  content: string
  senderId: string
  timestamp: string
  read: boolean
}

interface Chat {
  _id: string
  participantName: string
  participantAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  listingTitle: string
  messages: Message[]
}

export function Chats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setChats([
        {
          _id: "1",
          participantName: "Alice Johnson",
          participantAvatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Is the iPhone still available?",
          lastMessageTime: "2024-01-15T14:30:00Z",
          unreadCount: 2,
          listingTitle: "iPhone 15 Pro",
          messages: [
            {
              _id: "m1",
              content: "Hi! I'm interested in your iPhone 15 Pro",
              senderId: "alice",
              timestamp: "2024-01-15T14:00:00Z",
              read: true,
            },
            {
              _id: "m2",
              content: "Hello! Yes, it's still available. Would you like to know more details?",
              senderId: "me",
              timestamp: "2024-01-15T14:15:00Z",
              read: true,
            },
            {
              _id: "m3",
              content: "Is the iPhone still available?",
              senderId: "alice",
              timestamp: "2024-01-15T14:30:00Z",
              read: false,
            },
          ],
        },
        {
          _id: "2",
          participantName: "Bob Smith",
          participantAvatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Thanks for the quick response!",
          lastMessageTime: "2024-01-14T16:45:00Z",
          unreadCount: 0,
          listingTitle: "MacBook Air M2",
          messages: [
            {
              _id: "m4",
              content: "What's the condition of the MacBook?",
              senderId: "bob",
              timestamp: "2024-01-14T16:00:00Z",
              read: true,
            },
            {
              _id: "m5",
              content: "It's in excellent condition, barely used for 6 months",
              senderId: "me",
              timestamp: "2024-01-14T16:30:00Z",
              read: true,
            },
            {
              _id: "m6",
              content: "Thanks for the quick response!",
              senderId: "bob",
              timestamp: "2024-01-14T16:45:00Z",
              read: true,
            },
          ],
        },
        {
          _id: "3",
          participantName: "Carol Davis",
          participantAvatar: "/placeholder.svg?height=40&width=40",
          lastMessage: "Can we meet tomorrow?",
          lastMessageTime: "2024-01-13T19:20:00Z",
          unreadCount: 1,
          listingTitle: "Vintage Watch",
          messages: [
            {
              _id: "m7",
              content: "I love the vintage watch! Can we meet tomorrow?",
              senderId: "carol",
              timestamp: "2024-01-13T19:20:00Z",
              read: false,
            },
          ],
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredChats = chats.filter(
    (chat) =>
      chat.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    // Mock sending message
    const message: Message = {
      _id: `m${Date.now()}`,
      content: newMessage,
      senderId: "me",
      timestamp: new Date().toISOString(),
      read: true,
    }

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, message],
    })
    setNewMessage("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading your messages...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-muted-foreground">Chat with potential buyers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px]">
            {filteredChats.map((chat) => (
              <Card
                key={chat._id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedChat?._id === chat._id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={chat.participantAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {chat.participantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{chat.participantName}</h4>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">Re: {chat.listingTitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedChat.participantAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedChat.participantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedChat.participantName}</CardTitle>
                      <CardDescription>About: {selectedChat.listingTitle}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a chat from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
