"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Save, Edit3, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthLogout } from "@/hooks/use-auth-logout";

interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  preferences?: {
    defaultLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface ProfileFormProps {
  userId: string;
  onProfileUpdate?: () => void;
}

export default function ProfileForm({
  userId,
  onProfileUpdate,
}: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  // Listen for logout events and clear state
  useAuthLogout(() => {
    setProfile(null);
    setLoading(false);
    setSaving(false);
    setEditing(false);
    setFormData({
      fullName: "",
      username: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      country: "Liberia",
    });
    console.log("[PROFILE_FORM] State cleared due to logout");
  });

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const userData = await response.json();
      setProfile(userData);

      // Initialize form data with current user values
      setFormData({
        fullName: userData.fullName || "",
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        city: userData.preferences?.defaultLocation?.city || "",
        state: userData.preferences?.defaultLocation?.state || "",
        country: userData.preferences?.defaultLocation?.country || "Liberia",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare update data
      const updateData = {
        fullName: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        preferences: {
          defaultLocation: {
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
        },
      };

      // Update profile
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Refresh profile data
      await fetchProfile();

      // Call the parent callback to refresh dashboard user data
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);

    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.preferences?.defaultLocation?.city || "",
        state: profile.preferences?.defaultLocation?.state || "",
        country: profile.preferences?.defaultLocation?.country || "Nigeria",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-v0-green animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-6">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground mb-6">
            Unable to load profile information. Please try again.
          </p>
          <Button 
            onClick={() => fetchProfile()} 
            variant="outline"
            className="px-6 py-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Profile Header */}
      <div className="relative">
        {/* Background accent */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl opacity-50" />
        
        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-xl">
                <User className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  {profile.fullName || "User"}
                </h2>
                <p className="text-lg text-muted-foreground">
                  @{profile.username}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active
                  </span>
                  <span className="text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              {editing && (
                <>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    className="px-6 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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
        </div>
      </div>

      {/* Enhanced Form Fields */}
      <div className="space-y-8">
        {/* Personal Information */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 rounded-2xl opacity-50" />
          
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={!editing}
                  className="h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={!editing}
                  className="h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                  placeholder="Enter username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="flex-1 h-12 border-2 border-border/30 rounded-xl bg-muted/50"
                    placeholder="Email address"
                  />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    profile.emailVerified 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20'
                  }`}>
                    {profile.emailVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                </div>
                <p className={`text-xs ${profile.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile.emailVerified ? 'Email verified' : 'Email not verified'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!editing}
                    className="flex-1 h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                    placeholder="Enter phone number"
                  />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    profile.phoneVerified 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20'
                  }`}>
                    {profile.phoneVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                </div>
                <p className={`text-xs ${profile.phoneVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile.phoneVerified ? 'Phone verified' : 'Phone not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl opacity-50" />
          
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Location Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!editing}
                  className="h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                  placeholder="Enter city"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-semibold">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!editing}
                  className="h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                  placeholder="Enter state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold">Country</Label>
                <Select
                  value={formData.country || undefined}
                  onValueChange={(value) => handleInputChange("country", value)}
                  disabled={!editing}
                >
                  <SelectTrigger className="h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Liberia">Liberia</SelectItem>
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
          </div>
        </div>
      </div>
    </div>
  );
}
