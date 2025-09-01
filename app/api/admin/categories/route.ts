import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../models/Category';
import { parseFiles, validateFile } from '@/lib/multer';
import { uploadCategoryIconToLocal, validateCategoryIcon, deleteCategoryIcon } from '@/lib/category-icon-upload';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET: Fetch all categories with pagination and filtering
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Build filter
    const filter: any = {};
    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch categories
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Category.countDocuments(filter);

    return NextResponse.json({
      success: true,
      categories,
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
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch categories',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// POST: Create new category
export async function POST(request: NextRequest) {
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

    // Parse form data
    const { files, fields } = await parseFiles(request);
    
    // Parse form data from JSON string
    let formData;
    try {
      formData = JSON.parse(fields.formData || '{}');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid form data format' },
        { status: 400 }
      );
    }

    const { name, description, isActive = true, sortOrder = 0, subcategories = [] } = formData;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${name.toLowerCase().replace(/\s+/g, '-')}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Handle icon upload
    let iconPath = '';
    if (files.length > 0) {
      const iconFile = files[0];
      const validation = validateCategoryIcon(iconFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      
      // Create temporary category ID for icon upload
      const tempCategoryId = new mongoose.Types.ObjectId().toString();
      iconPath = await uploadCategoryIconToLocal(iconFile, tempCategoryId);
    } else {
      return NextResponse.json({ error: 'Category icon is required' }, { status: 400 });
    }

    // Create category
    const category = new Category({
      name,
      slug,
      icon: iconPath,
      description,
      isActive,
      sortOrder,
      subcategories
    });

    await category.save();

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully'
    });
  } catch (error: any) {
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// PUT: Update category
export async function PUT(request: NextRequest) {
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

    // Parse form data
    const { files, fields } = await parseFiles(request);
    
    // Parse form data from JSON string
    let formData;
    try {
      formData = JSON.parse(fields.formData || '{}');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid form data format' },
        { status: 400 }
      );
    }

    const { categoryId, name, description, isActive, sortOrder, subcategories } = formData;

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        _id: { $ne: categoryId },
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${name.toLowerCase().replace(/\s+/g, '-')}$`, 'i') } }
        ]
      });

      if (existingCategory) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
      }
    }

    // Handle icon upload if new icon is provided
    if (files.length > 0) {
      const iconFile = files[0];
      const validation = validateCategoryIcon(iconFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      
      // Delete old icon
      if (category.icon) {
        await deleteCategoryIcon(category.icon);
      }
      
      // Upload new icon
      const iconPath = await uploadCategoryIconToLocal(iconFile, categoryId);
      category.icon = iconPath;
    }

    // Update category fields
    if (name !== undefined) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (subcategories !== undefined) category.subcategories = subcategories;

    await category.save();

    return NextResponse.json({
      success: true,
      category,
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    console.error('Admin categories PUT error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// DELETE: Delete category
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has products (you might want to add this check)
    // const Product = require('../../../../models/Product');
    // const productCount = await Product.countDocuments({ category_id: categoryId });
    // if (productCount > 0) {
    //   return NextResponse.json({ error: 'Cannot delete category with existing products' }, { status: 400 });
    // }

    // Delete icon file
    if (category.icon) {
      await deleteCategoryIcon(category.icon);
    }

    // Delete category
    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Admin categories DELETE error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete category',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
