import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Announcement from '@/models/Announcement';
import { AdminAuthService } from '@/app/api/modules/auth/services/admin-auth.service';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { EmailService } from '@/app/api/modules/auth/services/email.service';
import { createAdminAuditLogger, extractUserInfoFromPayload } from '../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from '../../../../../lib/audit-logger';

// Helper to send a generic email
async function sendGenericEmail(emailService: EmailService, to: string, subject: string, html: string) {
  await emailService['transporter'].sendMail({
    from: `"BuySell Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || !AdminAuthService.isAllowedRole((payload as any).role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId: adminUserId, role: adminRole, email: adminEmail, name: adminName } = extractUserInfoFromPayload(payload);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await request.json();
    const { title, content, type, scheduledAt, targetAudience } = body;
    if (!title || !content || !type || !Array.isArray(type) || type.length === 0) {
      return NextResponse.json({ error: 'title, content, and at least one type are required' }, { status: 400 });
    }
    // Save the announcement
    const announcement = new Announcement({
      title,
      content,
      type,
      status: 'sent',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      scheduledAt,
      targetAudience,
    });
    await announcement.save();
    // Emit real-time announcement if type includes banner, popup, or chat
    if (type.includes('banner') || type.includes('popup') || type.includes('chat')) {
      await fetch('http://localhost:3001/broadcast-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: announcement._id,
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          sentAt: announcement.sentAt,
          expiresAt: announcement.expiresAt,
        }),
      });
    }
    // Email delivery
    if (type.includes('email')) {
      const users = await User.find({ isActive: true, isBlocked: false, emailVerified: true }, 'email').lean();
      const emailService = new EmailService();
      const subject = announcement.title || 'Announcement from BuySell';
      const html = `<h2>${announcement.title}</h2><p>${announcement.content}</p>`;
      for (const user of users) {
        if (user.email) {
          try {
            await sendGenericEmail(emailService, user.email, subject, html);
          } catch (e) {
            const errMsg = (e as Error)?.message || e;
            console.error('Failed to send announcement email to', user.email, errMsg);
          }
        }
      }
    }
    // Chat delivery: use the authenticated admin as sender
    if (type.includes('chat')) {
      // Find the admin user by payload (assume payload.sub or payload.id is the admin's user ID)
      let adminUser = null;
      if (payload.sub || payload.id) {
        adminUser = await User.findById(payload.sub || payload.id);
      } else if (payload.email) {
        adminUser = await User.findOne({ email: payload.email });
      }
      if (!adminUser) {
        return NextResponse.json({ error: 'Authenticated admin user not found for chat delivery' }, { status: 500 });
      }
      const users = await User.find({ isActive: true, isBlocked: false, isBanned: false, _id: { $ne: adminUser._id } }, '_id').lean();
      for (const user of users) {
        // Find or create chat between admin and user (no product context)
        let chat = await Chat.findOne({ user1: adminUser._id, user2: user._id, product: null });
        if (!chat) {
          chat = new Chat({ user1: adminUser._id, user2: user._id, product: null, messages: [] });
        }
        chat.messages.push({
          sender: adminUser._id,
          content: `[Announcement] ${announcement.title}\n${announcement.content}`,
          sentAt: new Date(),
          readBy: [],
        });
        chat.lastMessageAt = new Date();
        await chat.save();
      }
    }

    // Create audit logger and log announcement send
    const logger = createAdminAuditLogger(request, adminUserId, adminRole, adminEmail, adminName);
    await logger.logCustomOperation(ModuleType.ANNOUNCEMENT_MANAGEMENT, OperationType.ANNOUNCEMENT_SEND, announcement._id.toString(), 'Announcement', {
      adminUserId,
      adminRole,
      adminEmail,
      adminName,
      announcementTitle: announcement.title,
      announcementType: announcement.type,
      deliveryMethods: type,
      targetAudience: announcement.targetAudience,
      summary: `Sent announcement: ${announcement.title} via ${type.join(', ')} by ${adminName} (${adminRole})`
    });

    return NextResponse.json({ message: 'Announcement sent and delivered', announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send announcement' }, { status: 500 });
  }
}
