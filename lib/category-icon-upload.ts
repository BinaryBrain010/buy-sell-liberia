import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Create directory if it doesn't exist
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(
      `[CATEGORY ICON UPLOAD] Error creating directory ${dirPath}:`,
      error
    );
    throw new Error(`Failed to create directory: ${dirPath}`);
  }
}

/**
 * Generate unique filename for category icon
 */
function generateIconFilename(originalName: string, categoryId: string): string {
  const extension = originalName.split(".").pop() || "png";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `category_${categoryId}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Upload category icon to local storage
 */
export async function uploadCategoryIconToLocal(
  file: File,
  categoryId: string
): Promise<string> {
  try {
    console.log(
      `[CATEGORY ICON UPLOAD] Uploading icon for category ${categoryId}`
    );

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and SVG are allowed.`);
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for icons
      throw new Error(`File ${file.name} is too large. Maximum size is 2MB.`);
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "category-icons");
    await ensureDirectoryExists(uploadDir);

    // Generate unique filename
    const filename = generateIconFilename(file.name, categoryId);
    const filePath = join(uploadDir, filename);

    // Convert File to Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/category-icons/${filename}`;
    console.log(`[CATEGORY ICON UPLOAD] Icon uploaded successfully: ${publicPath}`);
    
    return publicPath;
  } catch (error) {
    console.error("[CATEGORY ICON UPLOAD] Error uploading icon:", error);
    throw error;
  }
}

/**
 * Validate category icon file
 */
export function validateCategoryIcon(file: File): { valid: boolean; error?: string } {
  // Check file size (2MB limit for icons)
  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, error: `File ${file.name} is too large. Maximum size is 2MB.` };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and SVG are allowed.` };
  }

  return { valid: true };
}

/**
 * Delete category icon from local storage
 */
export async function deleteCategoryIcon(iconPath: string): Promise<void> {
  try {
    if (!iconPath || iconPath.startsWith('http')) {
      // Skip deletion for external URLs or empty paths
      return;
    }

    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    
    // Remove leading slash and construct full path
    const relativePath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
    const fullPath = join(process.cwd(), 'public', relativePath);
    
    await unlink(fullPath);
    console.log(`[CATEGORY ICON UPLOAD] Icon deleted: ${iconPath}`);
  } catch (error) {
    console.error(`[CATEGORY ICON UPLOAD] Error deleting icon ${iconPath}:`, error);
    // Don't throw error for file deletion failures
  }
}
