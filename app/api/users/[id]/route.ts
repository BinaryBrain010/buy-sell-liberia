import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models";

const isValidObjectId = (id?: string | null) =>
  !!id && mongoose.Types.ObjectId.isValid(id);

// GET: Fetch user profile by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const userId = params.id;

  if (!userId || !isValidObjectId(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findById(userId).select(
      "firstName lastName username email profile.avatar"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
