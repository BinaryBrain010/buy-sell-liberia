import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/app/api/modules/products/services/product.service";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export const dynamic = "force-dynamic";

const productService = new ProductService();

// GET product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get("incrementViews") === "true";
    const product = await productService.getProductById(
      params.id,
      incrementViews
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const prodObj = (product as any).toObject
      ? (product as any).toObject()
      : product;
    return NextResponse.json({
      message: "Product retrieved successfully",
      product: {
        ...prodObj,
        condition: prodObj.details?.condition || undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get product" },
      { status: 500 }
    );
  }
}

// Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updateData = await request.json();
    if (!params.id || !authResult.userId) {
      return NextResponse.json(
        { error: "Missing product id or user id" },
        { status: 400 }
      );
    }

    console.log("🔄 [PRODUCT API] Update request for product:", params.id);
    console.log("📤 [PRODUCT API] Update data:", updateData);
    console.log("👤 [PRODUCT API] User ID:", authResult.userId);
    // Whitelist allowed fields only. Images and other fields are ignored.
    const sanitized: Record<string, any> = {};
    // Simple fields
    if (typeof updateData.title === "string")
      sanitized.title = updateData.title;
    if (typeof updateData.description === "string")
      sanitized.description = updateData.description;
    if (typeof updateData.status === "string")
      sanitized.status = updateData.status;
    if (
      updateData.tags &&
      (Array.isArray(updateData.tags) || typeof updateData.tags === "string")
    ) {
      const tagsArr = Array.isArray(updateData.tags)
        ? updateData.tags
        : String(updateData.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      sanitized.tags = tagsArr.slice(0, 50);
    }
    // Price (object)
    if (
      updateData.price &&
      typeof updateData.price === "object" &&
      typeof updateData.price.amount !== "undefined"
    ) {
      sanitized.price = {
        amount: Number(updateData.price.amount),
        currency: updateData.price.currency || undefined,
        negotiable:
          typeof updateData.price.negotiable === "boolean"
            ? updateData.price.negotiable
            : undefined,
      };
    }
    // Condition (handled in service to move into details.condition)
    if (typeof updateData.condition === "string")
      sanitized.condition = updateData.condition;
    // Category / Subcategory mapping
    if (typeof updateData.category === "string")
      sanitized.category_id = updateData.category;
    if (typeof updateData.category_id === "string")
      sanitized.category_id = updateData.category_id;
    if (typeof updateData.subcategory === "string")
      sanitized.subcategory_id = updateData.subcategory;
    if (typeof updateData.subcategory_id === "string")
      sanitized.subcategory_id = updateData.subcategory_id;
    // Location fields (dot notation so we don't clobber full object)
    if (typeof updateData.city === "string")
      sanitized["location.city"] = updateData.city;
    if (typeof updateData.state === "string")
      sanitized["location.state"] = updateData.state;
    if (typeof updateData.country === "string")
      sanitized["location.country"] = updateData.country;

    // Explicitly ignore images and other restricted fields
    // e.g., delete updateData.images, updateData.user_id, etc.

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    // Use the ProductService with sanitized payload
    console.log("🔄 [PRODUCT API] Using ProductService for update (sanitized)");
    let product: any = null;
    try {
      product = await productService.updateProduct(
        params.id,
        authResult.userId,
        sanitized as any
      );
    } catch (err: any) {
      return NextResponse.json(
        {
          error:
            err.message || "Product not found or you don't have permission",
        },
        { status: 404 }
      );
    }
    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you don't have permission" },
        { status: 404 }
      );
    }
    const updatedObj = (product as any).toObject
      ? (product as any).toObject()
      : product;
    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        ...updatedObj,
        condition: updatedObj.details?.condition || undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// Delete product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!params.id || !authResult.userId) {
      return NextResponse.json(
        { error: "Missing product id or user id" },
        { status: 400 }
      );
    }
    try {
      await productService.deleteProduct(params.id, authResult.userId);
    } catch (err: any) {
      return NextResponse.json(
        {
          error:
            err.message || "Product not found or you don't have permission",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 400 }
    );
  }
}
