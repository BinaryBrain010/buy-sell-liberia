import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import NewsletterSubscription from "@/models/NewsletterSubscription";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Find and unsubscribe
    const subscription = await NewsletterSubscription.findOne({ 
      email: email.toLowerCase() 
    });

    if (!subscription) {
      return NextResponse.json(
        { 
          message: "Email not found in our newsletter subscriptions",
          unsubscribed: false 
        },
        { status: 404 }
      );
    }

    if (subscription.status === 'unsubscribed') {
      return NextResponse.json(
        { 
          message: "Email is already unsubscribed",
          unsubscribed: true 
        },
        { status: 200 }
      );
    }

    subscription.status = 'unsubscribed';
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    return NextResponse.json(
      { 
        message: "Successfully unsubscribed from our newsletter",
        unsubscribed: true 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[NEWSLETTER UNSUBSCRIBE] Error:", error.message);
    return NextResponse.json(
      { 
        error: error.message || "Failed to unsubscribe from newsletter",
        unsubscribed: false 
      },
      { status: 500 }
    );
  }
}
