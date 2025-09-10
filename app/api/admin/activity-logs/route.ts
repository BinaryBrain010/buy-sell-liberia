import { NextRequest, NextResponse } from "next/server";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/mongoose";

// GET: List activity logs, filterable by user or action
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url!);
  const user = searchParams.get("user");
  const action = searchParams.get("action");
  const filter: any = {};
  if (user) filter.user = user;
  if (action) filter.action = action;
  const logs = await ActivityLog.find(filter)
    .populate("user", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(100);
  return NextResponse.json({ logs });
}
