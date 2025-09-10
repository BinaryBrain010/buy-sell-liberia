import { NextRequest, NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongoose";
import bcrypt from "bcryptjs";

// POST: Add new employee
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { fullName, email, password, role, phone, country, department } =
      await req.json();
    if (!fullName || !email || !password || !role || !phone || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await Employee.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const employee = await Employee.create({
      fullName,
      email,
      password: hash,
      role,
      phone,
      country,
      department,
    });
    return NextResponse.json({ employee });
  } catch (error: any) {
    console.error("Employee creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: List all employees
export async function GET() {
  await dbConnect();
  const employees = await Employee.find().select(
    "fullName email role phone country department createdAt"
  );
  return NextResponse.json({ employees });
}
