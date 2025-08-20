import FirebaseStorageService from './firebase-storage'
import mongoose from 'mongoose'

/**
 * Upload product images to Firebase Storage
 */
export async function uploadProductImages(
  files: File[], 
  userId: string, 
  productId?: string
): Promise<string[]> {
  try {
    // Generate product ID if not provided
    const actualProductId = productId || new mongoose.Types.ObjectId().toString()
    
    console.log(`[FILE UPLOAD] Uploading ${files.length} images for product ${actualProductId}`)
    
    // Upload images to Firebase Storage
    const imageUrls = await FirebaseStorageService.uploadProductImages(
      files,
      userId,
      actualProductId
    )
    
    console.log('[FILE UPLOAD] All images uploaded successfully:', imageUrls)
    return imageUrls
  } catch (error) {
    console.error('[FILE UPLOAD] Error uploading images:', error)
    throw new Error('Failed to upload images to Firebase Storage')
  }
}

/**
 * Upload single product image to Firebase Storage
 */
export async function uploadProductImage(
  file: File, 
  userId: string, 
  productId: string
): Promise<string> {
  try {
    const imageUrls = await uploadProductImages([file], userId, productId)
    return imageUrls[0]
  } catch (error) {
    console.error('[FILE UPLOAD] Error uploading single image:', error)
    throw new Error('Failed to upload image to Firebase Storage')
  }
}

/**
 * Validate a single image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  return FirebaseStorageService.validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  })
}

/**
 * Validate multiple image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (files.length === 0) {
    errors.push('At least one image is required')
  }

  if (files.length > 20) {
    errors.push('Maximum 20 images allowed')
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      errors.push(`Image ${index + 1}: ${validation.error}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Compress images before upload (client-side only)
 */
export async function compressImages(files: File[]): Promise<File[]> {
  // Skip compression on server-side (when document is not available)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('[FILE UPLOAD] Skipping compression on server-side')
    return files
  }
  
  try {
    console.log(`[FILE UPLOAD] Compressing ${files.length} images`)
    
    const compressionPromises = files.map(file => 
      FirebaseStorageService.compressImage(file, 1200, 0.8)
    )
    
    const compressedFiles = await Promise.all(compressionPromises)
    console.log('[FILE UPLOAD] All images compressed successfully')
    
    return compressedFiles
  } catch (error) {
    console.error('[FILE UPLOAD] Error compressing images:', error)
    // Return original files if compression fails
    return files
  }
}

/**
 * Delete product images from Firebase Storage
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  try {
    console.log(`[FILE UPLOAD] Deleting ${imageUrls.length} images`)
    await FirebaseStorageService.deleteMultipleFiles(imageUrls)
    console.log('[FILE UPLOAD] All images deleted successfully')
  } catch (error) {
    console.error('[FILE UPLOAD] Error deleting images:', error)
    throw new Error('Failed to delete images from Firebase Storage')
  }
}

/**
 * Upload user avatar to Firebase Storage
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  try {
    console.log(`[FILE UPLOAD] Uploading avatar for user ${userId}`)
    
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    // Compress image
    const compressedFile = await FirebaseStorageService.compressImage(file, 400, 0.9)
    
    // Upload to Firebase Storage
    const avatarUrl = await FirebaseStorageService.uploadUserAvatar(compressedFile, userId)
    
    console.log('[FILE UPLOAD] Avatar uploaded successfully:', avatarUrl)
    return avatarUrl
  } catch (error) {
    console.error('[FILE UPLOAD] Error uploading avatar:', error)
    throw new Error('Failed to upload avatar to Firebase Storage')
  }
}
