"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserProfile {
  fullName: string
  username: string
  email: string
  phone: string
  country: string
}

export default function AccountDetails() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile")
        const data = await res.json()
        if (res.ok) setUser(data.user)
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <Skeleton className="h-60 w-full rounded-xl" />
  }

  if (!user) return <div className="text-red-600">Failed to load profile</div>

  return (
    <div className="max-w-xl mx-auto mt-6 p-1 rounded-2xl bg-white/40 dark:bg-white/10 shadow-lg backdrop-blur-md border border-white/30 dark:border-white/20">
      <div className="rounded-2xl bg-white/60 dark:bg-white/10 p-6 space-y-4 text-gray-900 dark:text-white">
        <h2 className="text-2xl font-semibold tracking-wide">Account Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
          <Detail label="Name" value={user.fullName} />
          <Detail label="Username" value={user.username} />
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Country" value={user.country} />
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase text-gray-600 dark:text-white/60 tracking-wide">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  )
}
