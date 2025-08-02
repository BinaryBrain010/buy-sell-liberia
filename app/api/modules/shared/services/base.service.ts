import mongoose, { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from "mongoose"
import { connectDB } from "@/lib/mongoose"

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  pages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SortOptions {
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export abstract class BaseService<T extends Document> {
  protected model: Model<T>
  protected serviceName: string

  constructor(model: Model<T>, serviceName: string) {
    this.model = model
    this.serviceName = serviceName
  }

  /**
   * Ensure database connection
   */
  protected async ensureConnection(): Promise<void> {
    await connectDB()
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      console.log(`[${this.serviceName}] Creating new document`)
      await this.ensureConnection()

      const document = new this.model(data)
      const savedDocument = await document.save()

      console.log(`[${this.serviceName}] Document created successfully:`, savedDocument._id)
      return savedDocument
    } catch (error: any) {
      console.error(`[${this.serviceName}] Create error:`, error.message)
      throw new Error(error.message || `Failed to create ${this.serviceName.toLowerCase()}`)
    }
  }

  /**
   * Find document by ID
   */
  async findById(id: string, populate?: string | string[]): Promise<T | null> {
    try {
      console.log(`[${this.serviceName}] Finding document by ID:`, id)
      await this.ensureConnection()

      let query = this.model.findById(id)
      
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(field => {
            query = query.populate(field)
          })
        } else {
          query = query.populate(populate)
        }
      }

      const document = await query.exec()
      return document
    } catch (error: any) {
      console.error(`[${this.serviceName}] Find by ID error:`, error.message)
      throw new Error(`Failed to find ${this.serviceName.toLowerCase()}`)
    }
  }

  /**
   * Find documents with filters, pagination, and sorting
   */
  async find(
    filters: FilterQuery<T> = {},
    pagination: PaginationOptions = {},
    sortOptions: SortOptions = {},
    populate?: string | string[]
  ): Promise<PaginatedResult<T>> {
    try {
      console.log(`[${this.serviceName}] Finding documents with filters:`, filters)
      await this.ensureConnection()

      const { page = 1, limit = 20 } = pagination
      const { sortBy = "createdAt", sortOrder = "desc" } = sortOptions

      // Build sort object
      const sort: any = {}
      sort[sortBy] = sortOrder === "desc" ? -1 : 1

      // Build query
      let query = this.model.find(filters)
      
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(field => {
            query = query.populate(field)
          })
        } else {
          query = query.populate(populate)
        }
      }

      // Execute query with pagination
      const skip = (page - 1) * limit
      const [data, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(limit).exec(),
        this.model.countDocuments(filters)
      ])

      const pages = Math.ceil(total / limit)
      const hasNext = page < pages
      const hasPrev = page > 1

      console.log(`[${this.serviceName}] Found ${total} documents, page ${page}/${pages}`)

      return {
        data,
        total,
        pages,
        currentPage: page,
        hasNext,
        hasPrev
      }
    } catch (error: any) {
      console.error(`[${this.serviceName}] Find error:`, error.message)
      throw new Error(`Failed to find ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Find one document with filters
   */
  async findOne(filters: FilterQuery<T>, populate?: string | string[]): Promise<T | null> {
    try {
      console.log(`[${this.serviceName}] Finding one document with filters:`, filters)
      await this.ensureConnection()

      let query = this.model.findOne(filters)
      
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(field => {
            query = query.populate(field)
          })
        } else {
          query = query.populate(populate)
        }
      }

      const document = await query.exec()
      return document
    } catch (error: any) {
      console.error(`[${this.serviceName}] Find one error:`, error.message)
      throw new Error(`Failed to find ${this.serviceName.toLowerCase()}`)
    }
  }

  /**
   * Update document by ID
   */
  async updateById(
    id: string,
    updateData: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    try {
      console.log(`[${this.serviceName}] Updating document:`, id)
      await this.ensureConnection()

      const updatedDocument = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true, ...options }
      )

      if (!updatedDocument) {
        throw new Error(`${this.serviceName} not found`)
      }

      console.log(`[${this.serviceName}] Document updated successfully`)
      return updatedDocument
    } catch (error: any) {
      console.error(`[${this.serviceName}] Update error:`, error.message)
      throw new Error(error.message || `Failed to update ${this.serviceName.toLowerCase()}`)
    }
  }

  /**
   * Update documents with filters
   */
  async updateMany(
    filters: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<{ modifiedCount: number }> {
    try {
      console.log(`[${this.serviceName}] Updating multiple documents with filters:`, filters)
      await this.ensureConnection()

      const result = await this.model.updateMany(filters, updateData, options)
      
      console.log(`[${this.serviceName}] Updated ${result.modifiedCount} documents`)
      return { modifiedCount: result.modifiedCount }
    } catch (error: any) {
      console.error(`[${this.serviceName}] Update many error:`, error.message)
      throw new Error(`Failed to update ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Delete document by ID
   */
  async deleteById(id: string): Promise<void> {
    try {
      console.log(`[${this.serviceName}] Deleting document:`, id)
      await this.ensureConnection()

      const deletedDocument = await this.model.findByIdAndDelete(id)
      
      if (!deletedDocument) {
        throw new Error(`${this.serviceName} not found`)
      }

      console.log(`[${this.serviceName}] Document deleted successfully`)
    } catch (error: any) {
      console.error(`[${this.serviceName}] Delete error:`, error.message)
      throw new Error(error.message || `Failed to delete ${this.serviceName.toLowerCase()}`)
    }
  }

  /**
   * Delete documents with filters
   */
  async deleteMany(filters: FilterQuery<T>): Promise<{ deletedCount: number }> {
    try {
      console.log(`[${this.serviceName}] Deleting multiple documents with filters:`, filters)
      await this.ensureConnection()

      const result = await this.model.deleteMany(filters)
      
      console.log(`[${this.serviceName}] Deleted ${result.deletedCount} documents`)
      return { deletedCount: result.deletedCount }
    } catch (error: any) {
      console.error(`[${this.serviceName}] Delete many error:`, error.message)
      throw new Error(`Failed to delete ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Count documents with filters
   */
  async count(filters: FilterQuery<T> = {}): Promise<number> {
    try {
      await this.ensureConnection()
      return await this.model.countDocuments(filters)
    } catch (error: any) {
      console.error(`[${this.serviceName}] Count error:`, error.message)
      throw new Error(`Failed to count ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Check if document exists
   */
  async exists(filters: FilterQuery<T>): Promise<boolean> {
    try {
      await this.ensureConnection()
      const count = await this.model.countDocuments(filters)
      return count > 0
    } catch (error: any) {
      console.error(`[${this.serviceName}] Exists error:`, error.message)
      throw new Error(`Failed to check if ${this.serviceName.toLowerCase()} exists`)
    }
  }

  /**
   * Aggregate documents
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      console.log(`[${this.serviceName}] Running aggregation pipeline`)
      await this.ensureConnection()
      
      const result = await this.model.aggregate(pipeline)
      return result
    } catch (error: any) {
      console.error(`[${this.serviceName}] Aggregate error:`, error.message)
      throw new Error(`Failed to aggregate ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Bulk write operations
   */
  async bulkWrite(operations: any[]): Promise<any> {
    try {
      console.log(`[${this.serviceName}] Performing bulk write operations`)
      await this.ensureConnection()
      
      const result = await this.model.bulkWrite(operations)
      return result
    } catch (error: any) {
      console.error(`[${this.serviceName}] Bulk write error:`, error.message)
      throw new Error(`Failed to perform bulk write on ${this.serviceName.toLowerCase()}s`)
    }
  }

  /**
   * Validate ObjectId
   */
  protected isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id)
  }

  /**
   * Create ObjectId
   */
  protected createObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id)
  }

  /**
   * Handle database errors
   */
  protected handleError(error: any, operation: string): never {
    console.error(`[${this.serviceName}] ${operation} error:`, error.message)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }
    
    if (error.name === 'CastError') {
      throw new Error(`Invalid ${error.path}: ${error.value}`)
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      throw new Error(`${field} already exists`)
    }
    
    throw new Error(error.message || `Failed to ${operation} ${this.serviceName.toLowerCase()}`)
  }
} 