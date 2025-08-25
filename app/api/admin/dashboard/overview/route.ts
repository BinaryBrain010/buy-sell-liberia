import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../../models/User';
import Product from '../../../../../models/Product';
import { Admin } from '../../../modules/auth/models/admin.model';
// Placeholder: Replace with real models when implemented
// import Report from '../../../../../../models/Report';
// import ManualPayment from '../../../../../../models/ManualPayment';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Connect to DB if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }

    // Stats
    const totalUsers = await User.countDocuments();
    const activeListings = await Product.countDocuments({ status: 'active' });
    const featuredListings = await Product.countDocuments({ featured: true });
    const now = new Date();
    const nearExpiry = await Product.countDocuments({ status: 'active', expiryDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
    // Count all admins except super_admin
    const totalAdmins = await Admin.countDocuments({ role: { $ne: 'super_admin' } });
    // Placeholder counts for reports and manual payments
    const reports = 0; // await Report.countDocuments({ status: 'pending' });
    const manualPaymentRequests = 0; // await ManualPayment.countDocuments({ status: 'pending' });

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      activeListings,
      featuredListings,
      listingsNearExpiry: nearExpiry,
      reports,
      manualPaymentRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
