"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserListings } from "@/components/dashboard/userListings";
import { UserProfile } from "@/components/dashboard/userProfile";
import { Favorites } from "@/components/dashboard/favourites";
import { Chats } from "@/components/dashboard/chats";

export default function DashboardPage() {
  const [tab, setTab] = useState("listings");

  return (
    <div className="min-h-screen container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Dashboard</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {/* <UserListings /> */}
        </TabsContent>

        <TabsContent value="favorites">
          {/* <Favorites /> */}
        </TabsContent>

        <TabsContent value="chats">
          {/* <Chats /> */}
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
}
