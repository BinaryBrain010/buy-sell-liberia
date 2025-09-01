import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import Category from '../../../../models/Category';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST: Bulk operations on categories
export async function POST(request: NextRequest) {
  try {
    // Auth: Only super_admin can perform bulk operations
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

    const { operation, categoryIds, data } = await request.json();

    if (!operation || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json({ 
        error: 'Operation, categoryIds (array) are required' 
      }, { status: 400 });
    }

    // Validate category IDs
    const validIds = categoryIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json({ error: 'No valid category IDs provided' }, { status: 400 });
    }

    let result: any = {};

    switch (operation) {
      case 'activate':
        result = await Category.updateMany(
          { _id: { $in: validIds } },
          { $set: { isActive: true } }
        );
        break;

      case 'deactivate':
        result = await Category.updateMany(
          { _id: { $in: validIds } },
          { $set: { isActive: false } }
        );
        break;

      case 'delete':
        // Check if any categories have products (you might want to add this check)
        // const Product = require('../../../../models/Product');
        // const categoriesWithProducts = await Product.distinct('category_id', { 
        //   category_id: { $in: validIds } 
        // });
        // if (categoriesWithProducts.length > 0) {
        //   return NextResponse.json({ 
        //     error: 'Cannot delete categories with existing products',
        //     categoriesWithProducts 
        //   }, { status: 400 });
        // }

        // Delete icon files for categories being deleted
        const categoriesToDelete = await Category.find({ _id: { $in: validIds } });
        const { deleteCategoryIcon } = await import('@/lib/category-icon-upload');
        
        for (const category of categoriesToDelete) {
          if (category.icon) {
            await deleteCategoryIcon(category.icon);
          }
        }

        result = await Category.deleteMany({ _id: { $in: validIds } });
        break;

      case 'updateSortOrder':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json({ 
            error: 'Data array with sortOrder updates is required' 
          }, { status: 400 });
        }

        const bulkOps = data.map((item: any) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(item.categoryId) },
            update: { $set: { sortOrder: item.sortOrder } }
          }
        }));

        result = await Category.bulkWrite(bulkOps);
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operation,
      result,
      message: `Bulk ${operation} operation completed successfully`
    });
  } catch (error: any) {
    console.error('Admin categories bulk operation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform bulk operation',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
