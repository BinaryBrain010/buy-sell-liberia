"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/user/chats").then((res) => {
      setChats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading your chats...</p>;

  if (chats.length === 0)
    return <p className="text-muted-foreground">No chat history found.</p>;
//TODO after schema and api setup
//   return (
//     <div className="space-y-4">
//       {chats.map((chat) => (
//         <div key={chat._id} className="p-4 border rounded-xl bg-muted">
//           <h4 className="font-medium">With: {chat.otherUserName}</h4>
//           <p className="text-muted-foreground truncate">
//             Last message: {chat.lastMessage}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
}
