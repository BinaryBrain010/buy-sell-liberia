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

    // Build product filter
    const productFilter: any = {};
    if (searchParams.get('status')) {
      productFilter.status = searchParams.get('status');
    }
    if (searchParams.get('category')) {
      productFilter.category_id = searchParams.get('category');
    }
    if (searchParams.get('location')) {
      productFilter['location.city'] = searchParams.get('location');
    }
    if (searchParams.get('priceMin') || searchParams.get('priceMax')) {
      productFilter['price.amount'] = {};
      if (searchParams.get('priceMin')) {
        productFilter['price.amount'].$gte = parseFloat(searchParams.get('priceMin')!);
      }
      if (searchParams.get('priceMax')) {
        productFilter['price.amount'].$lte = parseFloat(searchParams.get('priceMax')!);
      }
    }
    if (searchParams.get('dateFrom') || searchParams.get('dateTo')) {
      productFilter.added_at = {};
      if (searchParams.get('dateFrom')) {
        productFilter.added_at.$gte = new Date(searchParams.get('dateFrom')!);
      }
      if (searchParams.get('dateTo')) {
        productFilter.added_at.$lte = new Date(searchParams.get('dateTo')!);
      }
    }
    if (searchParams.get('condition')) {
      productFilter['details.condition'] = searchParams.get('condition');
    }

    // Find products with filters and pagination
    const products = await Product.find(productFilter)
      .skip(skip)
      .limit(limit)
      .sort({ added_at: -1 })
      .lean();

    // Get user IDs from products
    const userIds = products.map(product => product.user_id);
    const users = await User.find({ _id: { $in: userIds } }, '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken').lean();
    const usersById = new Map(users.map(user => [user._id.toString(), user]));

    // Group products by user
    const usersWithListings = users.map(user => {
      const userId = user._id.toString();
      const userProducts = products.filter(product => product.user_id.toString() === userId);
      return {
        ...user,
        listings: userProducts
      };
    });

    // Get total count for pagination
    const total = await Product.countDocuments(productFilter);

    // Return both grouped and flat product list for admin convenience
    return NextResponse.json({
      success: true,
      users: usersWithListings,
      products, // flat list of all products matching the filter
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

// PATCH endpoint for admin actions
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { productId, action } = await request.json();
    if (!productId || !action) {
      return NextResponse.json({ error: 'productId and action are required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        product.status = 'active';
        break;
      case 'reject':
        product.status = 'removed';
        break;
      case 'delete':
        await product.deleteOne();
        return NextResponse.json({ success: true, message: 'Product deleted' });
      case 'hide':
        product.status = 'removed';
        break;
      case 'markAsSold':
        product.status = 'sold';
        break;
      case 'feature':
        product.featured = true;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

// PATCH /api/admin/listings/[id]/feature endpoint
export async function PATCH_feature(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.featured = true;
    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to feature product' }, { status: 500 });
  }
}