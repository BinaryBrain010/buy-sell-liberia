"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserListings } from "@/components/dashboard/userListings";
import { UserProfile } from "@/components/dashboard/userProfile";
import { Favorites } from "@/components/dashboard/favourites";
import { Chats } from "@/components/dashboard/chats";

export default function DashboardPage() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/auth/profile")
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {loading ? (
            <p>Loading profile...</p>
          ) : user ? (
            <UserProfile user={user} />
          ) : (
            <p>Failed to load user.</p>
          )}
        </TabsContent>
        <TabsContent value="listings">{/* <UserListings /> */}</TabsContent>

        <TabsContent value="favorites">{/* <Favorites /> */}</TabsContent>

        <TabsContent value="chats">{/* <Chats /> */}</TabsContent>

      </Tabs>
    </div>
  );
}

