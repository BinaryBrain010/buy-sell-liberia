import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/api/modules/auth/middlewares/next-auth-middleware';
import Product from '@/models/Product';
import ManualPayment from '@/models/ManualPayment';
import dbConnect from '@/lib/mongoose';

/**
 * GET /api/products/[id]/bump-status
 * Get bump status and credits for a specific product
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get product and verify ownership
    const product = await Product.findOne({
      _id: params.id,
      user_id: authResult.userId
    });

    if (!product) {
      return NextResponse.json({ 
        error: "Product not found or you don't own this product" 
      }, { status: 404 });
    }

    // Get pending bump payments for this product
    const pendingPayments = await ManualPayment.find({
      user: authResult.userId,
      listing: params.id,
      featureType: 'bump_listing',
      status: 'pending'
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      product: {
        id: product._id,
        title: product.title,
        status: product.status,
        bumpCredits: product.bumpCredits || 0,
        bumpHistory: product.bumpHistory || [],
        added_at: product.added_at,
        canBump: (product.bumpCredits || 0) > 0 && product.status === 'active'
      },
      pendingPayments: pendingPayments.map(payment => ({
        id: payment._id,
        plan: payment.featurePlan,
        credits: payment.bumpCredits,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt
      }))
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/products/[id]/bump-status GET:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get bump status' 
    }, { status: 500 });
  }
}
