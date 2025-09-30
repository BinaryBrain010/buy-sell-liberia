import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/models/Product';
import Chat from '@/models/Chat';
import { connectDB } from '@/lib/mongoose';

/**
 * GET /api/cron/unfeature-expired
 * Cron job endpoint to automatically unfeature expired listings
 * 
 * This should be called periodically (e.g., every hour or daily)
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - External cron service (e.g., cron-job.org)
 * - Node-cron in server
 * 
 * Security: Add CRON_SECRET in production to protect this endpoint
 */
export async function GET(req: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ 
        error: 'Unauthorized. Invalid cron secret.' 
      }, { status: 401 });
    }

    await connectDB();

    // Find all featured products with expired featuredExpiresAt
    const now = new Date();
    const expiredProducts = await Product.find({
      featured: true,
      featuredExpiresAt: { $lte: now }
    });

    console.log(`[CRON] Found ${expiredProducts.length} expired featured listings`);

    if (expiredProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired featured listings found',
        count: 0
      });
    }

    // Unfeature expired products
    const productIds = expiredProducts.map(p => p._id);
    const updateResult = await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        $set: { featured: false },
        $unset: { 
          featuredExpiresAt: 1, 
          featuredStartedAt: 1,
          featuredDuration: 1
        }
      }
    );

    console.log(`[CRON] Unfeatured ${updateResult.modifiedCount} products`);

    // Optional: Notify users via chat that their featured period has ended
    const notificationPromises = expiredProducts.map(async (product) => {
      try {
        const userId = product.user_id;
        const productId = product._id;
        const productTitle = product.title;

        // Find or create chat for system notification
        let chat = await Chat.findOne({ product: productId, user2: userId });
        if (!chat) {
          // Create a system chat (user1 = user2 for system messages)
          chat = await Chat.create({ 
            product: productId, 
            user1: userId, 
            user2: userId, 
            messages: [] 
          });
        }

        // Add notification message
        chat.messages.push({ 
          sender: userId, // System message
          content: `Your featured period for "${productTitle}" has ended. To feature it again, please submit a new payment request.`, 
          sentAt: new Date(), 
          readBy: [] 
        });
        chat.lastMessageAt = new Date();
        await chat.save();

        console.log(`[CRON] Notified user ${userId} about expired feature for product ${productId}`);
      } catch (notifyError) {
        console.error(`[CRON] Failed to notify user for product ${product._id}:`, notifyError);
        // Don't fail the entire cron job if notification fails
      }
    });

    await Promise.allSettled(notificationPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully unfeatured ${updateResult.modifiedCount} expired listings`,
      count: updateResult.modifiedCount,
      products: expiredProducts.map(p => ({
        id: p._id,
        title: p.title,
        expiredAt: p.featuredExpiresAt
      }))
    });

  } catch (error: any) {
    console.error('[CRON] Error unfeaturing expired listings:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to unfeature expired listings' 
    }, { status: 500 });
  }
}

/**
 * POST endpoint for manual trigger (admin only)
 * Useful for testing or manual execution
 */
export async function POST(req: NextRequest) {
  // Same logic as GET, but can add admin authentication if needed
  return GET(req);
}
