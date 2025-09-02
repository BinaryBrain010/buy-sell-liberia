import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category, { ICategory, ISubcategory } from '../../../models/Category';
import Product, { IProduct } from '../../../models/Product';
import path from 'path';
import fs from 'fs';
import { parseFiles } from '../../../lib/multer';

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

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to preserve existing subcategory IDs and manage sort order
const processSubcategories = (subcategories: any[], existingSubcategories: ISubcategory[] = []): ISubcategory[] => {
  return subcategories.map((sub: any, index: number) => {
    // Find existing subcategory by slug or name to preserve ID
    const existing = existingSubcategories.find(existing => 
      existing.slug === sub.slug || 
      existing.name.toLowerCase() === sub.name.toLowerCase() ||
      (sub._id && existing._id?.toString() === sub._id.toString())
    );

    // Generate slug if not provided
    const slug = sub.slug || generateSlug(sub.name);
    
    return {
      _id: sub._id ? new mongoose.Types.ObjectId(sub._id) : (existing?._id || new mongoose.Types.ObjectId()),
      name: sub.name,
      slug: slug,
      description: sub.description || '',
      isActive: sub.isActive !== undefined ? sub.isActive : true,
      sortOrder: sub.sortOrder !== undefined ? Number(sub.sortOrder) : (existing?.sortOrder ?? index),
      customFields: sub.customFields || existing?.customFields || [],
    };
  });
};

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
    const limit = parseInt(searchParams.get('limit') || '17') || 17;
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

      // Sort subcategories by sortOrder
      category.subcategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      if (includeProducts) {
        console.log('Fetching products for category');
        for (const subcategory of category.subcategories) {
          subcategory.products = await Product.find({
            category_id: category._id,
            subcategory_id: subcategory._id,
            status: 'active',
            expires_at: { $gt: new Date() },
          })
            .limit(limit)
            .skip(skip)
            .lean() as unknown as LeanProduct[];
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
      for (const category of categories) {
        // Sort subcategories by sortOrder before fetching products
        category.subcategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        for (const subcategory of category.subcategories) {
          subcategory.products = await Product.find({
            category_id: category._id,
            subcategory_id: subcategory._id,
            status: 'active',
            expires_at: { $gt: new Date() },
          })
            .limit(limit)
            .skip(skip)
            .lean() as unknown as LeanProduct[];
        }
      }
      console.log('Products fetched for all categories');
    } else {
      // Sort subcategories even when not including products
      for (const category of categories) {
        category.subcategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
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
    // Parse form data (icon file and fields)
    const { files, fields } = await parseFiles(request);
    // Required fields
    if (!fields.name || !fields.slug) {
      return NextResponse.json(
        { message: 'Name, slug, and subcategories are required. If you are using the new separated category/subcategory API, use /api/categories/route.new and do not send subcategories.' },
        { status: 400 }
      );
    }
    // Handle icon upload
    let iconPath = '';
    const iconFile = files.find(f => f.name === 'icon');
    if (iconFile) {
      const uploadDir = path.join(process.cwd(), 'uploads/categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${iconFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await iconFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      iconPath = `/uploads/categories/${fileName}`;
    } else if (fields.icon) {
      iconPath = fields.icon; // fallback if path provided
    } else {
      return NextResponse.json({ message: 'Icon is required' }, { status: 400 });
    }
    // Parse subcategories
    let subcategories: any[] = [];
    if (fields.subcategories) {
    try {
      subcategories = JSON.parse(fields.subcategories);
    } catch {
      return NextResponse.json({ message: 'Invalid subcategories format' }, { status: 400 });
    }
      if (!Array.isArray(subcategories)) {
        return NextResponse.json({ message: 'Subcategories must be an array' }, { status: 400 });
      }
    }
    
    // Check for duplicate category slug
    const existingCategory = await Category.findOne({ slug: fields.slug });
    if (existingCategory) {
      return NextResponse.json({ message: 'Category with this slug already exists' }, { status: 400 });
    }
    
    // Process and validate subcategories
    let processedSubcategories: ISubcategory[] = [];
    if (subcategories.length > 0) {
      // Generate slugs for subcategories that don't have them
      subcategories = subcategories.map(sub => ({
        ...sub,
        slug: sub.slug || generateSlug(sub.name)
      }));
      
      // Validate subcategory names and slugs
      const subcategoryNames = subcategories.map((sub: any) => sub.name.toLowerCase());
    const subcategorySlugs = subcategories.map((sub: any) => sub.slug);
      
      if (new Set(subcategoryNames).size !== subcategoryNames.length) {
        return NextResponse.json({ message: 'Subcategory names must be unique within the category' }, { status: 400 });
      }
      
    if (new Set(subcategorySlugs).size !== subcategorySlugs.length) {
      return NextResponse.json({ message: 'Subcategory slugs must be unique within the category' }, { status: 400 });
    }
      
      processedSubcategories = processSubcategories(subcategories);
    }
    
    // Get sort order for new category
    let categorySortOrder = 0;
    if (fields.sortOrder) {
      categorySortOrder = Number(fields.sortOrder);
    } else {
      const maxCategory = await Category.findOne({}, {}, { sort: { sortOrder: -1 } });
      categorySortOrder = (maxCategory?.sortOrder || 0) + 1;
    }
    
    // Create new category
    const category = new Category({
      name: fields.name,
      slug: fields.slug,
      icon: iconPath,
      description: fields.description || '',
      isActive: fields.isActive !== undefined ? fields.isActive === 'true' : true,
      sortOrder: categorySortOrder,
      subcategories: processedSubcategories,
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
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const slug = searchParams.get('slug');
    if (!categoryId && !slug) {
      return NextResponse.json({ message: 'Category ID or slug is required' }, { status: 400 });
    }
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }
    // Parse form data (icon file and fields)
    const { files, fields } = await parseFiles(request);
    // Check for duplicate slug if updating slug
    if (fields.slug) {
      const existingCategory = await Category.findOne({ slug: fields.slug, ...(categoryId ? { _id: { $ne: categoryId } } : {}) });
      if (existingCategory) {
        return NextResponse.json({ message: 'Category with this slug already exists' }, { status: 400 });
      }
    }
    // Prepare update object
    const updateData: Partial<ICategory> = {};
    if (fields.name) updateData.name = fields.name;
    if (fields.slug) updateData.slug = fields.slug;
    // Handle icon upload
    let iconPath = '';
    const iconFile = files.find(f => f.name === 'icon');
    if (iconFile) {
      const uploadDir = path.join(process.cwd(), 'uploads/categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${iconFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await iconFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      iconPath = `/uploads/categories/${fileName}`;
      updateData.icon = iconPath;
    } else if (fields.icon) {
      updateData.icon = fields.icon;
    }
    if (fields.description) updateData.description = fields.description;
    if (fields.isActive !== undefined) updateData.isActive = fields.isActive === 'true';
    if (fields.sortOrder !== undefined) updateData.sortOrder = Number(fields.sortOrder);
    if (fields.subcategories) {
      let subcategories: any[] = [];
      try {
        subcategories = JSON.parse(fields.subcategories);
      } catch {
        return NextResponse.json({ message: 'Invalid subcategories format' }, { status: 400 });
      }
      
      if (!Array.isArray(subcategories)) {
        return NextResponse.json({ message: 'Subcategories must be an array' }, { status: 400 });
      }
      
      // Get existing category to preserve subcategory data
      const categoryQuery = categoryId ? { _id: categoryId } : { slug };
      const existingCategory = await Category.findOne(categoryQuery);
      if (!existingCategory) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      }
      
      // Generate slugs for subcategories that don't have them
      subcategories = subcategories.map(sub => ({
        ...sub,
        slug: sub.slug || generateSlug(sub.name)
      }));
      
      // Validate subcategory names and slugs
      const subcategoryNames = subcategories.map((sub: any) => sub.name.toLowerCase());
      const subcategorySlugs = subcategories.map((sub: any) => sub.slug);
      
      if (new Set(subcategoryNames).size !== subcategoryNames.length) {
        return NextResponse.json({ message: 'Subcategory names must be unique within the category' }, { status: 400 });
      }
      
      if (new Set(subcategorySlugs).size !== subcategorySlugs.length) {
        return NextResponse.json({ message: 'Subcategory slugs must be unique within the category' }, { status: 400 });
      }
      
      updateData.subcategories = processSubcategories(subcategories, existingCategory.subcategories);
    }
    const query = categoryId ? { _id: categoryId } : { slug };
    const category = await Category.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
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

// PATCH: Add or update individual subcategory
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const action = searchParams.get('action'); // 'add', 'update', 'delete', 'reorder'

    if (!categoryId) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

    if (subcategoryId && !mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return NextResponse.json({ message: 'Invalid subcategory ID' }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const requestData = await request.json();

    switch (action) {
      case 'add': {
        const { name, description, isActive = true, customFields = [] } = requestData;
        
        if (!name) {
          return NextResponse.json({ message: 'Subcategory name is required' }, { status: 400 });
        }

        const slug = generateSlug(name);
        
        // Check for duplicate name or slug
        const duplicate = category.subcategories.find(sub => 
          sub.name.toLowerCase() === name.toLowerCase() || sub.slug === slug
        );
        
        if (duplicate) {
          return NextResponse.json({ message: 'Subcategory with this name already exists' }, { status: 400 });
        }

        const newSubcategory = {
          _id: new mongoose.Types.ObjectId(),
          name,
          slug,
          description: description || '',
          isActive,
          sortOrder: category.subcategories.length,
          customFields,
        };

        category.subcategories.push(newSubcategory);
        await category.save();

        return NextResponse.json({
          subcategory: newSubcategory,
          message: 'Subcategory added successfully',
        });
      }

      case 'update': {
        if (!subcategoryId) {
          return NextResponse.json({ message: 'Subcategory ID is required for update' }, { status: 400 });
        }

        const subcategoryIndex = category.subcategories.findIndex(
          sub => sub._id?.toString() === subcategoryId
        );

        if (subcategoryIndex === -1) {
          return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
        }

        const { name, description, isActive, sortOrder, customFields } = requestData;
        const subcategory = category.subcategories[subcategoryIndex];

        // Check for duplicate name if name is being changed
        if (name && name.toLowerCase() !== subcategory.name.toLowerCase()) {
          const duplicate = category.subcategories.find((sub, index) => 
            index !== subcategoryIndex && sub.name.toLowerCase() === name.toLowerCase()
          );
          
          if (duplicate) {
            return NextResponse.json({ message: 'Subcategory with this name already exists' }, { status: 400 });
          }
          
          subcategory.name = name;
          subcategory.slug = generateSlug(name);
        }

        if (description !== undefined) subcategory.description = description;
        if (isActive !== undefined) subcategory.isActive = isActive;
        if (sortOrder !== undefined) subcategory.sortOrder = sortOrder;
        if (customFields !== undefined) subcategory.customFields = customFields;

        await category.save();

        return NextResponse.json({
          subcategory,
          message: 'Subcategory updated successfully',
        });
      }

      case 'delete': {
        if (!subcategoryId) {
          return NextResponse.json({ message: 'Subcategory ID is required for delete' }, { status: 400 });
        }

        const subcategoryIndex = category.subcategories.findIndex(
          sub => sub._id?.toString() === subcategoryId
        );

        if (subcategoryIndex === -1) {
          return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
        }

        // Check if subcategory has active products
        const hasProducts = await Product.exists({
          category_id: categoryId,
          subcategory_id: subcategoryId,
          status: 'active',
          expires_at: { $gt: new Date() },
        });

        if (hasProducts) {
          return NextResponse.json(
            { message: 'Cannot delete subcategory with active products' },
            { status: 400 }
          );
        }

        category.subcategories.splice(subcategoryIndex, 1);
        
        // Reorder remaining subcategories
        category.subcategories.forEach((sub, index) => {
          sub.sortOrder = index;
        });

        await category.save();

        return NextResponse.json({
          message: 'Subcategory deleted successfully',
        });
      }

      case 'reorder': {
        const { subcategories } = requestData;
        
        if (!Array.isArray(subcategories)) {
          return NextResponse.json({ message: 'Subcategories array is required for reorder' }, { status: 400 });
        }

        // Validate that all provided subcategories exist
        for (const sub of subcategories) {
          if (!sub._id || !mongoose.Types.ObjectId.isValid(sub._id)) {
            return NextResponse.json({ message: 'Invalid subcategory ID in reorder data' }, { status: 400 });
          }
          
          const exists = category.subcategories.find(existing => 
            existing._id?.toString() === sub._id.toString()
          );
          
          if (!exists) {
            return NextResponse.json({ message: `Subcategory with ID ${sub._id} not found` }, { status: 400 });
          }
        }

        // Update sort orders
        subcategories.forEach((sub, index) => {
          const existing = category.subcategories.find(existing => 
            existing._id?.toString() === sub._id.toString()
          );
          if (existing) {
            existing.sortOrder = index;
          }
        });

        await category.save();

        return NextResponse.json({
          subcategories: category.subcategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
          message: 'Subcategories reordered successfully',
        });
      }

      default:
        return NextResponse.json({ message: 'Invalid action. Use: add, update, delete, or reorder' }, { status: 400 });
    }
  } catch (error) {
    console.error('Subcategory management error:', error);
    return NextResponse.json(
      {
        message: 'Error managing subcategory',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}