"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MessageCircle } from "lucide-react"
import axios from "axios"
import Link from "next/link"

export default function ChatList() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/api/user/chats")
        setChats(res.data || [])
      } catch (err) {
        console.error("Failed to load chats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  if (loading) {
    return <Loader2 className="animate-spin mx-auto mt-8 h-6 w-6" />
  }

  if (chats.length === 0) {
    return <p className="text-muted-foreground mt-4">No active conversations yet.</p>
  }

  return (
    <div className="space-y-4">
      {chats.map((chat: any) => (
        <Card key={chat._id} className="glass border-0">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{chat.otherUserName}</p>
                <p className="text-sm text-muted-foreground">{chat.lastMessage}</p>
              </div>
              <Link href={`/chat/${chat._id}`}>
                <MessageCircle className="h-5 w-5 text-blue-500" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
