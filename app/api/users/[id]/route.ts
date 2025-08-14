import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';

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
      "firstName lastName email phone profile preferences activity emailVerified phoneVerified"
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

// PUT: Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user is updating their own profile
    if (authResult.userId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const updateData = await req.json();
    console.log('🔄 [USER API] Update request for user:', userId);
    console.log('📤 [USER API] Update data:', updateData);

    await dbConnect();

    // Prepare the update object
    const updateObject: any = {};
    
    if (updateData.firstName !== undefined) updateObject.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) updateObject.lastName = updateData.lastName;
    if (updateData.phone !== undefined) updateObject.phone = updateData.phone;
    
    if (updateData.profile) {
      updateObject.profile = {};
      if (updateData.profile.displayName !== undefined) updateObject.profile.displayName = updateData.profile.displayName;
      if (updateData.profile.bio !== undefined) updateObject.profile.bio = updateData.profile.bio;
      if (updateData.profile.avatar !== undefined) updateObject.profile.avatar = updateData.profile.avatar;
    }
    
    if (updateData.preferences) {
      updateObject.preferences = {};
      if (updateData.preferences.defaultLocation) {
        updateObject.preferences.defaultLocation = {};
        if (updateData.preferences.defaultLocation.city !== undefined) updateObject.preferences.defaultLocation.city = updateData.preferences.defaultLocation.city;
        if (updateData.preferences.defaultLocation.state !== undefined) updateObject.preferences.defaultLocation.state = updateData.preferences.defaultLocation.state;
        if (updateData.preferences.defaultLocation.country !== undefined) updateObject.preferences.defaultLocation.country = updateData.preferences.defaultLocation.country;
      }
      if (updateData.preferences.notifications) {
        updateObject.preferences.notifications = {};
        if (updateData.preferences.notifications.emailUpdates !== undefined) updateObject.preferences.notifications.emailUpdates = updateData.preferences.notifications.emailUpdates;
        if (updateData.preferences.notifications.smsUpdates !== undefined) updateObject.preferences.notifications.smsUpdates = updateData.preferences.notifications.smsUpdates;
        if (updateData.preferences.notifications.pushNotifications !== undefined) updateObject.preferences.notifications.pushNotifications = updateData.preferences.notifications.pushNotifications;
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      { new: true, runValidators: true }
    ).select("firstName lastName email phone profile preferences activity emailVerified phoneVerified");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    console.log('✅ [USER API] User updated successfully');

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error: any) {
    console.error("❌ [USER API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
