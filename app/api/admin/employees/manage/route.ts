import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose";

// PATCH: Update employee role/permissions
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const { userId, role, permissions } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  await user.save();
  return NextResponse.json({ user });
}

// DELETE: Remove employee
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { userId } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  await User.findByIdAndDelete(userId);
  return NextResponse.json({ success: true });
}
