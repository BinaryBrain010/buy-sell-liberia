"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Save, 
  Edit3, 
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  preferences?: {
    defaultLocation?: {
      city?: string
      state?: string
      country?: string
    }
  }
  emailVerified?: boolean
  phoneVerified?: boolean
}

interface ProfileFormProps {
  userId: string
}

export default function ProfileForm({ userId }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "Pakistan"
  })

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const userData = await response.json()
      setProfile(userData)
      
      // Initialize form data with current user values
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        city: userData.preferences?.defaultLocation?.city || "",
        state: userData.preferences?.defaultLocation?.state || "",
        country: userData.preferences?.defaultLocation?.country || "Pakistan"
      })
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        preferences: {
          defaultLocation: {
            city: formData.city,
            state: formData.state,
            country: formData.country
          }
        }
      }

      // Update profile
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Refresh profile data
      await fetchProfile()
      
      setEditing(false)
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setEditing(false)
    
    // Reset form data to original values
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.preferences?.defaultLocation?.city || "",
        state: profile.preferences?.defaultLocation?.state || "",
        country: profile.preferences?.defaultLocation?.country || "Pakistan"
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Profile Not Found</h3>
              <p className="text-muted-foreground">Unable to load profile information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <div className="flex items-center gap-2">
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              )}
              {editing && (
                <>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <h3 className="text-xl font-semibold">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="flex-1"
                  placeholder="Email address"
                />
                {profile.emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" title="Email verified" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" title="Email not verified" />
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!editing}
                  className="flex-1"
                  placeholder="Enter phone number"
                />
                {profile.phoneVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" title="Phone verified" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" title="Phone not verified" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                disabled={!editing}
                className="mt-1"
                placeholder="Enter state"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange('country', value)}
                disabled={!editing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pakistan">Pakistan</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
