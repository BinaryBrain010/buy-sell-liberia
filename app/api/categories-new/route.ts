import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category from '../../../models/CategoryNew';
import path from 'path';
import fs from 'fs';
import { parseFiles } from '../../../lib/multer';

// POST: Create a new category
export async function POST(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
        serverSelectionTimeoutMS: 5000,
      });
    }
  const { files, fields } = await parseFiles(request) as { files: File[]; fields: Record<string, string> };
  if (!fields.name || !fields.slug) {
      return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
    }
    // Handle icon upload
    let iconPath = '';
    // Accept the first file if no file with name 'icon' is found (for Postman compatibility)
    const iconFile = files.find(f => f.name === 'icon') || files[0];
    if (iconFile) {
      const uploadDir = path.join(process.cwd(), 'uploads/categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${iconFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await iconFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      iconPath = `/uploads/categories/${fileName}`;
    } else if ((fields as Record<string, string>).icon) {
      iconPath = (fields as Record<string, string>).icon;
    } else {
      return NextResponse.json({ message: 'Icon is required' }, { status: 400 });
    }
    // Check for duplicate slug
    const existingCategory = await Category.findOne({ slug: fields.slug });
    if (existingCategory) {
      return NextResponse.json({ message: 'Category with this slug already exists' }, { status: 400 });
    }
    const category = new Category({
      name: fields.name,
      slug: fields.slug,
      icon: iconPath,
      description: fields.description || '',
      isActive: fields.isActive !== undefined ? fields.isActive === 'true' : true,
    });
    await category.save();
    return NextResponse.json({
      category: category.toObject(),
      message: 'Category created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({
      message: 'Error creating category',
      error: (error as Error).message,
    }, { status: 500 });
  }
}

// GET: Fetch all categories or a single category by id/slug
export async function GET(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
        serverSelectionTimeoutMS: 5000,
      });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    let result;
    if (id) {
      result = await Category.findById(id);
      if (!result) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      return NextResponse.json({ category: result });
    }
    if (slug) {
      result = await Category.findOne({ slug });
      if (!result) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      return NextResponse.json({ category: result });
    }
    // All categories, sorted by sortOrder
    const categories = await Category.find().sort({ sortOrder: 1 });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching categories', error: (error as Error).message }, { status: 500 });
  }
}

// PUT: Update a category (by id or slug)
export async function PUT(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
        serverSelectionTimeoutMS: 5000,
      });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    if (!id && !slug) {
      return NextResponse.json({ message: 'Category id or slug is required' }, { status: 400 });
    }
    const { files, fields } = await parseFiles(request);
    // Prepare update object
    const updateData = {};
  if (fields.name) updateData.name = fields.name;
  if (fields.slug) updateData.slug = fields.slug;
  if (fields.description) updateData.description = fields.description;
  if (fields.isActive !== undefined) updateData.isActive = fields.isActive === 'true';
    // Handle icon update
    const iconFile = files.find(f => f.name === 'icon') || files[0];
    if (iconFile) {
      const uploadDir = path.join(process.cwd(), 'uploads/categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${iconFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await iconFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      updateData.icon = `/uploads/categories/${fileName}`;
    } else if ((fields as Record<string, string>).icon) {
      updateData.icon = (fields as Record<string, string>).icon;
    }
    // Update
    const query = id ? { _id: id } : { slug };
    const updated = await Category.findOneAndUpdate(query, { $set: updateData }, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category: updated, message: 'Category updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating category', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Delete a category (by id or slug)
export async function DELETE(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
        serverSelectionTimeoutMS: 5000,
      });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    if (!id && !slug) {
      return NextResponse.json({ message: 'Category id or slug is required' }, { status: 400 });
    }
    const query = id ? { _id: id } : { slug };
    const deleted = await Category.findOneAndDelete(query);
    if (!deleted) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting category', error: (error as Error).message }, { status: 500 });
  }
}
