import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '../../../modules/auth/services/admin-auth.service';
import { SettingsService } from '@/app/api/modules/shared/services/settings.service';
import { parseFiles } from '@/lib/multer';
import { uploadLogoToLocal, validateLogoFile } from '@/lib/logo-upload';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET: Get current logo
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Direct database query for logo
    const { Setting } = await import('@/app/api/modules/shared/models/setting.model');
    const { connectDB } = await import('@/lib/mongoose');
    await connectDB();
    
    const logoDoc = await Setting.findOne({ key: 'platform_logo' });
    const logoUrl = logoDoc?.value || '';
    
    return NextResponse.json({
      logoUrl,
      hasLogo: !!logoUrl
    });
  } catch (error: any) {
    console.error('Error in /api/admin/settings/logo GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Set logo (URL or file upload)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      return await handleFileUpload(req);
    } else {
      // Handle URL setting
      return await handleUrlSetting(req);
    }

  } catch (error: any) {
    console.error('Error in /api/admin/settings/logo POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove logo
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await SettingsService.getAllSettings();
    const currentLogo = settings.platformLogo;

    // If current logo is a local file, delete it
    if (currentLogo && currentLogo.startsWith('/logo/')) {
      const filePath = join(process.cwd(), 'uploads', currentLogo);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    // Clear logo setting
    await SettingsService.updateSetting('platform_logo', '');

    return NextResponse.json({ 
      success: true, 
      message: 'Logo removed successfully' 
    });

  } catch (error: any) {
    console.error('Error in /api/admin/settings/logo DELETE:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Helper function to handle file upload
async function handleFileUpload(req: NextRequest) {
  // Parse files using multer (same as product photos)
  const { files } = await parseFiles(req);
  
  if (files.length === 0) {
    return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
  }

  if (files.length > 1) {
    return NextResponse.json({ error: 'Only one logo file allowed' }, { status: 400 });
  }

  const logoFile = files[0];

  // Validate logo file using dedicated logo validation
  const validation = validateLogoFile(logoFile);
  if (!validation.valid) {
    return NextResponse.json({ 
      error: validation.error || 'Invalid logo file' 
    }, { status: 400 });
  }

  // Get current logo to delete old file
  const { Setting } = await import('@/app/api/modules/shared/models/setting.model');
  const { connectDB } = await import('@/lib/mongoose');
  await connectDB();
  
  const currentLogoDoc = await Setting.findOne({ key: 'platform_logo' });
  const currentLogo = currentLogoDoc?.value || '';

  try {
    // Upload using dedicated logo upload function
    const relativePath = await uploadLogoToLocal(logoFile);

    // Delete old logo file if it exists and is local
    if (currentLogo && currentLogo.startsWith('/logo/')) {
      const oldFilePath = join(process.cwd(), 'uploads', currentLogo);
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath);
        } catch (error) {
          console.warn('Could not delete old logo file:', error);
        }
      }
    }

    // Update logo setting in database
    await SettingsService.updateSetting('platform_logo', relativePath);

    return NextResponse.json({ 
      success: true, 
      logoUrl: relativePath, 
      message: 'Logo uploaded successfully' 
    });

  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ 
      error: 'Failed to upload logo file' 
    }, { status: 500 });
  }
}

// Helper function to handle URL setting
async function handleUrlSetting(req: NextRequest) {
  const { logoUrl } = await req.json();
  
  if (!logoUrl || typeof logoUrl !== 'string') {
    return NextResponse.json({ error: 'Valid logo URL is required' }, { status: 400 });
  }

  // Basic URL validation
  try {
    new URL(logoUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Get current logo to delete old file if it's local
  const { Setting } = await import('@/app/api/modules/shared/models/setting.model');
  const { connectDB } = await import('@/lib/mongoose');
  await connectDB();
  
  const currentLogoDoc = await Setting.findOne({ key: 'platform_logo' });
  const currentLogo = currentLogoDoc?.value || '';

  // If current logo is a local file, delete it
  if (currentLogo && currentLogo.startsWith('/logo/')) {
    const filePath = join(process.cwd(), 'uploads', currentLogo);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.warn('Could not delete old logo file:', error);
      }
    }
  }

  // Update logo setting in database
  await SettingsService.updateSetting('platform_logo', logoUrl);

  return NextResponse.json({ 
    success: true, 
    logoUrl, 
    message: 'Logo URL set successfully' 
  });
}
