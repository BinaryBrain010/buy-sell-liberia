import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../../models/Category';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET: Fetch single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only admin and super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to DB if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error: any) {
    console.error('Admin category GET error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// PATCH: Update specific category fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only admin and super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to DB if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;
    const updateData = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        _id: { $ne: id },
        $or: [
          { name: { $regex: new RegExp(`^${updateData.name}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${updateData.name.toLowerCase().replace(/\s+/g, '-')}$`, 'i') } }
        ]
      });

      if (existingCategory) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
      }
    }

    // Update category fields
    if (updateData.name !== undefined) {
      category.name = updateData.name;
      category.slug = updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (updateData.description !== undefined) category.description = updateData.description;
    if (updateData.isActive !== undefined) category.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined) category.sortOrder = updateData.sortOrder;

    await category.save();

    return NextResponse.json({
      success: true,
      category,
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    console.error('Admin category PATCH error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// DELETE: Delete specific category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only super_admin can delete categories
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to DB if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has products (you might want to add this check)
    // const Product = require('../../../../../models/Product');
    // const productCount = await Product.countDocuments({ category_id: id });
    // if (productCount > 0) {
    //   return NextResponse.json({ error: 'Cannot delete category with existing products' }, { status: 400 });
    // }

    // Delete icon file
    if (category.icon) {
      const { deleteCategoryIcon } = await import('@/lib/category-icon-upload');
      await deleteCategoryIcon(category.icon);
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Admin category DELETE error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
