import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Upload logo file to dedicated logo directory
 */
export async function uploadLogoToLocal(file: File): Promise<string> {
  try {
    console.log(`[LOGO UPLOAD] Uploading logo file: ${file.name}`);

    // Create logo directory: uploads/logo/ (at project root)
    const logoDir = join(process.cwd(), 'uploads', 'logo');
    
    // Ensure directory exists
    if (!existsSync(logoDir)) {
      await mkdir(logoDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filename = `logo_${timestamp}_${randomString}.${extension}`;
    const filePath = join(logoDir, filename);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Generate relative path for database storage
    const relativePath = `/logo/${filename}`;

    console.log(`[LOGO UPLOAD] Logo uploaded successfully: ${relativePath}`);
    return relativePath;
  } catch (error) {
    console.error('[LOGO UPLOAD] Error uploading logo:', error);
    throw new Error('Failed to upload logo to local storage');
  }
}

/**
 * Validate logo file (same validation as product photos but with logo-specific limits)
 */
export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  // Check file size (2MB limit for logos)
  if (file.size > 2 * 1024 * 1024) {
    return {
      valid: false,
      error: `Logo file too large. Maximum size is 2MB.`
    };
  }

  // Check file type (same as product photos)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed for logos.`
    };
  }

  return { valid: true };
}
