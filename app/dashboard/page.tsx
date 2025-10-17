"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Package,
  Heart,
  MessageCircle,
  Shield,
  BadgeDollarSign,
} from "lucide-react";
import BuySellLoader from "@/components/loader/BuySellLoader";
import { useToast } from "@/hooks/use-toast";
import { MessagesComponent } from "@/components/dashboard/MessagesComponent";
import UserListings from "@/components/dashboard/userListings";
import ProfileForm from "@/components/dashboard/profileForm";
import MonetizationTab from "@/components/dashboard/MonetizationTab";
import FavouriteListings from "@/components/dashboard/favouriteListings";
import { useAuthLogout } from "@/hooks/use-auth-logout";

// JWT Decode function (no external dependencies needed)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Child Components
const ProfileTab = ({
  userId,
  onProfileUpdate,
}: {
  userId: string;
  onProfileUpdate?: () => void;
}) => <ProfileForm userId={userId} onProfileUpdate={onProfileUpdate} />;

const ListingsTab = ({ userId }: { userId: string }) => (
  <UserListings userId={userId} />
);

const FavouritesTab = ({ userId }: { userId: string }) => (
  <FavouriteListings userId={userId} />
);

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [monetizationEnabled, setMonetizationEnabled] = useState<
    boolean | null
  >(null);
  const [chatParams, setChatParams] = useState<{
    sellerId?: string;
    productId?: string;
    productTitle?: string;
  }>({});
  const router = useRouter();
  const { toast } = useToast();

  // Listen for logout events and clear authentication state
  useAuthLogout(() => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab("profile");
    setChatParams({});
    console.log("[DASHBOARD] Authentication state cleared due to logout");
  });

  useEffect(() => {
    checkAuthentication();
    checkUrlParams();
  }, []);

  // Fetch monetization settings from server to control visibility
  useEffect(() => {
    let mounted = true;
    fetch("/api/monetization/plans")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        setMonetizationEnabled(Boolean(json?.enabled));
        // If monetization tab is active but disabled, fallback to profile and inform user
        if (!json?.enabled && activeTab === "monetization") {
          setActiveTab("profile");
          toast({
            title: "Monetization disabled",
            description: "This feature is currently unavailable.",
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setMonetizationEnabled(false);
        if (activeTab === "monetization") setActiveTab("profile");
      });
    return () => {
      mounted = false;
    };
  }, [activeTab, toast]);

  const checkUrlParams = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      const sellerId = urlParams.get("sellerId");
      const productId = urlParams.get("productId");
      const productTitle = urlParams.get("productTitle");

      console.log("🔍 Dashboard Debug - URL params:", {
        tab,
        sellerId,
        productId,
        productTitle,
        fullUrl: window.location.href,
      });

      if (tab === "messages") {
        setActiveTab("messages");
      }

      if (sellerId || productId) {
        setChatParams({
          sellerId: sellerId || undefined,
          productId: productId || undefined,
          productTitle: productTitle || undefined,
        });

        console.log("🔍 Dashboard Debug - Set chat params:", {
          sellerId: sellerId || undefined,
          productId: productId || undefined,
          productTitle: productTitle || undefined,
        });
      }
    }
  };

  // Function to refresh user data after profile updates
  const refreshUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || !user?.id) return;

      console.log("🔄 Refreshing user data for:", user.id);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const apiUserData = await response.json();
        console.log("✅ Successfully refreshed user data:", apiUserData);

        setUser({
          id: apiUserData._id || apiUserData.id,
          fullName: apiUserData.fullName || apiUserData.name,
          username: apiUserData.username,
          email: apiUserData.email,
          profile: {
            avatar:
              apiUserData.profile?.avatar ||
              apiUserData.avatar ||
              "/placeholder-user.jpg",
          },
        });
      } else {
        console.warn("❌ Failed to refresh user data");
      }
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);

      // Check if user is logged in by looking for tokens
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken && !refreshToken) {
          throw new Error("No authentication tokens found");
        }

        // Check if user data is already available in localStorage from auth provider
        // Try different possible keys where user data might be stored
        const possibleUserDataKeys = [
          "userData",
          "user",
          "currentUser",
          "authUser",
        ];
        let storedUserData = null;

        for (const key of possibleUserDataKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (
                parsed &&
                (parsed.fullName || parsed.username || parsed.email)
              ) {
                storedUserData = parsed;
                console.log(
                  `Found user data in localStorage.${key}:`,
                  storedUserData
                );
                break;
              }
            } catch (e) {
              console.log(`Failed to parse ${key}:`, e);
            }
          }
        }

        // Get user ID from JWT token first
        let userId = null;
        let userData = null;

        if (accessToken) {
          userData = decodeJWT(accessToken);
          console.log("Decoded access token:", userData);
          userId =
            userData?.user?.id || userData?.user?._id || userData?.userId;
        } else if (refreshToken) {
          userData = decodeJWT(refreshToken);
          console.log("Decoded refresh token:", userData);
          userId =
            userData?.user?.id || userData?.user?._id || userData?.userId;
        }

        // If we have stored user data with the same ID, use it as fallback
        let fallbackUser = null;
        if (storedUserData && storedUserData._id === userId) {
          fallbackUser = {
            id: storedUserData._id,
            fullName: storedUserData.fullName,
            username: storedUserData.username,
            email: storedUserData.email,
            profile: {
              avatar: storedUserData.profile?.avatar || "/placeholder-user.jpg",
            },
          };
        }

        // Fetch fresh user data from API if we have userId
        if (userId) {
          try {
            console.log("🔄 Fetching user data from API for userId:", userId);
            const response = await fetch(`/api/users/${userId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const apiUserData = await response.json();
              console.log(
                "✅ Successfully fetched user data from API:",
                apiUserData
              );

              setUser({
                id: apiUserData._id || apiUserData.id,
                fullName: apiUserData.fullName || apiUserData.name,
                username: apiUserData.username,
                email: apiUserData.email,
                profile: {
                  avatar:
                    apiUserData.profile?.avatar ||
                    apiUserData.avatar ||
                    "/placeholder-user.jpg",
                },
              });
              setIsAuthenticated(true);
              return;
            } else {
              console.warn(
                "❌ API call failed, using fallback data. Status:",
                response.status
              );
              if (fallbackUser) {
                setUser(fallbackUser);
                setIsAuthenticated(true);
                return;
              }
            }
          } catch (apiError) {
            console.error("❌ Error fetching user data from API:", apiError);
            if (fallbackUser) {
              console.log("🔄 Using fallback user data from localStorage");
              setUser(fallbackUser);
              setIsAuthenticated(true);
              return;
            }
          }
        }

        // If API call failed, fall back to JWT data or stored data
        if (userData && userData.user) {
          // Extract user data from JWT payload
          console.log("🔐 Using user data from JWT token:", userData.user);
          setUser({
            id: userData.user.id || userData.user._id,
            fullName: userData.user.fullName,
            username: userData.user.username,
            email: userData.user.email,
            profile: {
              avatar: userData.user.profile?.avatar || "/placeholder-user.jpg",
            },
          });
        } else if (userData && userId) {
          // JWT only contains userId, use basic data
          console.log(
            "🔐 JWT only contains userId, using basic data for:",
            userId
          );
          setUser({
            id: userId,
            fullName: "User",
            username: "Account",
            email: "user@example.com",
            profile: { avatar: "/placeholder-user.jpg" },
          });
        } else {
          // Fallback to basic data if all else fails
          console.log("⚠️ No user data available, using minimal fallback");
          setUser({
            id: "unknown",
            fullName: "",
            username: "User",
            email: "",
            profile: { avatar: "/placeholder-user.jpg" },
          });
        }

        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      });
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 via-v0-green/5 to-primary/5 rounded-2xl opacity-50" />
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-10 shadow-xl flex flex-col items-center gap-6">
            <BuySellLoader label="Loading dashboard..." />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
              <p className="text-muted-foreground">
                Setting up your personalized experience...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="relative">
          {/* Background accent */}
          <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 via-red-600/5 to-red-500/5 rounded-2xl opacity-50" />

          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-8 shadow-xl">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">
                  You must be logged in to access the dashboard.
                </p>
                <Badge
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="cursor-pointer px-6 py-2 text-base hover:bg-primary/10 transition-colors"
                >
                  Go to Home
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background border-b border-border/30">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
          </div>

          <div className="container max-w-screen-xl mx-auto px-4 py-6 md:py-8 relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Enhanced Welcome Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your account and listings
                    </p>
                  </div>
                </div>

                {/* Enhanced Welcome Badge */}
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-primary">
                    Welcome back
                    {user?.fullName
                      ? `, ${user.fullName}`
                      : user?.username
                      ? `, ${user.username}`
                      : user?.email
                      ? `, ${user.email.split("@")[0]}`
                      : ""}
                    !
                  </span>
                </div>
              </div>

              {/* Enhanced Navigation Tabs */}
              <div className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-5 gap-0.5 w-full lg:flex lg:w-auto lg:gap-2 overflow-x-auto scrollbar-hide bg-background/80 backdrop-blur-sm border border-border/30 shadow-lg rounded-xl p-0.5 lg:p-2">
                  <TabsTrigger
                    value="profile"
                    aria-label="Profile"
                    className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 shrink-0 min-w-0 lg:min-w-[110px] text-[10px] leading-tight lg:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-v0-dark-blue data-[state=active]:text-white transition-all duration-300"
                  >
                    <User className="h-3 w-3 lg:h-4 lg:w-4 shrink-0" />
                    <span className="font-medium truncate">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="listings"
                    aria-label="Listings"
                    className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 shrink-0 min-w-0 lg:min-w-[110px] text-[10px] leading-tight lg:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-v0-dark-blue data-[state=active]:text-white transition-all duration-300"
                  >
                    <Package className="h-3 w-3 lg:h-4 lg:w-4 shrink-0" />
                    <span className="font-medium truncate">Listings</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="favourites"
                    aria-label="Favourites"
                    className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 shrink-0 min-w-0 lg:min-w-[120px] text-[10px] leading-tight lg:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-v0-dark-blue data-[state=active]:text-white transition-all duration-300"
                  >
                    <Heart className="h-3 w-3 lg:h-4 lg:w-4 shrink-0" />
                    <span className="font-medium truncate">Favourites</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    aria-label="Messages"
                    className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 shrink-0 min-w-0 lg:min-w-[120px] text-[10px] leading-tight lg:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-v0-dark-blue data-[state=active]:text-white transition-all duration-300"
                  >
                    <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4 shrink-0" />
                    <span className="font-medium truncate">Messages</span>
                  </TabsTrigger>
                  {monetizationEnabled && (
                    <TabsTrigger
                      value="monetization"
                      aria-label="Monetization"
                      className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 shrink-0 min-w-0 lg:min-w-[130px] text-[10px] leading-tight lg:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-v0-dark-blue data-[state=active]:text-white transition-all duration-300"
                    >
                      <BadgeDollarSign className="h-3 w-3 lg:h-4 lg:w-4 shrink-0" />
                      <span className="font-medium truncate">Monetization</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="container max-w-screen-xl mx-auto px-4 py-6 md:py-8">
          <TabsContent value="profile" className="space-y-6">
            {user?.id || user?._id ? (
              <div className="relative">
                {/* Background accent */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl opacity-50" />

                <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-xl overflow-hidden">
                  <ProfileTab
                    userId={user?.id || user?._id}
                    onProfileUpdate={refreshUserData}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-50" />
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-8">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">
                      User ID Not Found
                    </h3>
                    <p className="text-muted-foreground">
                      Unable to load profile: User ID is missing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {user?.id || user?._id ? (
              <div className="relative">
                {/* Background accent */}
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 rounded-2xl opacity-50" />

                <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-xl overflow-hidden">
                  <ListingsTab userId={user?.id || user?._id} />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-50" />
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-8">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">
                      User ID Not Found
                    </h3>
                    <p className="text-muted-foreground">
                      Unable to load listings: User ID is missing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favourites" className="space-y-6">
            {user?.id || user?._id ? (
              <div className="relative">
                {/* Background accent */}
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/5 via-red-500/5 to-pink-500/5 rounded-2xl opacity-50" />

                <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-xl overflow-hidden">
                  <FavouritesTab userId={user?.id || user?._id} />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-50" />
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-8">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">
                      User ID Not Found
                    </h3>
                    <p className="text-muted-foreground">
                      Unable to load favourites: User ID is missing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="relative">
              {/* Background accent */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl opacity-50" />

              <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-xl overflow-hidden">
                <MessagesComponent
                  sellerId={chatParams.sellerId}
                  productId={chatParams.productId}
                  productTitle={chatParams.productTitle}
                />
              </div>
            </div>
          </TabsContent>

          {monetizationEnabled && (
            <TabsContent value="monetization" className="space-y-6">
              {user?.id || user?._id ? (
                <MonetizationTab userId={user?.id || user?._id} />
              ) : (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-50" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/30 p-8">
                      <BadgeDollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-2">
                        User ID Not Found
                      </h3>
                      <p className="text-muted-foreground">
                        Unable to load monetization: User ID is missing
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
