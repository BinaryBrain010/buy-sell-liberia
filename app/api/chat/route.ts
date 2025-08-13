import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Chat } from "@/models";

// GET: Fetch chats for a user (as user1 or user2, optionally by product)
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const query: any = { $or: [{ user1: userId }, { user2: userId }] };
  if (productId) query.product = productId;
  const chats = await Chat.find(query)
    .populate("user1", "firstName lastName profile.avatar")
    .populate("user2", "firstName lastName profile.avatar")
    .populate("product", "title images")
    .sort({ lastMessageAt: -1 });
  return NextResponse.json(chats);
}

// POST: Create a new chat or add a message to an existing chat
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { product, user1, user2, message } = body;
  if (!product || !user1 || !user2 || !message) {
    return NextResponse.json({ error: "product, user1, user2, and message are required" }, { status: 400 });
  }
  // Try to find existing chat
  let chat = await Chat.findOne({ product, user1, user2 });
  if (!chat) {
    chat = await Chat.create({
      product,
      user1,
      user2,
      messages: [message],
      lastMessageAt: message.sentAt || new Date(),
    });
  } else {
    chat.messages.push(message);
    chat.lastMessageAt = message.sentAt || new Date();
    await chat.save();
  }
  await chat.populate("user1", "firstName lastName profile.avatar");
  await chat.populate("user2", "firstName lastName profile.avatar");
  await chat.populate("product", "title images");
  return NextResponse.json(chat);
}

// PUT: Mark messages as read or update chat
export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { chatId, messageId, userId } = body;
  if (!chatId || !messageId || !userId) {
    return NextResponse.json({ error: "chatId, messageId, and userId are required" }, { status: 400 });
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
  const message = chat.getMessageById(messageId);
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
  if (!message.readBy.map(id => id.toString()).includes(userId)) {
    message.readBy.push(userId);
    await chat.save();
  }
  return NextResponse.json({ success: true });
}

// DELETE: Remove all chats for a product (when product is deleted)
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  await Chat.deleteChatsByProduct(productId);
  return NextResponse.json({ success: true });
}
