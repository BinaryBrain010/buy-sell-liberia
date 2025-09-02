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
    const { files, fields } = await parseFiles(request);
    if (!fields.name || !fields.slug) {
      return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
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
      iconPath = fields.icon;
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
