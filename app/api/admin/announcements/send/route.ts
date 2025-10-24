import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Announcement from "@/models/Announcement";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import User, { type IUser } from "@/models/User";
import Chat from "@/models/Chat";
import {
  ensureSystemAnnouncementUser,
  sendChatMessageToUsers,
} from "@/app/api/modules/notifications/services/chat-notification.service";
import NewsletterSubscription from "@/models/NewsletterSubscription";
import { EmailService } from "@/app/api/modules/auth/services/email.service";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../lib/audit-logger";

// Helper to send a generic email
async function sendGenericEmail(
  emailService: EmailService,
  to: string,
  subject: string,
  html: string
) {
  await emailService["transporter"].sendMail({
    from: `"BuySell Liberia" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

const SYSTEM_ANNOUNCEMENT_EMAIL = (
  process.env.SYSTEM_ANNOUNCEMENT_USER_EMAIL ||
  process.env.ADMIN_SUPER_EMAIL ||
  process.env.SMTP_USER ||
  "announcements@buysellliberia.com"
).toLowerCase();

const SYSTEM_ANNOUNCEMENT_NAME =
  process.env.SYSTEM_ANNOUNCEMENT_USER_NAME || "BuySellLiberia";

const SYSTEM_USERNAME_SOURCE =
  process.env.SYSTEM_ANNOUNCEMENT_USER_USERNAME ||
  SYSTEM_ANNOUNCEMENT_EMAIL.split("@")[0] ||
  "buysell_announcements";

const SYSTEM_ANNOUNCEMENT_USERNAME = SYSTEM_USERNAME_SOURCE.replace(
  /[^a-zA-Z0-9_]/g,
  "_"
).toLowerCase();

const SYSTEM_ANNOUNCEMENT_ROLE = "system";

const BROADCAST_ENDPOINT = (
  process.env.ANNOUNCEMENT_BROADCAST_URL ||
  "http://localhost:3001/broadcast-announcement"
).replace(/\/$/, "");

// moved ensureSystemAnnouncementUser and resolveAnnouncementSender to shared service

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let adminUserId = "system-announcement";
    let adminRole = SYSTEM_ANNOUNCEMENT_ROLE;
    let adminEmail = SYSTEM_ANNOUNCEMENT_EMAIL;
    let adminName = SYSTEM_ANNOUNCEMENT_NAME;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const payload = AdminAuthService.verifyAccessToken(token);
        if (
          payload &&
          typeof payload === "object" &&
          AdminAuthService.isAllowedRole((payload as any).role)
        ) {
          const info = extractUserInfoFromPayload(payload);
          if (info.userId && info.userId !== "unknown") {
            adminUserId = info.userId;
          }
          if (info.role && info.role !== "unknown") {
            adminRole = info.role;
          }
          if (info.email && info.email !== "unknown") {
            adminEmail = info.email.toLowerCase();
          }
          if (info.name && info.name !== "unknown") {
            adminName = info.name;
          }
        }
      }
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await request.json();
    const { title, content, type, scheduledAt, targetAudience } = body;
    if (
      !title ||
      !content ||
      !type ||
      !Array.isArray(type) ||
      type.length === 0
    ) {
      return NextResponse.json(
        { error: "title, content, and at least one type are required" },
        { status: 400 }
      );
    }
    // Save the announcement
    const announcement = new Announcement({
      title,
      content,
      type,
      status: "sent",
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      scheduledAt,
      targetAudience,
    });
    await announcement.save();
    // Emit real-time announcement if type includes banner, popup, or chat
    if (
      type.includes("banner") ||
      type.includes("popup") ||
      type.includes("chat")
    ) {
      try {
        await fetch(BROADCAST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: announcement._id,
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            sentAt: announcement.sentAt,
            expiresAt: announcement.expiresAt,
          }),
        });
      } catch (broadcastError) {
        console.error(
          "Failed to broadcast announcement",
          BROADCAST_ENDPOINT,
          broadcastError
        );
      }
    }
    // Email delivery - send to newsletter subscribers only
    if (type.includes("email")) {
      const subscribers = await NewsletterSubscription.find({
        status: "active",
        verified: true,
      });
      const emailService = new EmailService();
      const subject = announcement.title || "Announcement from BuySell Liberia";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${announcement.title}</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; line-height: 1.6;">${
              announcement.content
            }</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was sent to you because you subscribed to our newsletter.<br>
            <a href="${
              process.env.NEXT_PUBLIC_BASE_URL || "https://buysellliberia.com"
            }/unsubscribe?email={{email}}" style="color: #999;">Unsubscribe</a>
          </p>
        </div>
      `;

      let successCount = 0;
      let failureCount = 0;

      for (const subscriber of subscribers) {
        try {
          // Replace {{email}} placeholder with actual email
          const personalizedHtml = html.replace(
            /\{\{email\}\}/g,
            subscriber.email
          );

          await sendGenericEmail(
            emailService,
            subscriber.email,
            subject,
            personalizedHtml
          );

          // Update last email sent timestamp
          subscriber.lastEmailSent = new Date();
          await subscriber.save();
          successCount++;
        } catch (e) {
          const errMsg = (e as Error)?.message || e;
          console.error(
            "Failed to send announcement email to",
            subscriber.email,
            errMsg
          );

          // Record bounce if it's a delivery failure
          const errorMessage = String(errMsg).toLowerCase();
          if (
            errorMessage.includes("bounce") ||
            errorMessage.includes("invalid") ||
            errorMessage.includes("not found")
          ) {
            subscriber.bounceCount += 1;
            if (subscriber.bounceCount >= 3) {
              subscriber.status = "bounced";
            }
            await subscriber.save();
          }
          failureCount++;
        }
      }

      console.log(
        `Email announcement sent: ${successCount} successful, ${failureCount} failed`
      );
    }
    // Chat delivery: use the platform system sender so messages appear from BuySellLiberia
    if (type.includes("chat")) {
      const senderUser = await ensureSystemAnnouncementUser();
      const users = await User.find(
        {
          isActive: true,
          isBlocked: false,
          isBanned: false,
          _id: { $ne: senderUser._id },
        },
        "_id"
      ).lean();

      const titleStr = (announcement.title ?? "").trim();
      const bodyStr = (announcement.content ?? "").trim();
      const messageContent =
        (titleStr && bodyStr
          ? `${titleStr}: ${bodyStr}`
          : titleStr || bodyStr) || "";

      const recipientIds = users.map((u) => u._id.toString());
      if (recipientIds.length > 0 && messageContent) {
        await sendChatMessageToUsers({
          recipients: recipientIds,
          message: messageContent,
          productId: null,
          useSystemSender: true,
          adminUserId,
          adminEmail,
        });
      }
    }

    // Create audit logger and log announcement send
    const logger = createAdminAuditLogger(
      request,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );
    await logger.logCustomOperation(
      ModuleType.ANNOUNCEMENT_MANAGEMENT,
      OperationType.ANNOUNCEMENT_SEND,
      announcement._id.toString(),
      "Announcement",
      {
        adminUserId,
        adminRole,
        adminEmail,
        adminName,
        announcementTitle: announcement.title,
        announcementType: announcement.type,
        deliveryMethods: type,
        targetAudience: announcement.targetAudience,
        summary: `Sent announcement: ${announcement.title} via ${type.join(
          ", "
        )} by ${adminName} (${adminRole})`,
      }
    );

    return NextResponse.json({
      message: "Announcement sent and delivered",
      announcement,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send announcement" },
      { status: 500 }
    );
  }
}
