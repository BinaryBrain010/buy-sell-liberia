"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner" // Make sure 'sonner' is installed and setup

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubscribe = () => {
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValidEmail) {
      setError("Enter a valid email")
      return
    }

    setError("")
    toast.success("Subscribed successfully!")
    console.log("Subscribed email:", email)
    setEmail("")
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Subscribe to our newsletter</p>
      <div className="flex space-x-2">
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError("")
          }}
          placeholder={error || "Your email"}
          className={`glass border-0 ${error ? "placeholder-red-500" : ""}`}
        />
        <Button size="sm" onClick={handleSubscribe}>
          Subscribe
        </Button>
      </div>
    </div>
  )
}
