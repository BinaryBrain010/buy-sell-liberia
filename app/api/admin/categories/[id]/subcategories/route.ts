import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../../../models/Category';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET: Fetch all subcategories for a specific category
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
      subcategories: category.subcategories || []
    });
  } catch (error: any) {
    console.error('Admin subcategories GET error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch subcategories',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// POST: Add new subcategory to a category
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
    const subcategoryData = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const { name, description, isActive = true, sortOrder = 0, customFields = [] } = subcategoryData;

    if (!name) {
      return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if subcategory with same name or slug already exists in this category
    const existingSubcategory = category.subcategories.find(
      (sub: any) => 
        sub.name.toLowerCase() === name.toLowerCase() || 
        sub.slug === slug
    );

    if (existingSubcategory) {
      return NextResponse.json({ error: 'Subcategory with this name already exists in this category' }, { status: 400 });
    }

    // Create new subcategory
    const newSubcategory = {
      name,
      slug,
      description,
      isActive,
      sortOrder,
      customFields,
      _id: new mongoose.Types.ObjectId()
    };

    category.subcategories.push(newSubcategory);
    await category.save();

    return NextResponse.json({
      success: true,
      subcategory: newSubcategory,
      message: 'Subcategory created successfully'
    });
  } catch (error: any) {
    console.error('Admin subcategories POST error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create subcategory',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// PUT: Update all subcategories for a category
export async function PUT(
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
    const { subcategories } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    if (!Array.isArray(subcategories)) {
      return NextResponse.json({ error: 'Subcategories must be an array' }, { status: 400 });
    }

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Validate and process subcategories
    const processedSubcategories = subcategories.map((sub: any, index: number) => {
      if (!sub.name) {
        throw new Error(`Subcategory at index ${index} is missing name`);
      }

      const slug = sub.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      return {
        ...sub,
        slug,
        _id: sub._id ? new mongoose.Types.ObjectId(sub._id) : new mongoose.Types.ObjectId(),
        isActive: sub.isActive !== undefined ? sub.isActive : true,
        sortOrder: sub.sortOrder !== undefined ? sub.sortOrder : index,
        customFields: sub.customFields || []
      };
    });

    // Check for duplicate names or slugs
    const names = processedSubcategories.map((sub: any) => sub.name.toLowerCase());
    const slugs = processedSubcategories.map((sub: any) => sub.slug);
    
    if (new Set(names).size !== names.length) {
      return NextResponse.json({ error: 'Duplicate subcategory names found' }, { status: 400 });
    }
    
    if (new Set(slugs).size !== slugs.length) {
      return NextResponse.json({ error: 'Duplicate subcategory slugs found' }, { status: 400 });
    }

    // Update subcategories
    category.subcategories = processedSubcategories;
    await category.save();

    return NextResponse.json({
      success: true,
      subcategories: category.subcategories,
      message: 'Subcategories updated successfully'
    });
  } catch (error: any) {
    console.error('Admin subcategories PUT error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update subcategories',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
