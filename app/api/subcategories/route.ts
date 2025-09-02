import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Subcategory from '../../../models/Subcategory';
import Category from '../../../models/CategoryNew';
import path from 'path';
import fs from 'fs';
import { parseFiles } from '../../../lib/multer';

// POST: Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell', {
        serverSelectionTimeoutMS: 5000,
      });
    }
    const { files, fields } = await parseFiles(request);
    if (!fields.name || !fields.slug || !fields.categoryId) {
      return NextResponse.json({ message: 'Name, slug, and categoryId are required' }, { status: 400 });
    }
    // Handle icon upload
    let iconPath = '';
    // Accept the first file if no file with name 'icon' is found (for Postman compatibility)
    const iconFile = files.find(f => f.name === 'icon') || files[0];
    if (iconFile) {
      const uploadDir = path.join(process.cwd(), 'uploads/subcategories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${iconFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await iconFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      iconPath = `/uploads/subcategories/${fileName}`;
    } else if (fields.icon) {
      iconPath = fields.icon;
    } else {
      return NextResponse.json({ message: 'Icon is required' }, { status: 400 });
    }
    // Check for duplicate slug in this category
    const existingSubcat = await Subcategory.findOne({ slug: fields.slug, categoryId: fields.categoryId });
    if (existingSubcat) {
      return NextResponse.json({ message: 'Subcategory with this slug already exists in this category' }, { status: 400 });
    }
    // Parse customFields if provided
    let customFields = [];
    if (fields.customFields) {
      try {
        customFields = JSON.parse(fields.customFields);
      } catch {
        return NextResponse.json({ message: 'Invalid customFields format' }, { status: 400 });
      }
    }
    // Check category exists
    const parentCategory = await Category.findById(fields.categoryId);
    if (!parentCategory) {
      return NextResponse.json({ message: 'Parent category not found' }, { status: 400 });
    }
    const subcategory = new Subcategory({
      name: fields.name,
      slug: fields.slug,
      icon: iconPath,
      description: fields.description || '',
      isActive: fields.isActive !== undefined ? fields.isActive === 'true' : true,
      categoryId: fields.categoryId,
      customFields,
    });
    await subcategory.save();
    return NextResponse.json({
      subcategory: subcategory.toObject(),
      message: 'Subcategory created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create subcategory error:', error);
    return NextResponse.json({
      message: 'Error creating subcategory',
      error: (error as Error).message,
    }, { status: 500 });
  }
}
