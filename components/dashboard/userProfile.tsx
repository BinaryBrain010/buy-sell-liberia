"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import Image from "next/image";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  username: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  [key: string]: any;
}

interface UserProfileProps {
  user: User | null;
  onUserChange?: (user: User) => void;
}

export function UserProfile({ user, onUserChange }: UserProfileProps) {
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEditableUser(user);
    if (user?.profileImage) setImagePreview(user.profileImage);
  }, [user]);

  const handleChange = (field: keyof User, value: string) => {
    if (!editableUser) return;
    const updatedUser = { ...editableUser, [field]: value };
    setEditableUser(updatedUser);
    if (onUserChange) onUserChange(updatedUser);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editableUser) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData);
      const imageUrl = response.data.url;

      const updatedUser = { ...editableUser, profileImage: imageUrl };
      setEditableUser(updatedUser);
      if (onUserChange) onUserChange(updatedUser);
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editableUser?._id) return;
    try {
      await axios.put(`/api/users/${editableUser._id}`, editableUser);
      alert("Profile updated!");
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update profile.");
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));

  if (!editableUser) return <p className="text-muted-foreground">Loading user...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background/50 shadow-md border border-border/50 rounded-2xl space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Image */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border shadow-lg">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile Image"
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="w-full">
            <label className="block mb-1 text-sm text-muted-foreground">Upload Profile Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-primary mt-1">Uploading...</p>
            )}
          </div>
        </div>

        {/* Read-Only Info */}
        <div className="flex-1 space-y-4">
  <h3 className="text-lg font-semibold text-foreground">User Information</h3>

  {/* Change grid-cols-1 to grid-cols-2 */}
  <div className="grid grid-cols-2 gap-4">
    {/* Username */}
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1">Username</label>
      <p className="text-base font-medium break-words">{editableUser.username}</p>
    </div>

    {/* Account Status */}
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1">Account Status</label>
      <Badge
        className={`w-fit capitalize ${
          editableUser.status === "active"
            ? "bg-green-500/20 text-green-500"
            : "bg-red-500/20 text-red-500"
        }`}
      >
        {editableUser.status}
      </Badge>
    </div>

    {/* Email Verified */}
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1">Email Verified</label>
      <Badge
        className={`w-fit ${
          editableUser.isEmailVerified
            ? "bg-green-500/20 text-green-500"
            : "bg-red-500/20 text-red-500"
        }`}
      >
        {editableUser.isEmailVerified ? "Verified ✅" : "Not Verified ❌"}
      </Badge>
    </div>

    {/* Member Since */}
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1">Member Since</label>
      <p className="text-base font-medium">{formatDate(editableUser.createdAt)}</p>
    </div>
  </div>
</div>


      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Edit Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", key: "fullName" },
            { label: "Email", key: "email", type: "email" },
            { label: "Phone", key: "phone" },
            { label: "Country", key: "country" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block mb-1 text-sm text-muted-foreground">{label}</label>
              <Input
                type={type || "text"}
                value={editableUser[key as keyof User] || ""}
                onChange={(e) => handleChange(key as keyof User, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}