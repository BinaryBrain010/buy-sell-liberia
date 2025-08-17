import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/app/api/modules/products/services/product.service";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';

const productService = new ProductService();

// GET product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get("incrementViews") === "true";
    const product = await productService.getProductById(params.id, incrementViews);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get product" }, { status: 500 });
  }
}


// Update product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updateData = await request.json();
    if (!params.id || !authResult.userId) {
      return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
    }

    console.log('🔄 [PRODUCT API] Update request for product:', params.id);
    console.log('📤 [PRODUCT API] Update data:', updateData);
    console.log('👤 [PRODUCT API] User ID:', authResult.userId);

    // Check if this is an images-only update
    const isImagesOnlyUpdate = updateData.images && 
      Object.keys(updateData).length === 1 && 
      Array.isArray(updateData.images);

    if (isImagesOnlyUpdate) {
      console.log('🖼️ [PRODUCT API] Detected images-only update, using direct database access');
      
      // For images-only updates, use direct database access to avoid ProductService issues
      try {
        const mongoose = require('mongoose');
        const dbConnect = require('@/lib/mongoose').default;
        const { Product } = require('@/models');
        
        await dbConnect();
        
        // Find product and verify ownership using user_id field
        const product = await Product.findOne({
          _id: params.id,
          user_id: authResult.userId
        });

        if (!product) {
          console.log('❌ [PRODUCT API] Product not found or user does not have permission');
          return NextResponse.json({ 
            error: "Product not found or you don't have permission to update it" 
          }, { status: 404 });
        }

        console.log('✅ [PRODUCT API] Product found, updating images...');

        // Update the product images
        const updatedProduct = await Product.findByIdAndUpdate(
          params.id,
          { 
            $set: { images: updateData.images },
            updated_at: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!updatedProduct) {
          return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
        }

        console.log('✅ [PRODUCT API] Images updated successfully');

        return NextResponse.json({
          message: "Product images updated successfully",
          product: updatedProduct
        });

      } catch (dbError: any) {
        console.error('❌ [PRODUCT API] Database error:', dbError);
        return NextResponse.json({ 
          error: "Failed to update images: " + dbError.message 
        }, { status: 500 });
      }
    }

    // For other updates, use the ProductService
    console.log('🔄 [PRODUCT API] Using ProductService for update');
    let product: any = null;
    try {
      product = await productService.updateProduct(params.id, authResult.userId, updateData);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Product not found or you don't have permission" }, { status: 404 });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found or you don't have permission" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

// Delete product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!params.id || !authResult.userId) {
      return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
    }
    try {
      await productService.deleteProduct(params.id, authResult.userId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Product not found or you don't have permission" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 400 });
  }
}