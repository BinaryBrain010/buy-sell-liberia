"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Globe, Save, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ProfileFormProps {
  user: {
    _id: string
    fullName: string
    username: string
    email: string
    phone: string
    country: string
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    country: user.country || "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Profile updated:", formData)
      // Show success message or redirect
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={`pl-10 h-10 ${errors.fullName ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`pl-10 h-10 ${errors.username ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 h-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pl-10 h-10 ${errors.phone ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter your country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className={`pl-10 h-10 ${errors.country ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
