"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BuySellLoader from "@/components/loader/BuySellLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Save,
  Edit3,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import AccountVerificationModal from "@/components/dashboard/AccountVerificationModal";
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
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] =
    useState<boolean>(false);

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

  // Fetch monetization toggles for gating buttons
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/monetization/plans");
        const json = await res.json();
        if (!mounted) return;
        setIsSubscriptionActive(Boolean(json?.isSubscriptionActive));
      } catch {
        if (!mounted) return;
        setIsSubscriptionActive(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
        <BuySellLoader label="Loading profile information..." />
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
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Enhanced Profile Header */}
      <div className="relative">
        {/* Background accent */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl opacity-50" />

        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-border/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-xl shrink-0">
                <User className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                  {profile.fullName || "User"}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground truncate">
                  @{profile.username}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active
                  </span>
                  <span className="text-muted-foreground truncate">
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
              {isSubscriptionActive && (
                <Button
                  variant="outline"
                  onClick={() => setVerifyOpen(true)}
                  className="px-3 sm:px-6 py-2 sm:py-3 text-sm border-2 border-border/30 hover:border-primary/50 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    Apply for Verification
                  </span>
                </Button>
              )}
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="px-3 sm:px-6 py-2 sm:py-3 text-sm bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              )}
              {editing && (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="px-3 sm:px-6 py-2 sm:py-3 text-sm border-2 border-border/30 hover:border-primary/50 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 sm:px-6 py-2 sm:py-3 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {saving ? (
                      <>
                        <BuySellLoader
                          variant="inline"
                          size={16}
                          hideLabel
                          label="Saving"
                          className="mr-2"
                        />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Save Changes</span>
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

          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-border/30">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  disabled={!editing}
                  className="h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  disabled={!editing}
                  className="h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="flex-1 h-10 sm:h-12 border-2 border-border/30 rounded-xl bg-muted/50 text-sm"
                    placeholder="Email address"
                  />
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      profile.emailVerified
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-yellow-100 dark:bg-yellow-900/20"
                    }`}
                  >
                    {profile.emailVerified ? (
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                    )}
                  </div>
                </div>
                <p
                  className={`text-xs ${
                    profile.emailVerified ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {profile.emailVerified
                    ? "Email verified"
                    : "Email not verified"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number
                </Label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!editing}
                    className="flex-1 h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm"
                    placeholder="Enter phone number"
                  />
                  {profile.phoneVerified && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/20 shrink-0">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  )}
                </div>
                {profile.phoneVerified && (
                  <p className="text-xs text-green-600">Phone verified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl opacity-50" />

          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-border/30">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">
              Location Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!editing}
                  className="h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm"
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-semibold">
                  State/Province
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!editing}
                  className="h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm"
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold">
                  Country
                </Label>
                <Select
                  value={formData.country || undefined}
                  onValueChange={(value) => handleInputChange("country", value)}
                  disabled={!editing}
                >
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Liberia">Liberia</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">
                      United Kingdom
                    </SelectItem>
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
      <AccountVerificationModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
      />
    </div>
  );
}
