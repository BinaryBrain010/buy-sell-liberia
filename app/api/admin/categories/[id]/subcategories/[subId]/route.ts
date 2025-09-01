import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../../../../models/Category';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET: Fetch specific subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
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

    const { id, subId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subId)) {
      return NextResponse.json({ error: 'Invalid category or subcategory ID' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const subcategory = category.getSubcategory(new mongoose.Types.ObjectId(subId));
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subcategory
    });
  } catch (error: any) {
    console.error('Admin subcategory GET error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch subcategory',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// PATCH: Update specific subcategory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
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

    const { id, subId } = params;
    const updateData = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subId)) {
      return NextResponse.json({ error: 'Invalid category or subcategory ID' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Find subcategory index
    const subcategoryIndex = category.subcategories.findIndex(
      (sub: any) => sub._id?.toString() === subId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== category.subcategories[subcategoryIndex].name) {
      const existingSubcategory = category.subcategories.find(
        (sub: any, index: number) => 
          index !== subcategoryIndex && 
          (sub.name.toLowerCase() === updateData.name.toLowerCase() || 
           sub.slug === updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
      );

      if (existingSubcategory) {
        return NextResponse.json({ error: 'Subcategory with this name already exists in this category' }, { status: 400 });
      }
    }

    // Update subcategory fields
    const subcategory = category.subcategories[subcategoryIndex];
    if (updateData.name !== undefined) {
      subcategory.name = updateData.name;
      subcategory.slug = updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (updateData.description !== undefined) subcategory.description = updateData.description;
    if (updateData.isActive !== undefined) subcategory.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined) subcategory.sortOrder = updateData.sortOrder;
    if (updateData.customFields !== undefined) subcategory.customFields = updateData.customFields;

    await category.save();

    return NextResponse.json({
      success: true,
      subcategory,
      message: 'Subcategory updated successfully'
    });
  } catch (error: any) {
    console.error('Admin subcategory PATCH error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update subcategory',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// DELETE: Delete specific subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subId: string } }
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

    const { id, subId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subId)) {
      return NextResponse.json({ error: 'Invalid category or subcategory ID' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Find subcategory index
    const subcategoryIndex = category.subcategories.findIndex(
      (sub: any) => sub._id?.toString() === subId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    // Check if subcategory has products (you might want to add this check)
    // const Product = require('../../../../../../../models/Product');
    // const productCount = await Product.countDocuments({ 
    //   category_id: id, 
    //   subcategory_id: subId 
    // });
    // if (productCount > 0) {
    //   return NextResponse.json({ error: 'Cannot delete subcategory with existing products' }, { status: 400 });
    // }

    // Remove subcategory
    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error: any) {
    console.error('Admin subcategory DELETE error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete subcategory',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
