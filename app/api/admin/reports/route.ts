import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import Report from "../../../../models/Report";
import Product from "../../../../models/Product";
import User, { type IUser } from "../../../../models/User";
import Chat from "../../../../models/Chat";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { EmailService } from "@/app/api/modules/auth/services/email.service";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";

// GET: View all reports, filter by reason, status, product, user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check:
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(request.url);
    const filter: any = {};
    if (searchParams.get("reason")) filter.reason = searchParams.get("reason");
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("product_id"))
      filter.product_id = searchParams.get("product_id");
    if (searchParams.get("user_id"))
      filter.reported_by = searchParams.get("user_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;
    const reports = await Report.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .populate("product_id")
      .populate(
        "reported_by",
        "-password -passwordResetToken -emailVerificationToken -phoneVerificationToken"
      )
      .lean();
    const total = await Report.countDocuments(filter);
    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// PATCH: Admin actions (approve, remove, warn, ban)
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No token" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check:
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      userId: adminUserId,
      role: adminRole,
      email: adminEmail,
      name: adminName,
    } = extractUserInfoFromPayload(payload);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(
      request,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );

    const { reportId, action, adminNotes } = await request.json();
    if (!reportId || !action) {
      return NextResponse.json(
        { error: "reportId and action are required" },
        { status: 400 }
      );
    }
    const report = await Report.findById(reportId);
    if (!report)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const previousStatus = report.status;
    let product, user;

    // Helper: ensure a system sender user exists for chat messages
    async function ensureSystemSender(): Promise<IUser> {
      const SYSTEM_EMAIL = (
        process.env.SYSTEM_ANNOUNCEMENT_USER_EMAIL ||
        process.env.ADMIN_SUPER_EMAIL ||
        process.env.SMTP_USER ||
        "announcements@buysellliberia.com"
      ).toLowerCase();
      const SYSTEM_NAME =
        process.env.SYSTEM_ANNOUNCEMENT_USER_NAME || "BuySellLiberia";

      let sender = (await User.findOne({
        email: SYSTEM_EMAIL,
      })) as IUser | null;
      if (sender) {
        if (!sender.isActive || sender.isBlocked || sender.isBanned) {
          sender.isActive = true;
          sender.isBlocked = false;
          sender.isBanned = false;
          await sender.save();
        }
        return sender;
      }

      const passwordSeed =
        process.env.SYSTEM_ANNOUNCEMENT_USER_PASSWORD ||
        crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(passwordSeed, 10);
      sender = (await User.create({
        fullName: SYSTEM_NAME,
        username: `system_${Math.random().toString(36).slice(2, 8)}`,
        email: SYSTEM_EMAIL,
        password: hashedPassword,
        isActive: true,
        isBlocked: false,
        isBanned: false,
        emailVerified: true,
        profile: {
          verificationStatus: "email_verified",
          rating: { average: 0, count: 0 },
        },
      } as Partial<IUser>)) as IUser;
      return sender;
    }

    switch (action) {
      case "approve":
        report.status = "approved";
        report.adminAction = "approve";
        // Log report approval
        await logger.logReportOperation(OperationType.REPORT_ACTION, reportId, {
          adminUserId,
          reportReason: report.reason,
          reportedBy: report.reported_by.toString(),
          productId: report.product_id.toString(),
          previousStatus,
          newStatus: "approved",
          action: "approve",
          adminNotes,
        });
        break;
      case "remove":
        report.status = "removed";
        report.adminAction = "remove";
        product = await Product.findById(report.product_id);
        if (product) {
          product.status = "removed";
          await product.save();
        }
        // Log report removal action
        await logger.logReportOperation(OperationType.REPORT_ACTION, reportId, {
          adminUserId,
          reportReason: report.reason,
          reportedBy: report.reported_by.toString(),
          productId: report.product_id.toString(),
          previousStatus,
          newStatus: "removed",
          action: "remove",
          productRemoved: true,
          adminNotes,
        });
        break;
      case "warn":
        report.status = "resolved";
        report.adminAction = "warn";
        user = await User.findById(report.reported_by);
        // Also load product for email/chat context
        product = report.product_id
          ? await Product.findById(report.product_id).lean()
          : null;
        if (user) {
          user.isBlocked = true;
          await user.save();
        }
        // Send warning email and a system chat message to the user
        if (user) {
          try {
            const emailService = new EmailService();
            const subject = "Account Warning - BuySell Liberia";
            const reasonLine = report.reason
              ? `<div><strong>Reason:</strong> ${report.reason}</div>`
              : "";
            const notesLine = adminNotes
              ? `<div><strong>Admin notes:</strong> ${adminNotes}</div>`
              : "";
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL || "https://buysellliberia.com";
            const productTitle = product?.title ? String(product.title) : null;
            const productPrice =
              product?.price?.amount != null
                ? `${Number(product.price.amount).toLocaleString()} ${
                    product?.price?.currency || ""
                  }`.trim()
                : null;
            const productLocation = product?.location
              ? [
                  product.location.city,
                  product.location.state,
                  product.location.country,
                ]
                  .filter(Boolean)
                  .join(", ")
              : null;
            const productDesc = product?.description
              ? String(product.description).slice(0, 240)
              : null;
            const productUrl = product
              ? `${baseUrl}/products/${
                  (product as any).slug || (product as any)._id
                }`
              : null;
            const productLine = productTitle
              ? `
              <div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa">
                <div style="font-weight:600;margin-bottom:6px;">Reported Listing</div>
                <div><strong>Title:</strong> ${productTitle}</div>
                ${
                  productPrice
                    ? `<div><strong>Price:</strong> ${productPrice}</div>`
                    : ""
                }
                ${
                  productLocation
                    ? `<div><strong>Location:</strong> ${productLocation}</div>`
                    : ""
                }
                ${
                  productDesc
                    ? `<div style="margin-top:6px;"><strong>Details:</strong> ${productDesc}${
                        product &&
                        product.description &&
                        product.description.length > 240
                          ? "…"
                          : ""
                      }</div>`
                    : ""
                }
                ${
                  productUrl
                    ? `<div style="margin-top:6px;"><a href="${productUrl}" target="_blank" rel="noopener" style="color:#2563eb;">View listing</a></div>`
                    : ""
                }
              </div>
            `
              : "";
            const html = `
              <!doctype html>
              <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
              <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:0;background:#f7f7f8}.container{max-width:640px;margin:0 auto;padding:24px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.header{background:#dc2626;color:#fff;padding:16px 20px}.content{padding:20px}.muted{color:#6b7280;font-size:12px}</style>
              </head><body>
                <div class="container">
                  <div class="card">
                    <div class="header"><h2 style="margin:0;font-size:18px;">Account Warning</h2></div>
                    <div class="content">
                      <p>Hi ${user.fullName || user.username || "there"},</p>
                      <p>Your account has been flagged by our moderation team. Please review the details below and ensure future activity complies with our Terms of Use.</p>
                      ${reasonLine}
                      ${notesLine}
                      ${productLine}
                      <p class="muted">If you believe this is a mistake, reply to this email and we will review your case.</p>
                      <p>— BuySell Liberia Team</p>
                    </div>
                  </div>
                </div>
              </body></html>`;
            await emailService.sendHtml(user.email, subject, html);
          } catch (mailErr) {
            console.error(
              "[WARN] Failed sending warning email:",
              (mailErr as any)?.message || mailErr
            );
          }
          try {
            const senderUser = await ensureSystemSender();
            let chat = await Chat.findOne({
              user1: senderUser._id,
              user2: user._id,
              product: null,
            });
            if (!chat) {
              chat = new Chat({
                user1: senderUser._id,
                user2: user._id,
                product: null,
                messages: [],
              });
            }
            const parts: string[] = ["Account Warning from BuySell Liberia"];
            if (report.reason) parts.push(`Reason: ${report.reason}`);
            if (adminNotes) parts.push(`Notes: ${adminNotes}`);
            if (product && product.title)
              parts.push(`Product: ${String(product.title)}`);
            const messageContent = parts.join(" | ");
            chat.messages.push({
              sender: senderUser._id,
              content: messageContent,
              sentAt: new Date(),
              readBy: [],
            });
            chat.lastMessageAt = new Date();
            await chat.save();
          } catch (chatErr) {
            console.error(
              "[WARN] Failed sending warning chat:",
              (chatErr as any)?.message || chatErr
            );
          }
        }
        // Log report warn action
        await logger.logReportOperation(OperationType.REPORT_ACTION, reportId, {
          adminUserId,
          reportReason: report.reason,
          reportedBy: report.reported_by.toString(),
          productId: report.product_id.toString(),
          previousStatus,
          newStatus: "resolved",
          action: "warn",
          userBlocked: true,
          adminNotes,
        });
        break;
      case "ban":
        report.status = "resolved";
        report.adminAction = "ban";
        // Ban the owner of the reported product, not the reporter
        product = await Product.findById(report.product_id);
        let bannedUserId = null;
        if (product && product.user_id) {
          user = await User.findById(product.user_id);
          bannedUserId = product.user_id;
        }
        if (user) {
          user.isBanned = true;
          user.banReason = "Flagged by admin via report";
          user.bannedAt = new Date();
          await user.save();
        }
        // Log report ban action
        await logger.logReportOperation(OperationType.REPORT_ACTION, reportId, {
          adminUserId,
          reportReason: report.reason,
          reportedBy: report.reported_by.toString(),
          productId: report.product_id.toString(),
          bannedUserId: bannedUserId ? bannedUserId.toString() : null,
          previousStatus,
          newStatus: "resolved",
          action: "ban",
          userBanned: true,
          banReason: "Flagged by admin via report",
          adminNotes,
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (adminNotes) report.adminNotes = adminNotes;
    await report.save();
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update report" },
      { status: 500 }
    );
  }
}
