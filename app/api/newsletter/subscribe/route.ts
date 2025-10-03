import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import NewsletterSubscription from "@/models/NewsletterSubscription";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    const { email, tags, preferences } = body;

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

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if email already exists
    const existingSubscription = await NewsletterSubscription.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return NextResponse.json(
          { 
            message: "Email is already subscribed to our newsletter",
            subscribed: true 
          },
          { status: 200 }
        );
      } else if (existingSubscription.status === 'unsubscribed') {
        // Resubscribe
        existingSubscription.status = 'active';
        existingSubscription.unsubscribedAt = undefined;
        existingSubscription.bounceCount = 0;
        await existingSubscription.save();
        return NextResponse.json(
          { 
            message: "Successfully resubscribed to our newsletter",
            subscribed: true 
          },
          { status: 200 }
        );
      } else if (existingSubscription.status === 'bounced') {
        return NextResponse.json(
          { 
            error: "This email address has been marked as bounced and cannot be subscribed",
            subscribed: false 
          },
          { status: 400 }
        );
      }
    }

    // Create new subscription
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const subscription = new NewsletterSubscription({
      email: email.toLowerCase(),
      status: 'active',
      source: 'website',
      ipAddress,
      userAgent,
      tags: tags || ['general'],
      preferences: preferences || {
        frequency: 'weekly',
        categories: ['general']
      },
      verificationToken,
      verified: false, // Set to true for now, can implement email verification later
    });

    await subscription.save();

    // TODO: Send verification email if needed
    // For now, we'll mark as verified immediately
    subscription.verified = true;
    await subscription.save();

    return NextResponse.json(
      { 
        message: "Successfully subscribed to our newsletter",
        subscribed: true 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("[NEWSLETTER SUBSCRIPTION] Error:", error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          message: "Email is already subscribed to our newsletter",
          subscribed: true 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || "Failed to subscribe to newsletter",
        subscribed: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const subscription = await NewsletterSubscription.findOne({ 
      email: email.toLowerCase() 
    });

    if (!subscription) {
      return NextResponse.json(
        { 
          subscribed: false,
          message: "Email not found in newsletter subscriptions" 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      subscribed: subscription.status === 'active',
      status: subscription.status,
      subscribedAt: subscription.subscribedAt,
      verified: subscription.verified,
    });

  } catch (error: any) {
    console.error("[NEWSLETTER CHECK] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
