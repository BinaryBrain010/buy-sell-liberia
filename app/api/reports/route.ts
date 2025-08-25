import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Report from '../../../models/Report';
import Product from '../../../models/Product';
import User from '../../../models/User';

// POST: User submits a report
export async function POST(request: NextRequest) {
  try {
    // (Optional) Authenticate user if needed
    // const authHeader = request.headers.get('authorization');
    // ...token validation logic...

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { product_id, reported_by, reason, description } = await request.json();
    if (!product_id || !reported_by || !reason) {
      return NextResponse.json({ error: 'product_id, reported_by, and reason are required' }, { status: 400 });
    }
    // Create the report
    const report = await Report.create({ product_id, reported_by, reason, description });
    // Add report ID to product's reportIds array
    await Product.findByIdAndUpdate(product_id, { $addToSet: { reportIds: report._id } });
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
