import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Announcement from '@/models/Announcement';
import { AdminAuthService } from '@/app/api/modules/auth/services/admin-auth.service';
// Import emitAnnouncement from the socket server
// @ts-ignore
import { emitAnnouncement } from '../../../../server/index.js';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { EmailService } from '@/app/api/modules/auth/services/email.service';

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
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Announcement id required' }, { status: 400 });
    const announcement = await Announcement.findById(id);
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    // Update status and sentAt
    announcement.status = 'sent';
    announcement.sentAt = new Date();
    // Set expiry date to 7 days after send
    announcement.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await announcement.save();
    // Emit real-time announcement if type includes banner, popup, or chat
    if (announcement.type.includes('banner') || announcement.type.includes('popup') || announcement.type.includes('chat')) {
      emitAnnouncement({
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        sentAt: announcement.sentAt,
        expiresAt: announcement.expiresAt,
      });
    }
    // Email delivery
    if (announcement.type.includes('email')) {
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
    // Chat delivery
    if (announcement.type.includes('chat')) {
      // Find admin user (first active, not blocked/banned, emailVerified, or fallback to first admin)
      let adminUser = await User.findOne({ isActive: true, isBlocked: false, isBanned: false, emailVerified: true, username: /admin/i });
      if (!adminUser) {
        adminUser = await User.findOne({ username: /admin/i });
      }
      if (!adminUser) {
        return NextResponse.json({ error: 'No admin user found for chat delivery' }, { status: 500 });
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
    return NextResponse.json({ message: 'Announcement sent and delivered', announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send announcement' }, { status: 500 });
  }
}
