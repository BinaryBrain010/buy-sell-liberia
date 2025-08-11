"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import { authClient } from "../services/Auth.Service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Star, Eye, Calendar, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardSkeleton } from "@/components/dashboard/dashboardSkeleton"
import { ErrorBoundary } from "@/components/dashboard/errorBoundary"

// Lazy load heavy components for better performance
const UserListings = lazy(() => import("@/components/dashboard/userListings"))
const Chats = lazy(() => import("@/components/dashboard/chats").then((module) => ({ default: module.Chats })))
const ProfileForm = lazy(() => import("@/components/dashboard/profileForm"))
const FavouriteListings = lazy(() => import("@/components/dashboard/favouriteListings"))

// Define the shape of the user object to match API response
interface DashboardUser {
  _id: string
  fullName: string
  username: string
  email: string
  phone: string
  password: string
  country: string
  isEmailVerified: boolean
  refreshToken: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Listing {
  _id: string
  title: string
  price: number
  status: string
  createdAt: string
  views?: number
  featured?: boolean
}

export default function DashboardPage() {
  const [tab, setTab] = useState("dashboard")
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentListings, setRecentListings] = useState<Listing[]>([])
  const [totalListings, setTotalListings] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  // Add separate loading states for different sections
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load user profile first, then load other data progressively
    const loadUserProfile = async () => {
      try {
        const response = await authClient.getProfile()
        setUser(response.data || response.user || response)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch user:", err)
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  useEffect(() => {
    // Load dashboard data after user is loaded
    if (user) {
      const loadDashboardData = async () => {
        try {
          // Simulate API calls with progressive loading
          await new Promise((resolve) => setTimeout(resolve, 300))

          setRecentListings([
            {
              _id: "1",
              title: "iPhone 15 Pro",
              price: 999,
              status: "active",
              createdAt: "2024-01-15",
              views: 45,
              featured: true,
            },
            { _id: "2", title: "MacBook Air M2", price: 1299, status: "active", createdAt: "2024-01-14", views: 32 },
            { _id: "3", title: "AirPods Pro", price: 249, status: "sold", createdAt: "2024-01-13", views: 28 },
          ])

          setDashboardLoading(false)

          // Load stats separately
          await new Promise((resolve) => setTimeout(resolve, 200))
          setTotalListings(12)
          setUnreadMessages(3)
          setStatsLoading(false)
        } catch (err) {
          console.error("Failed to load dashboard data:", err)
          setDashboardLoading(false)
          setStatsLoading(false)
        }
      }

      loadDashboardData()
    }
  }, [user])

  const DashboardOverview = () => (
    <div className="space-y-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Listings</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            {statsLoading ? (
              <div className="space-y-1">
                <div className="h-6 w-8 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl font-bold">{totalListings}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            {statsLoading ? (
              <div className="space-y-1">
                <div className="h-6 w-8 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl font-bold">{unreadMessages}</div>
                <p className="text-xs text-muted-foreground">unread messages</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm sm:text-base">Total Views</CardTitle>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            {statsLoading ? (
              <div className="space-y-1">
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">across all listings</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your listings and messages</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Button
                onClick={() => setTab("messages")}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                Messages
                {!statsLoading && unreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                className="flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => router.push("/sell")}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                Create Listing
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                Featured Listing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Listing Section */}
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              Featured Listings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Boost your listings visibility</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Feature your listings to get more visibility and reach more potential buyers.
              </p>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  Apply for Featured
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                  View Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm sm:text-base">Recent Listings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your latest posted items</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          {dashboardLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentListings.map((listing) => (
                <div key={listing._id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{listing.title}</h3>
                      {listing.featured && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs px-1">
                          <Star className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span className="hidden sm:inline">Featured</span>
                        </Badge>
                      )}
                      <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-xs px-1">
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                      <span className="font-medium">${listing.price}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                        {listing.views || 0}
                      </span>
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Calendar className="h-3 w-3" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab("listings")}
              className="w-full text-xs sm:text-sm"
              disabled={dashboardLoading}
            >
              View All Listings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 py-3 sm:py-4">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Welcome back, {user?.fullName || "User"}! Manage your listings and messages.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-3 sm:mb-4 h-9 sm:h-10">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="listings" className="relative text-xs sm:text-sm px-1">
            Listings
            {!statsLoading && (
              <Badge variant="secondary" className="ml-1 text-xs px-1">
                {totalListings}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="relative text-xs sm:text-sm px-1">
            Messages
            {!statsLoading && unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1">
                {unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="favourites" className="text-xs sm:text-sm px-1">
            Favourites
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm px-1">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {loading ? (
            <DashboardSkeleton />
          ) : user ? (
            <ErrorBoundary>
              <DashboardOverview />
            </ErrorBoundary>
          ) : (
            <p>Failed to load dashboard.</p>
          )}
        </TabsContent>

        <TabsContent value="listings">
          <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
              {loading ? (
                <DashboardSkeleton />
              ) : user ? (
                <UserListings userId={user._id} />
              ) : (
                <p>Failed to load user listings.</p>
              )}
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="messages">
          <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
              {loading ? <DashboardSkeleton /> : user ? <Chats /> : <p>Failed to load messages.</p>}
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="favourites">
          <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
              {loading ? (
                <DashboardSkeleton />
              ) : user ? (
                <FavouriteListings userId={user._id} />
              ) : (
                <p>Failed to load favourite listings.</p>
              )}
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="profile">
          <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
              {loading ? <DashboardSkeleton /> : user ? <ProfileForm user={user} /> : <p>Failed to load profile.</p>}
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
