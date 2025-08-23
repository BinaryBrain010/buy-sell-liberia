// NOTE: Make sure to install dependencies: npm install json2csv pdfkit
import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import mongoose from 'mongoose';
import User from '../../../../models/User';
import { Parser as Json2csvParser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response('No token', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return new Response('Forbidden', { status: 403 });
    }

    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get all users
    const users = await User.find({}, '-password -passwordResetToken -emailVerificationToken -phoneVerificationToken').lean();

    // Get format from query
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();

    if (format === 'csv') {
      // Convert to CSV
      const fields = Object.keys(users[0] || {});
      const parser = new Json2csvParser({ fields });
      const csv = parser.parse(users);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users.csv"',
        },
      });
    } else if (format === 'pdf') {
      // Convert to PDF
      const doc = new PDFDocument();
      let buffers: Buffer[] = [];
      doc.on('data', (chunk: any) => buffers.push(chunk));
      doc.on('end', () => {});
      doc.fontSize(18).text('User Data Export', { align: 'center' });
      doc.moveDown();
      users.forEach((user: any, idx: any) => {
        doc.fontSize(12).text(`User #${idx + 1}`);
        Object.entries(user).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        });
        doc.moveDown();
      });
      doc.end();
      await new Promise((resolve) => doc.on('end', resolve));
      const pdfBuffer = Buffer.concat(buffers);
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="users.pdf"',
        },
      });
    } else {
      return new Response('Invalid format. Use ?format=csv or ?format=pdf', { status: 400 });
    }
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    return new Response('Failed to export user data', { status: 500 });
  }
}
