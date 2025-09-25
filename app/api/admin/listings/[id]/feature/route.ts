import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import Product from "../../../../../../models/Product";
import { createAdminAuditLogger, extractUserInfoFromPayload } from '../../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from "../../../../../../lib/audit-logger";

// PATCH /api/admin/listings/[id]/feature endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId: adminUserId, role: adminRole, email: adminEmail, name: adminName } = extractUserInfoFromPayload(payload);
    const { id } = params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminUserId, adminRole, adminEmail, adminName);

    // Determine desired featured state from body or query
    let desired: boolean | undefined;
    try {
      const body = (await request.json().catch(() => undefined)) as any;
      if (body) {
        if (typeof body.featured === "boolean") desired = body.featured;
        if (typeof body.action === "string") {
          if (body.action === "feature") desired = true;
          if (body.action === "unfeature") desired = false;
        }
      }
    } catch {
      // ignore json parse errors
    }

    if (desired === undefined) {
      const sp = new URL(request.url).searchParams;
      const qAction = sp.get("action");
      const qFeatured = sp.get("featured");
      if (qAction === "feature") desired = true;
      if (qAction === "unfeature") desired = false;
      if (qFeatured === "true") desired = true;
      if (qFeatured === "false") desired = false;
    }

    if (desired === undefined) {
      return NextResponse.json(
        {
          error:
            "Provide { featured: boolean } or { action: 'feature'|'unfeature' }",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousFeatured = product.featured;
    product.featured = desired;
    await product.save();

    // Log the listing feature operation
    const operation = desired ? OperationType.LISTING_FEATURE : OperationType.LISTING_UNFEATURE;
    await logger.logListingOperation(operation, id, {
      adminUserId,
      adminRole,
      adminEmail,
      adminName,
      productTitle: product.title,
      productOwner: product.user_id.toString(),
      previousFeatured,
      newFeatured: desired,
      productCategory: product.category_id.toString(),
      productSubcategory: product.subcategory_id.toString(),
      summary: `${desired ? 'Featured' : 'Unfeatured'} product "${product.title}" by ${adminName} (${adminRole})`
    });

    return NextResponse.json({
      success: true,
      message: desired ? "Product featured" : "Product unfeatured",
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update feature status" },
      { status: 500 }
    );
  }
}
