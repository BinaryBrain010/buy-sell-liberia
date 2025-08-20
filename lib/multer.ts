import multer from 'multer'
import { NextRequest } from 'next/server'

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 20 // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.`))
    }
  }
})

// Create multer middleware for multiple files
export const uploadMultiple = upload.array('images', 20)

// Helper function to convert buffer to File object
export function bufferToFile(buffer: Buffer, originalName: string, mimeType: string): File {
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: mimeType })
  return new File([blob], originalName, { type: mimeType })
}

// Helper function to handle multer in Next.js API routes
export function runMiddleware(req: any, res: any, fn: any): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Parse files from NextRequest FormData
export async function parseFiles(request: NextRequest): Promise<{
  files: File[]
  fields: { [key: string]: string }
}> {
  try {
    const formData = await request.formData()
    
    const files: File[] = []
    const fields: { [key: string]: string } = {}
    
    // Extract files and fields from FormData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Validate file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(value.type)) {
          throw new Error(`Invalid file type: ${value.type}. Only JPEG, PNG, WebP, and GIF are allowed.`)
        }
        
        if (value.size > 5 * 1024 * 1024) {
          throw new Error(`File ${value.name} is too large. Maximum size is 5MB.`)
        }
        
        files.push(value)
      } else {
        fields[key] = value as string
      }
    }
    
    if (files.length > 20) {
      throw new Error('Maximum 20 files allowed')
    }
    
    return { files, fields }
  } catch (error) {
    console.error('[MULTER] Error parsing files:', error)
    throw error
  }
}

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
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

// Validate multiple files
export function validateFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (files.length === 0) {
    errors.push('At least one file is required')
  }

  if (files.length > 20) {
    errors.push('Maximum 20 files allowed')
  }

  files.forEach((file, index) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      errors.push(`File ${index + 1}: ${validation.error}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export default upload
