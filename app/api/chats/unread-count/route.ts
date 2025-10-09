import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { Chat } from "@/models";

const isValidObjectId = (id?: string | null) =>
  !!id && mongoose.Types.ObjectId.isValid(id);

// GET /api/chats/unread-count?userId=...
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    if (!isValidObjectId(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const uid = new mongoose.Types.ObjectId(userId);

    // Fetch chats where the user is a participant
    const chats = await Chat.find(
      {
        $or: [{ user1: uid }, { user2: uid }],
      },
      { messages: 1 } // only fetch messages array
    ).lean();

    let count = 0;
    for (const chat of chats) {
      const messages = Array.isArray((chat as any).messages)
        ? (chat as any).messages
        : [];
      for (const msg of messages) {
        const sender = String((msg as any).sender || "");
        const readBy = Array.isArray((msg as any).readBy)
          ? (msg as any).readBy.map((id: any) => String(id))
          : [];
        // Unread if not sent by user and userId not in readBy
        if (sender !== String(userId) && !readBy.includes(String(userId))) {
          count++;
        }
      }
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("❌ GET /api/chats/unread-count error:", error);
    return NextResponse.json(
      {
        error: "Failed to get unread count",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
