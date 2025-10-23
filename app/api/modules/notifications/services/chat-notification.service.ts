import mongoose from "mongoose";
import User, { type IUser } from "@/models/User";
import Chat from "@/models/Chat";

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

export const SYSTEM_ANNOUNCEMENT_ROLE = "system";

export async function ensureSystemAnnouncementUser(): Promise<IUser> {
  const bcrypt = await import("bcryptjs");
  const crypto = await import("crypto");

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
        verificationStatus:
          user.profile?.verificationStatus || "email_verified",
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

export async function resolveAnnouncementSender(
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

export interface SendChatMessageInput {
  recipients: Array<string>;
  message: string;
  productId?: string | null;
  useSystemSender?: boolean;
  adminUserId?: string;
  adminEmail?: string;
}

export interface SendChatMessageResult {
  successCount: number;
  failureCount: number;
  chatIds: string[];
}

export async function sendChatMessageToUsers(
  input: SendChatMessageInput
): Promise<SendChatMessageResult> {
  const {
    recipients,
    message,
    productId = null,
    useSystemSender = true,
    adminUserId,
    adminEmail,
  } = input;

  if (!message || !recipients || recipients.length === 0) {
    return {
      successCount: 0,
      failureCount: recipients?.length || 0,
      chatIds: [],
    };
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  let senderUser: IUser;
  if (useSystemSender) {
    senderUser = await ensureSystemAnnouncementUser();
  } else {
    senderUser = await resolveAnnouncementSender(adminUserId, adminEmail);
  }

  let successCount = 0;
  let failureCount = 0;
  const chatIds: string[] = [];

  for (const recipientId of recipients) {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        failureCount += 1;
        continue;
      }
      const recipient = await User.findById(recipientId).lean();
      if (
        !recipient ||
        !recipient.isActive ||
        recipient.isBlocked ||
        recipient.isBanned
      ) {
        failureCount += 1;
        continue;
      }

      let chat = await Chat.findOne({
        user1: senderUser._id,
        user2: recipientId,
        product: productId ?? null,
      });
      if (!chat) {
        chat = new Chat({
          user1: senderUser._id,
          user2: recipientId,
          product: productId ?? null,
          messages: [],
        });
      }

      chat.messages.push({
        sender: senderUser._id,
        content: message,
        sentAt: new Date(),
        readBy: [],
      });
      chat.lastMessageAt = new Date();
      await chat.save();
      chatIds.push(chat._id.toString());
      successCount += 1;
    } catch (e) {
      console.error("Failed to send chat message to", recipientId, e);
      failureCount += 1;
    }
  }

  return { successCount, failureCount, chatIds };
}
