import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category, { ICategory, ISubcategory } from '../../../models/Category';
import { IProduct } from '../../../models/Product';

// Force dynamic rendering for all routes
export const dynamic = 'force-dynamic';

// Define a lean version of IProduct to match lean() output
type LeanProduct = Omit<IProduct, keyof Document> & {
  _id: mongoose.Types.ObjectId;
  __v?: number;
};

interface ICategoryWithProducts extends Omit<ICategory, 'subcategories'> {
  subcategories: Array<ISubcategory & { products?: LeanProduct[]; productsPagination?: { total: number; page: number; limit: number; totalPages: number } }>;
}

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
      serverSelectionTimeoutMS: 5000,
    });
  }
}

// GET: Fetch all categories or a specific category with pagination
export async function GET(request: NextRequest) {
  try {
    console.log('Starting GET request for categories');
    await connectDB();
    console.log('Connected to MongoDB');

    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const skip = (page - 1) * limit;
    const categoryId = searchParams.get('categoryId');
    const slug = searchParams.get('slug');
    console.log('Query params:', { includeProducts, limit, page, skip, categoryId, slug });

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
    }

    if (categoryId || slug) {
      console.log('Fetching single category');
      const query = categoryId ? { _id: categoryId } : { slug, isActive: true };
      const category = await Category.findOne(query).lean();
      console.log('Category query result:', category);

      if (!category) {
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }

      if (includeProducts) {
        console.log('Fetching products for category');
        const Product = mongoose.model('Product');
        for (const subcategory of category.subcategories) {
          subcategory.products = await Product.find({
            category_id: category._id,
            subcategory_id: subcategory._id,
            status: 'active',
            expires_at: { $gt: new Date() },
          })
            .limit(limit)
            .skip(skip)
            .lean() as LeanProduct[];
        }
        console.log('Products fetched for category');
      }

      return NextResponse.json({
        category,
        message: 'Category fetched successfully',
      });
    }

    console.log('Fetching all categories');
    const query = Category.find({ isActive: true }).sort({ sortOrder: 1 });
    const total = await Category.countDocuments({ isActive: true });
    const categories: ICategoryWithProducts[] = await query
      .skip(skip)
      .limit(limit)
      .lean();
    console.log('Categories fetched:', categories.length);

    if (includeProducts) {
      console.log('Fetching products for all categories');
      const Product = mongoose.model('Product');
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          subcategory.products = await Product.find({
            category_id: category._id,
            subcategory_id: subcategory._id,
            status: 'active',
            expires_at: { $gt: new Date() },
          })
            .limit(limit)
            .skip(skip)
            .lean() as LeanProduct[];
        }
      }
      console.log('Products fetched for all categories');
    }

    return NextResponse.json({
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Categories fetched successfully',
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      {
        categories: [],
        message: 'Error fetching categories',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.icon || !body.subcategories) {
      return NextResponse.json(
        { message: 'Name, slug, icon, and subcategories are required' },
        { status: 400 }
      );
    }

    // Validate subcategories format
    if (!Array.isArray(body.subcategories) || body.subcategories.length === 0) {
      return NextResponse.json(
        { message: 'Subcategories must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingCategory = await Category.findOne({ slug: body.slug });
    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate subcategory slugs
    const subcategorySlugs = body.subcategories.map((sub: any) => sub.slug);
    if (new Set(subcategorySlugs).size !== subcategorySlugs.length) {
      return NextResponse.json(
        { message: 'Subcategory slugs must be unique within the category' },
        { status: 400 }
      );
    }

    // Create new category
    const category = new Category({
      name: body.name,
      slug: body.slug,
      icon: body.icon,
      description: body.description || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      sortOrder: body.sortOrder || 0,
      subcategories: body.subcategories.map((sub: any) => ({
        name: sub.name,
        slug: sub.slug,
        description: sub.description || '',
        isActive: sub.isActive !== undefined ? sub.isActive : true,
        sortOrder: sub.sortOrder || 0,
        customFields: sub.customFields || [],
      })),
    });

    await category.save();

    return NextResponse.json({
      category: category.toObject(),
      message: 'Category created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      {
        message: 'Error creating category',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// PUT: Update an existing category
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const slug = searchParams.get('slug');

    if (!categoryId && !slug) {
      return NextResponse.json(
        { message: 'Category ID or slug is required' },
        { status: 400 }
      );
    }

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Validate input
    if (!body.name && !body.slug && !body.icon && !body.description && !body.subcategories && body.isActive === undefined && body.sortOrder === undefined) {
      return NextResponse.json(
        { message: 'At least one field to update is required' },
        { status: 400 }
      );
    }

    // Check for duplicate slug if updating slug
    if (body.slug) {
      const existingCategory = await Category.findOne({ slug: body.slug, ...(categoryId ? { _id: { $ne: categoryId } } : {}) });
      if (existingCategory) {
        return NextResponse.json(
          { message: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update object
    const updateData: Partial<ICategory> = {};
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;
    if (body.icon) updateData.icon = body.icon;
    if (body.description) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.subcategories) {
      // Validate subcategory slugs
      const subcategorySlugs = body.subcategories.map((sub: any) => sub.slug);
      if (new Set(subcategorySlugs).size !== subcategorySlugs.length) {
        return NextResponse.json(
          { message: 'Subcategory slugs must be unique within the category' },
          { status: 400 }
        );
      }
      updateData.subcategories = body.subcategories.map((sub: any) => ({
        name: sub.name,
        slug: sub.slug,
        description: sub.description || '',
        isActive: sub.isActive !== undefined ? sub.isActive : true,
        sortOrder: sub.sortOrder || 0,
        customFields: sub.customFields || [],
      }));
    }

    const query = categoryId ? { _id: categoryId } : { slug };
    const category = await Category.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      {
        message: 'Error updating category',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a category
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const slug = searchParams.get('slug');

    if (!categoryId && !slug) {
      return NextResponse.json(
        { message: 'Category ID or slug is required' },
        { status: 400 }
      );
    }

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category has active products
    const Product = mongoose.model('Product');
    const query = categoryId ? { category_id: categoryId } : { category_id: (await Category.findOne({ slug }))?._id };
    const hasProducts = await Product.exists({
      ...query,
      status: 'active',
      expires_at: { $gt: new Date() },
    });

    if (hasProducts) {
      return NextResponse.json(
        { message: 'Cannot delete category with active products' },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndDelete(categoryId ? { _id: categoryId } : { slug }).lean();

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      {
        message: 'Error deleting category',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}