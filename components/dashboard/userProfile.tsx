"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserProfile() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace USER_ID with the actual user id, e.g. from auth context or props
    const USER_ID = user._id || "";
    if (!USER_ID) return;
    axios.get(`/api/users/${USER_ID}/contact`).then((res) => {
      setUser((prev: any) => ({ ...prev, ...res.data }));
      setLoading(false);
    });
  }, [user._id]);

  const handleSave = () => {
    // You may need to update this endpoint if you want to save contact info
    axios.put(`/api/users/${user._id}/contact`, user).then(() => {
      alert("Profile updated!");
    });
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block mb-1 text-sm font-medium">Name</label>
        <Input
          value={user.name || ""}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <Input
          type="email"
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Phone</label>
        <Input
          value={user.phone || ""}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}
