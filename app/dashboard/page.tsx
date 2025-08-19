"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Package, Heart, MessageCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MessagesComponent } from "@/components/dashboard/MessagesComponent";
import UserListings from "@/components/dashboard/userListings";
import ProfileForm from "@/components/dashboard/profileForm";
import FavouriteListings from "@/components/dashboard/favouriteListings";

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
const ProfileTab = ({ userId }: { userId: string }) => (
  <ProfileForm userId={userId} />
);

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
  const [chatParams, setChatParams] = useState<{
    sellerId?: string;
    productId?: string;
  }>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthentication();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      const sellerId = urlParams.get("sellerId");
      const productId = urlParams.get("productId");

      if (tab === "messages") {
        setActiveTab("messages");
      }

      if (sellerId || productId) {
        setChatParams({
          sellerId: sellerId || undefined,
          productId: productId || undefined,
        });
      }
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

        if (storedUserData) {
          // Use the stored user data from auth provider
          const userData = {
            id: storedUserData._id,
            firstName:
              storedUserData.fullName?.split(" ")[0] || storedUserData.username,
            lastName:
              storedUserData.fullName?.split(" ").slice(1).join(" ") || "",
            email: storedUserData.email,
            profile: {
              avatar: storedUserData.profile?.avatar || "/placeholder-user.jpg",
            },
          };
          console.log("🔐 Setting user from stored data:", userData);
          setUser(userData);
          setIsAuthenticated(true);
          return;
        }

        // If no stored user data, try to decode JWT token
        let userData = null;
        if (accessToken) {
          userData = decodeJWT(accessToken);
          console.log("Decoded access token:", userData);
        } else if (refreshToken) {
          userData = decodeJWT(refreshToken);
          console.log("Decoded refresh token:", userData);
        }

        if (userData && userData.user) {
          // Extract user data from JWT payload
          console.log("🔐 Found user data in token:", userData.user);
          const userDataObj = {
            id: userData.user.id || userData.user._id,
            firstName:
              userData.user.firstName ||
              userData.user.fullName?.split(" ")[0] ||
              userData.user.username,
            lastName:
              userData.user.lastName ||
              userData.user.fullName?.split(" ").slice(1).join(" ") ||
              "",
            email: userData.user.email,
            profile: {
              avatar: userData.user.profile?.avatar || "/placeholder-user.jpg",
            },
          };
          console.log("🔐 Setting user from JWT user data:", userDataObj);
          setUser(userDataObj);
        } else if (userData && userData.userId) {
          // JWT only contains userId, we need to get user data from somewhere else
          console.log("🔐 JWT only contains userId:", userData.userId);
          // Since we don't have user data, we'll use a generic approach
          const userDataObj = {
            id: userData.userId,
            firstName: "User",
            lastName: "Account",
            email: "user@example.com",
            profile: {
              avatar: "/placeholder-user.jpg",
            },
          };
          console.log("🔐 Setting user from JWT userId:", userDataObj);
          setUser(userDataObj);
        } else {
          // Fallback to mock data if JWT decoding fails
          console.log("No user data found in token, using fallback");
          setUser({
            id: "user123",
            firstName: "",
            lastName: "Account",
            email: "user@example.com",
            profile: {
              avatar: "/placeholder-user.jpg",
            },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You must be logged in to access the dashboard.
          </p>
          <Badge
            variant="outline"
            onClick={() => router.push("/")}
            className="cursor-pointer"
          >
            Go to Home
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-2.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold truncate">Dashboard</h1>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-1 h-6 px-2 text-xs whitespace-nowrap"
                >
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
                </Badge>
              </div>
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="flex items-center gap-1 overflow-x-auto whitespace-nowrap w-full sm:w-auto">
                  <TabsTrigger
                    value="profile"
                    aria-label="Profile"
                    className="h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <User className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="listings"
                    aria-label="Listings"
                    className="h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Package className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Listings</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="favourites"
                    aria-label="Favourites"
                    className="h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Heart className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Favourites</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    aria-label="Messages"
                    className="h-8 px-2 text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Messages</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4">
          <TabsContent value="profile" className="space-y-4">
            {user?.id || user?._id ? (
              <ProfileTab userId={user?.id || user?._id} />
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">User ID Not Found</h3>
                <p className="text-muted-foreground">
                  Unable to load profile: User ID is missing
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            {user?.id || user?._id ? (
              <ListingsTab userId={user?.id || user?._id} />
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">User ID Not Found</h3>
                <p className="text-muted-foreground">
                  Unable to load listings: User ID is missing
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favourites" className="space-y-4">
            {user?.id || user?._id ? (
              <FavouritesTab userId={user?.id || user?._id} />
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">User ID Not Found</h3>
                <p className="text-muted-foreground">
                  Unable to load favourites: User ID is missing
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <MessagesComponent
              sellerId={chatParams.sellerId}
              productId={chatParams.productId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
