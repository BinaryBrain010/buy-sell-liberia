import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/api/modules/auth/middlewares/next-auth-middleware';
import ManualPayment from '@/models/ManualPayment';
import Product from '@/models/Product';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';
import dbConnect from '@/lib/mongoose';

/**
 * POST /api/products/bump-payment
 * Submit bump payment application
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, plan, method, screenshot, transactionId, userNotes } = await req.json();

    if (!productId || !plan || !method || !screenshot || !transactionId) {
      return NextResponse.json({ 
        error: "Missing required fields: productId, plan, method, screenshot, transactionId" 
      }, { status: 400 });
    }

    await dbConnect();

    // Verify product exists and user owns it
    const product = await Product.findOne({
      _id: productId,
      user_id: authResult.userId,
      status: { $in: ['active', 'pending'] }
    });

    if (!product) {
      return NextResponse.json({ 
        error: "Product not found, you don't own this product, or product is not active" 
      }, { status: 404 });
    }

    // Get pricing information
    const settings = await SettingsService.getAllSettings();
    const prices = settings.monetizationPrices || {};
    const bumpPricing = prices.bump_listing || {
      "1_bump": { price: 100, credits: 1 },
      "3_bumps": { price: 250, credits: 3 },
      "5_bumps": { price: 400, credits: 5 },
      "10_bumps": { price: 750, credits: 10 }
    };

    const planDetails = bumpPricing[plan];
    if (!planDetails) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Create manual payment record
    const manualPayment = new ManualPayment({
      user: authResult.userId,
      listing: productId,
      amount: planDetails.price,
      method,
      screenshot,
      transactionId,
      status: "pending",
      userNotes,
      featureType: "bump_listing",
      featurePlan: plan,
      featureDuration: planDetails.credits,
      bumpCredits: planDetails.credits
    });

    await manualPayment.save();

    return NextResponse.json({
      success: true,
      message: `Bump payment application submitted successfully for product "${product.title}". Credits will be added after admin approval.`,
      paymentId: manualPayment._id,
      product: {
        id: product._id,
        title: product.title,
        currentBumpCredits: product.bumpCredits || 0
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in /api/products/bump-payment POST:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to submit bump payment' 
    }, { status: 500 });
  }
}
