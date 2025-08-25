import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import Product from '../../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get users first
    const users = await User.find(
      {}, 
      '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken'
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Extract all user IDs for finding their products
    const userIds = users.map(user => user._id);

    // Find all products that belong to these users (use user_id)
    const products = await Product.find({ 
      user_id: { $in: userIds } 
    }).lean();

    // Group products by user_id for efficient lookup
    const productsByUser = new Map();
    products.forEach(product => {
      const userId = product.user_id.toString();
      if (!productsByUser.has(userId)) {
        productsByUser.set(userId, []);
      }
      productsByUser.get(userId).push(product);
    });

    // Build the response with users and their listings
    const usersWithListings = users.map(user => {
      const userId = user._id.toString();
      const userProducts = productsByUser.get(userId) || [];
      return {
        ...user,
        listings: userProducts
      };
    });

    // Get total count for pagination
    const total = await User.countDocuments();

    return NextResponse.json({
      success: true,
      users: usersWithListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching users with listings:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch users with listings' 
      }, 
      { status: 500 }
    );
  }
}