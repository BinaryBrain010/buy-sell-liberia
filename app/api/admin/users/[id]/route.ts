import { NextRequest } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 🔒 Auth: Only super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response('No token', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return new Response('Forbidden', { status: 403 });
    }

    // 🔗 Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const userId = params.id;
    const user = await User.findById(userId, '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken').lean();
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Fetch related data
    const Product = (await import('@/models/Product')).default;
    const products = await Product.find({ user_id: userId }).lean();
    const Chat = (await import('@/models/Chat')).default;
    const chats = await Chat.find({ $or: [ { user1: userId }, { user2: userId } ] }).lean();
    const Review = (await import('@/models/Review')).default;
    const reviewsGiven = await Review.find({ reviewer_id: userId }).lean();
    const reviewsReceived = await Review.find({ reviewed_user_id: userId }).lean();
    const Report = (await import('@/models/Report')).default;
    const reportsFiled = await Report.find({ reported_by: userId }).lean();
    const reportsReceived = await Report.find({ product_id: { $in: products.map(p => p._id) } }).lean();
    const ManualPayment = (await import('@/models/ManualPayment')).default;
    const manualPayments = await ManualPayment.find({ user: userId }).lean();
    const WithdrawalLog = (await import('@/models/WithdrawalLog')).default;
    const withdrawalLogs = await WithdrawalLog.find({ admin: userId }).lean();
    const Announcement = (await import('@/models/Announcement')).default;
    const announcements = await Announcement.find({ 'targetAudience.userIds': userId }).lean();

    const result = {
      ...user,
      favoriteProducts: user.likedProducts || [],
      listings: products,
      chats,
      reviewsGiven,
      reviewsReceived,
      reportsFiled,
      reportsReceived,
      manualPayments,
      withdrawalLogs,
      announcements,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return new Response('Failed to fetch user data', { status: 500 });
  }
}
