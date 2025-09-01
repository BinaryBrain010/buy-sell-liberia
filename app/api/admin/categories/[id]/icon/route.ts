import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../../models/Category';
import { parseFiles } from '@/lib/multer';
import { uploadCategoryIconToLocal, validateCategoryIcon, deleteCategoryIcon } from '@/lib/category-icon-upload';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST: Upload icon for a specific category
export async function POST(
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

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Parse form data
    const { files } = await parseFiles(request);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No icon file provided' }, { status: 400 });
    }

    if (files.length > 1) {
      return NextResponse.json({ error: 'Only one icon file is allowed' }, { status: 400 });
    }

    const iconFile = files[0];

    // Validate icon file
    const validation = validateCategoryIcon(iconFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Delete old icon if exists
    if (category.icon) {
      await deleteCategoryIcon(category.icon);
    }

    // Upload new icon
    const iconPath = await uploadCategoryIconToLocal(iconFile, id);

    // Update category with new icon path
    category.icon = iconPath;
    await category.save();

    return NextResponse.json({
      success: true,
      icon: iconPath,
      message: 'Category icon uploaded successfully'
    });
  } catch (error: any) {
    console.error('Admin category icon upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload category icon',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// DELETE: Remove icon from a specific category
export async function DELETE(
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

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (!category.icon) {
      return NextResponse.json({ error: 'Category has no icon to remove' }, { status: 400 });
    }

    // Delete icon file
    await deleteCategoryIcon(category.icon);

    // Remove icon from category
    category.icon = '';
    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Category icon removed successfully'
    });
  } catch (error: any) {
    console.error('Admin category icon delete error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to remove category icon',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
