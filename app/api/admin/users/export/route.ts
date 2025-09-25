// NOTE: Make sure to install dependencies: npm install json2csv pdfkit
import { NextRequest } from "next/server";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "@/models/User";
import { Parser as Json2csvParser } from "json2csv";
import PDFDocument from "pdfkit";
import { createAdminAuditLogger } from "../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 🔒 Auth: Allow super_admin and manager roles
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response("No token", { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !["super_admin", "manager"].includes((payload as any).role)
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // 🔗 Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // 👥 Get all users (excluding sensitive fields)
    const users = await User.find(
      {},
      "-password -passwordResetToken -emailVerificationToken -phoneVerificationToken"
    ).lean();

    // Get all user IDs
    const userIds = users.map((u) => u._id);

    // Get all products for these users
    const Product = (await import("@/models/Product")).default;
    const products = await Product.find({ user_id: { $in: userIds } }).lean();

    // Get all chats for these users
    const Chat = (await import("@/models/Chat")).default;
    const chats = await Chat.find({
      $or: [{ user1: { $in: userIds } }, { user2: { $in: userIds } }],
    }).lean();

    // Map userId to their products and chats
    const productsByUser: Record<string, any[]> = {};
    products.forEach((p) => {
      const uid = p.user_id.toString();
      if (!productsByUser[uid]) productsByUser[uid] = [];
      productsByUser[uid].push(p);
    });
    const chatsByUser: Record<string, any[]> = {};
    chats.forEach((c) => {
      [c.user1, c.user2].forEach((uidRaw) => {
        const uid = uidRaw.toString();
        if (!chatsByUser[uid]) chatsByUser[uid] = [];
        chatsByUser[uid].push(c);
      });
    });

    // Fetch reviews (given and received)
    const Review = (await import("@/models/Review")).default;
    const reviewsGiven = await Review.find({
      reviewer_id: { $in: userIds },
    }).lean();
    const reviewsReceived = await Review.find({
      reviewed_user_id: { $in: userIds },
    }).lean();
    const reviewsGivenByUser: Record<string, any[]> = {};
    const reviewsReceivedByUser: Record<string, any[]> = {};
    reviewsGiven.forEach((r) => {
      const uid = r.reviewer_id.toString();
      if (!reviewsGivenByUser[uid]) reviewsGivenByUser[uid] = [];
      reviewsGivenByUser[uid].push(r);
    });
    reviewsReceived.forEach((r) => {
      const uid = r.reviewed_user_id.toString();
      if (!reviewsReceivedByUser[uid]) reviewsReceivedByUser[uid] = [];
      reviewsReceivedByUser[uid].push(r);
    });

    // Fetch reports (filed and received)
    const Report = (await import("@/models/Report")).default;
    const reportsFiled = await Report.find({
      reported_by: { $in: userIds },
    }).lean();
    const reportsReceived = await Report.find({
      product_id: { $in: products.map((p) => p._id) },
    }).lean();
    const reportsFiledByUser: Record<string, any[]> = {};
    const reportsReceivedByUser: Record<string, any[]> = {};
    reportsFiled.forEach((r) => {
      const uid = r.reported_by.toString();
      if (!reportsFiledByUser[uid]) reportsFiledByUser[uid] = [];
      reportsFiledByUser[uid].push(r);
    });
    reportsReceived.forEach((r) => {
      // Find owner of the product
      const product = products.find(
        (p) => p._id.toString() === r.product_id.toString()
      );
      if (product) {
        const uid = product.user_id.toString();
        if (!reportsReceivedByUser[uid]) reportsReceivedByUser[uid] = [];
        reportsReceivedByUser[uid].push(r);
      }
    });

    // Fetch manual payments
    const ManualPayment = (await import("@/models/ManualPayment")).default;
    const manualPayments = await ManualPayment.find({
      user: { $in: userIds },
    }).lean();
    const manualPaymentsByUser: Record<string, any[]> = {};
    manualPayments.forEach((mp) => {
      const uid = mp.user.toString();
      if (!manualPaymentsByUser[uid]) manualPaymentsByUser[uid] = [];
      manualPaymentsByUser[uid].push(mp);
    });

    // Fetch withdrawal logs
    const WithdrawalLog = (await import("@/models/WithdrawalLog")).default;
    const withdrawalLogs = await WithdrawalLog.find({
      admin: { $in: userIds },
    }).lean();
    const withdrawalLogsByUser: Record<string, any[]> = {};
    withdrawalLogs.forEach((wl) => {
      const uid = wl.admin?.toString();
      if (uid) {
        if (!withdrawalLogsByUser[uid]) withdrawalLogsByUser[uid] = [];
        withdrawalLogsByUser[uid].push(wl);
      }
    });

    // Fetch announcements targeted to the user
    const Announcement = (await import("@/models/Announcement")).default;
    const announcements = await Announcement.find({
      "targetAudience.userIds": { $in: userIds },
    }).lean();
    const announcementsByUser: Record<string, any[]> = {};
    announcements.forEach((a) => {
      (a.targetAudience?.userIds || []).forEach((uidRaw: any) => {
        const uid = uidRaw.toString();
        if (!announcementsByUser[uid]) announcementsByUser[uid] = [];
        announcementsByUser[uid].push(a);
      });
    });

    // 📄 Get format from query (?format=csv)
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "csv").toLowerCase();

    // Create audit logger and log data export
    const logger = createAdminAuditLogger(
      request,
      payload._id || payload.id || "unknown"
    );
    await logger.logCustomOperation(
      ModuleType.DATA_MANAGEMENT,
      OperationType.DATA_EXPORT,
      "user_data",
      "User",
      {
        adminUserId: payload._id || payload.id || "unknown",
        exportFormat: format,
        recordCount: users.length,
        summary: `Exported ${
          users.length
        } user records in ${format.toUpperCase()} format`,
      }
    );

    if (format === "csv") {
      // Build CSV rows with all user-related data
      const rows = users.map((user) => {
        const userIdStr = user._id.toString();
        return {
          ...user,
          favoriteProducts: JSON.stringify(user.likedProducts || []),
          listings: JSON.stringify(productsByUser[userIdStr] || []),
          chats: JSON.stringify(chatsByUser[userIdStr] || []),
          reviewsGiven: JSON.stringify(reviewsGivenByUser[userIdStr] || []),
          reviewsReceived: JSON.stringify(
            reviewsReceivedByUser[userIdStr] || []
          ),
          reportsFiled: JSON.stringify(reportsFiledByUser[userIdStr] || []),
          reportsReceived: JSON.stringify(
            reportsReceivedByUser[userIdStr] || []
          ),
          manualPayments: JSON.stringify(manualPaymentsByUser[userIdStr] || []),
          withdrawalLogs: JSON.stringify(withdrawalLogsByUser[userIdStr] || []),
          announcements: JSON.stringify(announcementsByUser[userIdStr] || []),
        };
      });
      const fields = Object.keys(rows[0] || {});
      const parser = new Json2csvParser({ fields });
      const csv = parser.parse(rows);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="users.csv"',
        },
      });
    } else {
      return new Response("Invalid format. Use ?format=csv", { status: 400 });
    }
  } catch (error: any) {
    console.error("Error exporting user data:", error);
    return new Response("Failed to export user data", { status: 500 });
  }
}
