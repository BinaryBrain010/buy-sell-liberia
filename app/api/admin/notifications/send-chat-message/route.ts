import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
  ModuleType,
  OperationType,
} from "@/lib/admin-audit-middleware";
import { sendChatMessageToUsers } from "@/app/api/modules/notifications/services/chat-notification.service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let adminUserId = "system";
    let adminRole = "system";
    let adminEmail = "system@buysellliberia.com";
    let adminName = "BuySellLiberia";

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
    const {
      recipients,
      toUserId,
      toUserIds,
      content,
      title,
      body: bodyText,
      productId = null,
      useSystemSender = true,
    } = body || {};

    // Build recipients array (supports recipients, toUserIds, or toUserId)
    const recipientIds: string[] = Array.isArray(recipients)
      ? recipients
      : Array.isArray(toUserIds)
      ? toUserIds
      : toUserId
      ? [toUserId]
      : [];

    // Build message content from either explicit content or title/body pair
    const trimmedTitle = (title ?? "").trim();
    const trimmedBody = (bodyText ?? "").trim();
    const messageContent =
      (content ?? "").trim() ||
      (trimmedTitle && trimmedBody
        ? `${trimmedTitle}: ${trimmedBody}`
        : trimmedTitle || trimmedBody);

    if (!messageContent || recipientIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "content (or title/body) and at least one recipient are required",
        },
        { status: 400 }
      );
    }

    const result = await sendChatMessageToUsers({
      recipients: recipientIds,
      message: messageContent,
      productId,
      useSystemSender,
      adminUserId,
      adminEmail,
    });

    const logger = createAdminAuditLogger(
      request,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );

    await logger.logCustomOperation(
      ModuleType.MESSAGE_MANAGEMENT,
      OperationType.ANNOUNCEMENT_SEND,
      undefined,
      "Chat",
      {
        adminUserId,
        adminRole,
        adminEmail,
        adminName,
        recipients: recipientIds,
        productId: productId ?? null,
        useSystemSender,
        counts: result,
        summary: `Sent chat message to ${result.successCount} recipient(s)`,
      }
    );

    return NextResponse.json({
      message: "Chat message(s) sent",
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to send chat message(s)" },
      { status: 500 }
    );
  }
}
