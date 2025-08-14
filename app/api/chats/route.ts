import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { Chat } from "@/models";
import type { ChatModel } from "@/models/Chat";

const isValidObjectId = (id?: string | null) =>
  !!id && mongoose.Types.ObjectId.isValid(id);

// GET: Fetch chats for a user
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");

  if (!userId)
    return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const query: any = {
    $or: [
      { user1: new mongoose.Types.ObjectId(userId) },
      { user2: new mongoose.Types.ObjectId(userId) },
    ],
  };

  // If provided, only include product filter when it's a valid ObjectId
  if (productId) {
    if (!isValidObjectId(productId)) {
      return NextResponse.json([], { status: 200 });
    }
    query.product = new mongoose.Types.ObjectId(productId);
  }

  const chats = await Chat.find(query)
    .populate("user1", "firstName lastName profile.avatar")
    .populate("user2", "firstName lastName profile.avatar")
    .populate("product", "title images")
    .sort({ lastMessageAt: -1 });

  // Debug logging to see what's actually being returned
  console.log('🔍 Chat API - Raw chats data:', JSON.stringify(chats, null, 2));

  return NextResponse.json(chats);
}

// POST: Create a new chat or add a message
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { product, user1, user2, message } = body as {
    product?: string;
    user1?: string;
    user2?: string;
    message?: {
      sender?: string;
      content?: string;
      sentAt?: string | Date;
      readBy?: string[];
    };
  };

  if (!product || !user1 || !user2 || !message)
    return NextResponse.json(
      { error: "product, user1, user2, and message are required" },
      { status: 400 }
    );

  // Validate IDs
  if (!isValidObjectId(product))
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  if (!isValidObjectId(user1))
    return NextResponse.json({ error: "Invalid user1 id" }, { status: 400 });
  if (!isValidObjectId(user2))
    return NextResponse.json({ error: "Invalid user2 id" }, { status: 400 });

  // Validate message
  if (!message.content || !message.sender) {
    return NextResponse.json(
      { error: "message.sender and message.content are required" },
      { status: 400 }
    );
  }
  if (!isValidObjectId(message.sender)) {
    return NextResponse.json(
      { error: "Invalid message.sender id" },
      { status: 400 }
    );
  }

  // Sanitize/coerce message fields
  const sanitizedMessage = {
    sender: new mongoose.Types.ObjectId(message.sender),
    content: String(message.content),
    sentAt: message.sentAt ? new Date(message.sentAt) : new Date(),
    readBy: Array.isArray(message.readBy)
      ? message.readBy
          .filter(isValidObjectId)
          .map((id) => new mongoose.Types.ObjectId(id as string))
      : [],
  };

  const chat = await Chat.findOne({
    product: new mongoose.Types.ObjectId(product),
    $or: [
      {
        user1: new mongoose.Types.ObjectId(user1),
        user2: new mongoose.Types.ObjectId(user2),
      },
      {
        user1: new mongoose.Types.ObjectId(user2),
        user2: new mongoose.Types.ObjectId(user1),
      },
    ],
  });

  let updatedChat;
  if (!chat) {
    updatedChat = await Chat.create({
      product: new mongoose.Types.ObjectId(product),
      user1: new mongoose.Types.ObjectId(user1),
      user2: new mongoose.Types.ObjectId(user2),
      messages: [sanitizedMessage],
      lastMessageAt: sanitizedMessage.sentAt,
    });
  } else {
    chat.messages.push(sanitizedMessage as any);
    chat.lastMessageAt = sanitizedMessage.sentAt;
    updatedChat = await chat.save();
  }

  await updatedChat.populate("user1", "firstName lastName profile.avatar");
  await updatedChat.populate("user2", "firstName lastName profile.avatar");
  await updatedChat.populate("product", "title images");

  // Debug logging for created/updated chat
  console.log('🔍 Chat API - Updated chat data:', JSON.stringify(updatedChat, null, 2));

  return NextResponse.json(updatedChat);
}

// PUT: Mark a message as read
export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { chatId, messageId, userId } = body;

  if (!chatId || !messageId || !userId)
    return NextResponse.json(
      { error: "chatId, messageId, and userId are required" },
      { status: 400 }
    );

  const chat = await Chat.findById(chatId);
  if (!chat)
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const message = chat.messages.find(
    (msg: { _id: { toString: () => any } }) => msg._id?.toString() === messageId
  );
  if (!message)
    return NextResponse.json({ error: "Message not found" }, { status: 404 });

  if (
    !message.readBy
      .map((id: { toString: () => any }) => id.toString())
      .includes(userId)
  ) {
    message.readBy.push(new mongoose.Types.ObjectId(userId));
    await chat.save();
  }

  return NextResponse.json({ success: true });
}

// DELETE: Remove all chats for a product
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId)
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  if (!isValidObjectId(productId))
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });

  await (Chat as unknown as ChatModel).deleteChatsByProduct(
    new mongoose.Types.ObjectId(productId)
  );
  return NextResponse.json({ success: true });
}
