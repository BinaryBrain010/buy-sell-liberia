import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import mongoose from 'mongoose'

/**
 * Create directory if it doesn't exist
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    console.error(`[LOCAL FILE UPLOAD] Error creating directory ${dirPath}:`, error)
    throw new Error(`Failed to create directory: ${dirPath}`)
  }
}

/**
 * Generate unique filename for image
 */
function generateImageFilename(originalName: string, productId: string): string {
  const extension = originalName.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  return `${productId}_${timestamp}_${randomString}.${extension}`
}

/**
 * Upload product images to local storage
 */
export async function uploadProductImagesToLocal(
  files: File[],
  category: string,
  productId: string,
  productName: string
): Promise<string[]> {
  try {
    console.log(`[LOCAL FILE UPLOAD] Uploading ${files.length} images for product ${productId}`)
    
    // Sanitize category and product name for file path
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    
    // Create directory path: public/uploads/products/{category}/{uuid_first_5_chars}_{name}/
    const productIdFirst5 = productId.substring(0, 5)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products', sanitizedCategory, `${productIdFirst5}_${sanitizedProductName}`)
    
    // Ensure directory exists
    await ensureDirectoryExists(uploadDir)
    
    const uploadedPaths: string[] = []
    
    // Upload each image
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = generateImageFilename(file.name, productId)
      const filePath = join(uploadDir, filename)
      
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Write file to disk
      await writeFile(filePath, buffer)
      
      // Generate relative path for database storage
      const relativePath = `/uploads/products/${sanitizedCategory}/${productIdFirst5}_${sanitizedProductName}/${filename}`
      uploadedPaths.push(relativePath)
      
      console.log(`[LOCAL FILE UPLOAD] Image ${i + 1} uploaded: ${relativePath}`)
    }
    
    console.log('[LOCAL FILE UPLOAD] All images uploaded successfully')
    return uploadedPaths
  } catch (error) {
    console.error('[LOCAL FILE UPLOAD] Error uploading images:', error)
    throw new Error('Failed to upload images to local storage')
  }
}

/**
 * Delete product images from local storage
 */
export async function deleteProductImagesFromLocal(imagePaths: string[]): Promise<void> {
  try {
    console.log(`[LOCAL FILE UPLOAD] Deleting ${imagePaths.length} images`)
    
    const { unlink } = await import('fs/promises')
    
    const deletePromises = imagePaths.map(async (imagePath) => {
      const fullPath = join(process.cwd(), 'public', imagePath)
      try {
        await unlink(fullPath)
        console.log(`[LOCAL FILE UPLOAD] Deleted: ${imagePath}`)
      } catch (error) {
        console.error(`[LOCAL FILE UPLOAD] Error deleting ${imagePath}:`, error)
        // Don't throw error for individual file deletion failures
      }
    })
    
    await Promise.all(deletePromises)
    console.log('[LOCAL FILE UPLOAD] All images deleted successfully')
  } catch (error) {
    console.error('[LOCAL FILE UPLOAD] Error deleting images:', error)
    throw new Error('Failed to delete images from local storage')
  }
}

/**
 * Validate image file for local upload
 */
export function validateImageFileForLocal(file: File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: `File ${file.name} is too large. Maximum size is 5MB.` }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed.` }
  }

  return { valid: true }
}

/**
 * Validate multiple image files for local upload
 */
export function validateImageFilesForLocal(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (files.length === 0) {
    errors.push('At least one image is required')
  }

  if (files.length > 15) {
    errors.push('Maximum 15 images allowed')
  }

  files.forEach((file, index) => {
    const validation = validateImageFileForLocal(file)
    if (!validation.valid) {
      errors.push(`Image ${index + 1}: ${validation.error}`)
    }
  })

  return { valid: errors.length === 0, errors }
} 