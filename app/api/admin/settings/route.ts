import { NextRequest, NextResponse } from 'next/server';
import Setting from '@/models/Setting';
import { AdminAuthService } from '../../modules/auth/services/admin-auth.service';
import { connectDB } from '@/lib/mongoose';
import { clearSettingsCache } from '@/lib/settings';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { parseFiles } from '@/lib/multer';
import { existsSync } from 'fs';

const MONETIZATION_KEY = 'monetization_enabled';
const SETTINGS_KEYS = [
  'platform_currency',
  'listing_expiration_days',
  'max_listing_photos',
  'payment_mobile_numbers',
  'payment_bank_info',
  'logo_path',
  'monetization_enabled',
  'registration_enabled',
  'maintenance_mode',
];

// GET: Get monetization status
export async function GET(req: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const docs = await Setting.find({ key: { $in: SETTINGS_KEYS } });
    const map: Record<string, any> = {};
    docs.forEach((d) => (map[d.key] = d.value));
    return NextResponse.json(map);
  } catch (error: any) {
    console.error('Error in /api/admin/settings GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Set monetization status (admin only)
export async function POST(req: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Accept JSON or multipart/form-data for logo upload
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Use the project's file parser
      const { files, fields } = await parseFiles(req);
      
      console.log('Parsed files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      console.log('Parsed fields:', Object.keys(fields));
      
      // Handle logo upload - check both 'logo' and any image file
      let logoFile = files.find(f => f.name === 'logo');
      if (!logoFile && files.length > 0) {
        // If no file named 'logo', take the first image file
        logoFile = files.find(f => f.type.startsWith('image/'));
      }
      
      if (logoFile) {
        console.log('Processing logo file:', { name: logoFile.name, size: logoFile.size, type: logoFile.type });
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(logoFile.type)) {
          return NextResponse.json(
            { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        if (logoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File too large. Maximum size is 5MB.' },
            { status: 400 }
          );
        }

        // Create logo directory if it doesn't exist
        const logoDir = join(process.cwd(), 'public', 'logo');
        if (!existsSync(logoDir)) {
          await mkdir(logoDir, { recursive: true });
        }

        // Generate filename with timestamp to avoid caching issues
        const timestamp = Date.now();
        const extension = logoFile.name.split('.').pop() || 'png';
        const filename = `site-logo-${timestamp}.${extension}`;
        const filepath = join(logoDir, filename);

        // Write file
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        await writeFile(filepath, buffer);

        // Update database
        const logoPath = `/logo/${filename}`;
        await Setting.findOneAndUpdate(
          { key: 'logo_path' }, 
          { value: logoPath }, 
          { upsert: true, new: true }
        );

        console.log(`Logo uploaded successfully: ${logoPath}`);
      } else {
        console.log('No logo file found in request');
      }

      // Handle other form fields
      const updates: Record<string, any> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (SETTINGS_KEYS.includes(key) && key !== 'logo_path') {
          try {
            updates[key] = JSON.parse(value as string);
          } catch {
            updates[key] = value;
          }
        }
      }

      // Update other settings
      for (const [key, value] of Object.entries(updates)) {
        await Setting.findOneAndUpdate(
          { key }, 
          { value }, 
          { upsert: true, new: true }
        );
      }
      
      // Clear settings cache so new values are picked up immediately
      clearSettingsCache();
      
      // Return different response based on whether logo was uploaded
      if (logoFile) {
        const logoPath = `/logo/site-logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
        return NextResponse.json({ 
          success: true, 
          message: 'Logo uploaded successfully',
          logoPath: logoPath,
          updatedSettings: { ...updates, logo_path: logoPath }
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: 'Settings updated',
          updatedSettings: updates
        });
      }
    } else {
      const body = await req.json();
      for (const key of Object.keys(body)) {
        if (!SETTINGS_KEYS.includes(key)) continue;
        await Setting.findOneAndUpdate({ key }, { value: body[key] }, { upsert: true, new: true });
      }
      
      // Clear settings cache so new values are picked up immediately
      clearSettingsCache();
      
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error('Error in /api/admin/settings POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
