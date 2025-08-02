import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from "firebase/storage"
import { storage } from "./firebase"

export interface UploadProgress {
  progress: number
  snapshot: UploadTaskSnapshot
}

export class FirebaseStorageService {
  /**
   * Upload a single file to Firebase Storage
   */
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      
      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file)
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress({ progress, snapshot })
            },
            (error) => {
              console.error('[FIREBASE STORAGE] Upload error:', error)
              reject(error)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                console.log('[FIREBASE STORAGE] File uploaded successfully:', downloadURL)
                resolve(downloadURL)
              } catch (error) {
                console.error('[FIREBASE STORAGE] Get download URL error:', error)
                reject(error)
              }
            }
          )
        })
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('[FIREBASE STORAGE] File uploaded successfully:', downloadURL)
        return downloadURL
      }
    } catch (error) {
      console.error('[FIREBASE STORAGE] Upload file error:', error)
      throw error
    }
  }

  /**
   * Upload multiple files to Firebase Storage
   */
  static async uploadMultipleFiles(
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    try {
      console.log(`[FIREBASE STORAGE] Uploading ${files.length} files to ${basePath}`)
      
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`
        const filePath = `${basePath}/${fileName}`
        
        return this.uploadFile(file, filePath, onProgress ? (progress) => onProgress(index, progress) : undefined)
      })

      const downloadURLs = await Promise.all(uploadPromises)
      console.log('[FIREBASE STORAGE] All files uploaded successfully:', downloadURLs)
      return downloadURLs
    } catch (error) {
      console.error('[FIREBASE STORAGE] Upload multiple files error:', error)
      throw error
    }
  }

  /**
   * Upload product images
   */
  static async uploadProductImages(
    images: File[],
    userId: string,
    productId: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    const path = `products/${userId}/${productId}`
    return this.uploadMultipleFiles(images, path, onProgress)
  }

  /**
   * Upload user avatar
   */
  static async uploadUserAvatar(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const fileName = `avatar_${Date.now()}_${file.name}`
    const path = `avatars/${userId}/${fileName}`
    return this.uploadFile(file, path, onProgress)
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      console.log('[FIREBASE STORAGE] Deleting file:', url)
      const fileRef = ref(storage, url)
      await deleteObject(fileRef)
      console.log('[FIREBASE STORAGE] File deleted successfully')
    } catch (error) {
      console.error('[FIREBASE STORAGE] Delete file error:', error)
      throw error
    }
  }

  /**
   * Delete multiple files from Firebase Storage
   */
  static async deleteMultipleFiles(urls: string[]): Promise<void> {
    try {
      console.log(`[FIREBASE STORAGE] Deleting ${urls.length} files`)
      const deletePromises = urls.map(url => this.deleteFile(url))
      await Promise.all(deletePromises)
      console.log('[FIREBASE STORAGE] All files deleted successfully')
    } catch (error) {
      console.error('[FIREBASE STORAGE] Delete multiple files error:', error)
      throw error
    }
  }

  /**
   * Get file URL from Firebase Storage reference
   */
  static async getFileURL(path: string): Promise<string> {
    try {
      const fileRef = ref(storage, path)
      const downloadURL = await getDownloadURL(fileRef)
      return downloadURL
    } catch (error) {
      console.error('[FIREBASE STORAGE] Get file URL error:', error)
      throw error
    }
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: File, options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
  } = {}): { isValid: boolean; error?: string } {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`
      }
    }

    return { isValid: true }
  }

  /**
   * Compress image before upload
   */
  static async compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

export default FirebaseStorageService
