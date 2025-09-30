import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Announcement from "@/models/Announcement";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import User, { type IUser } from "@/models/User";
import Chat from "@/models/Chat";
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
    from: `"BuySell Platform" <${process.env.SMTP_USER}>`,
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

const SYSTEM_ANNOUNCEMENT_USERNAME = SYSTEM_USERNAME_SOURCE
  .replace(/[^a-zA-Z0-9_]/g, "_")
  .toLowerCase();

const SYSTEM_ANNOUNCEMENT_ROLE = "system";

const BROADCAST_ENDPOINT = (process.env.ANNOUNCEMENT_BROADCAST_URL || "http://localhost:3001/broadcast-announcement").replace(/\/$/, "");

async function ensureSystemAnnouncementUser(): Promise<IUser> {
  const email = SYSTEM_ANNOUNCEMENT_EMAIL;
  let user = (await User.findOne({ email })) as IUser | null;
  if (user) {
    let shouldSave = false;

    if (user.fullName !== SYSTEM_ANNOUNCEMENT_NAME) {
      user.fullName = SYSTEM_ANNOUNCEMENT_NAME;
      shouldSave = true;
    }

    const targetDisplayName = SYSTEM_ANNOUNCEMENT_NAME;
    if (user.profile?.displayName !== targetDisplayName) {
      user.profile = {
        ...user.profile,
        displayName: targetDisplayName,
        verificationStatus: user.profile?.verificationStatus || "email_verified",
        rating: user.profile?.rating || { average: 0, count: 0 },
      };
      shouldSave = true;
    }

    if (!user.isActive || user.isBlocked || user.isBanned) {
      user.isActive = true;
      user.isBlocked = false;
      user.isBanned = false;
      shouldSave = true;
    }

    if (!user.emailVerified) {
      user.emailVerified = true;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }
    return user;
  }

  let usernameBase = SYSTEM_ANNOUNCEMENT_USERNAME || "buysell_announcements";
  if (!usernameBase.trim()) {
    usernameBase = "buysell_announcements";
  }

  let usernameCandidate = usernameBase;
  let suffix = 1;
  while (await User.exists({ username: usernameCandidate })) {
    usernameCandidate = `${usernameBase}${suffix}`;
    suffix += 1;
  }

  const passwordSeed =
    process.env.SYSTEM_ANNOUNCEMENT_USER_PASSWORD ||
    crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(passwordSeed, 10);

  user = (await User.create({
    fullName: SYSTEM_ANNOUNCEMENT_NAME,
    username: usernameCandidate,
    email,
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

  return user;
}

async function resolveAnnouncementSender(
  adminUserId?: string,
  adminEmail?: string
): Promise<IUser> {
  if (adminUserId && mongoose.Types.ObjectId.isValid(adminUserId)) {
    const userById = (await User.findById(adminUserId)) as IUser | null;
    if (userById) {
      return userById;
    }
  }

  if (adminEmail) {
    const userByEmail = (await User.findOne({
      email: adminEmail.toLowerCase(),
    })) as IUser | null;
    if (userByEmail) {
      return userByEmail;
    }
  }

  return ensureSystemAnnouncementUser();
}

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
    // Email delivery
    if (type.includes("email")) {
      const users = await User.find(
        { isActive: true, isBlocked: false, emailVerified: true },
        "email"
      ).lean();
      const emailService = new EmailService();
      const subject = announcement.title || "Announcement from BuySell";
      const html = `<h2>${announcement.title}</h2><p>${announcement.content}</p>`;
      for (const user of users) {
        if (user.email) {
          try {
            await sendGenericEmail(emailService, user.email, subject, html);
          } catch (e) {
            const errMsg = (e as Error)?.message || e;
            console.error(
              "Failed to send announcement email to",
              user.email,
              errMsg
            );
          }
        }
      }
    }
    // Chat delivery: use the platform system sender so messages appear from BuySellLiberia
    if (type.includes("chat")) {
      const senderUser = await ensureSystemAnnouncementUser();
  adminUserId = (senderUser._id as mongoose.Types.ObjectId).toString();
      adminEmail = senderUser.email?.toLowerCase() || SYSTEM_ANNOUNCEMENT_EMAIL;
      adminName = senderUser.fullName || SYSTEM_ANNOUNCEMENT_NAME;
      adminRole = SYSTEM_ANNOUNCEMENT_ROLE;
      const users = await User.find(
        {
          isActive: true,
          isBlocked: false,
          isBanned: false,
          _id: { $ne: senderUser._id },
        },
        "_id"
      ).lean();
      for (const user of users) {
        // Find or create chat between admin and user (no product context)
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
  const title = (announcement.title ?? "").trim();
  const body = (announcement.content ?? "").trim();
  const messageContent = title && body ? `${title}: ${body}` : title || body;

        chat.messages.push({
          sender: senderUser._id,
          content: messageContent,
          sentAt: new Date(),
          readBy: [],
        });
        chat.lastMessageAt = new Date();
        await chat.save();
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
