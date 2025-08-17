# Base Service Architecture

This directory contains the base service architecture that provides common CRUD operations and utility methods for all service classes in the application.

## Overview

The base service architecture consists of:

1. **BaseService** - Abstract base class with common CRUD operations
2. **ProductService** - Enhanced product service extending BaseService
3. **Shared Types** - Common interfaces for pagination, sorting, and results

## BaseService Class

The `BaseService<T>` is an abstract class that provides common database operations for any Mongoose model.

### Features

- **CRUD Operations**: Create, Read, Update, Delete operations
- **Pagination**: Built-in pagination support with metadata
- **Sorting**: Flexible sorting options
- **Filtering**: Advanced query filtering
- **Population**: Automatic field population
- **Error Handling**: Centralized error handling with detailed messages
- **Connection Management**: Automatic database connection handling
- **Aggregation**: Support for MongoDB aggregation pipelines
- **Bulk Operations**: Bulk write operations support

### Basic Usage

```typescript
import { BaseService } from './base.service'
import { YourModel } from '../models/your.model'

export class YourService extends BaseService<YourModel> {
  constructor() {
    super(YourModel, "YOUR_SERVICE")
  }
  
  // Your custom methods here
}
```

### Available Methods

#### Core CRUD Operations

- `create(data: Partial<T>): Promise<T>` - Create a new document
- `findById(id: string, populate?: string | string[]): Promise<T | null>` - Find by ID
- `findOne(filters: FilterQuery<T>, populate?: string | string[]): Promise<T | null>` - Find one document
- `find(filters, pagination, sortOptions, populate): Promise<PaginatedResult<T>>` - Find with pagination
- `updateById(id: string, updateData: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>` - Update by ID
- `updateMany(filters: FilterQuery<T>, updateData: UpdateQuery<T>, options?: QueryOptions): Promise<{ modifiedCount: number }>` - Update multiple
- `deleteById(id: string): Promise<void>` - Delete by ID
- `deleteMany(filters: FilterQuery<T>): Promise<{ deletedCount: number }>` - Delete multiple

#### Utility Methods

- `count(filters?: FilterQuery<T>): Promise<number>` - Count documents
- `exists(filters: FilterQuery<T>): Promise<boolean>` - Check if document exists
- `aggregate(pipeline: any[]): Promise<any[]>` - Run aggregation pipeline
- `bulkWrite(operations: any[]): Promise<any>` - Perform bulk operations

#### Helper Methods

- `isValidObjectId(id: string): boolean` - Validate ObjectId
- `createObjectId(id: string): mongoose.Types.ObjectId` - Create ObjectId
- `handleError(error: any, operation: string): never` - Centralized error handling

## ProductService Class

The `ProductService` extends `BaseService<IProduct>` and provides product-specific functionality.

### Enhanced Features

- **Advanced Filtering**: Category, price range, condition, location, negotiable status
- **Search**: Full-text search with MongoDB text indexes
- **Favorites**: Toggle and manage user favorites
- **Statistics**: Product analytics and statistics
- **Status Management**: Mark as sold, renew products
- **Location-based Queries**: Find products by city, state, country
- **Category Management**: Get products by category and subcategory
- **Featured Products**: Get featured/trending products

### Usage Examples

```typescript
import { ProductService } from './product.service'

const productService = new ProductService()

// Create a product
const product = await productService.createProduct(sellerId, productData)

// Get products with filters
const result = await productService.getProducts(
  { category: "Electronics", minPrice: 1000 },
  { sortBy: "price", sortOrder: "asc" },
  { page: 1, limit: 20 }
)

// Search products
const searchResult = await productService.searchProducts("iphone", filters, pagination)

// Toggle favorite
const favoriteResult = await productService.toggleFavorite(productId, userId)
```

## Types and Interfaces

### PaginationOptions

```typescript
interface PaginationOptions {
  page?: number    // Default: 1
  limit?: number   // Default: 20
}
```

### PaginatedResult

```typescript
interface PaginatedResult<T> {
  data: T[]           // Array of documents
  total: number       // Total count
  pages: number       // Total pages
  currentPage: number // Current page
  hasNext: boolean    // Has next page
  hasPrev: boolean    // Has previous page
}
```

### SortOptions

```typescript
interface SortOptions {
  sortBy?: string           // Field to sort by
  sortOrder?: "asc" | "desc" // Sort order
}
```

## Error Handling

The base service provides centralized error handling with detailed error messages:

- **ValidationError**: Field validation errors
- **CastError**: Invalid data type errors
- **DuplicateKeyError**: Unique constraint violations
- **Generic Errors**: Custom error messages

## Database Connection

The base service automatically handles database connections using the `connectDB()` function from `@/lib/mongoose`.

## Best Practices

1. **Extend BaseService**: Always extend BaseService for new services
2. **Use TypeScript**: Leverage TypeScript for type safety
3. **Handle Errors**: Use the built-in error handling methods
4. **Pagination**: Always use pagination for large datasets
5. **Population**: Use population for related data
6. **Indexing**: Ensure proper database indexes for performance
7. **Validation**: Use Mongoose validation schemas
8. **Logging**: Use the built-in logging for debugging

## Example Implementation

```typescript
import { BaseService, type PaginationOptions, type SortOptions } from './base.service'
import { YourModel, type IYourModel } from '../models/your.model'

export interface CreateYourData {
  name: string
  description: string
  // ... other fields
}

export interface YourFilters {
  name?: string
  category?: string
  // ... other filters
}

export class YourService extends BaseService<IYourModel> {
  constructor() {
    super(YourModel, "YOUR_SERVICE")
  }

  async createYourItem(data: CreateYourData): Promise<IYourModel> {
    try {
      return await this.create(data)
    } catch (error: any) {
      this.handleError(error, "create")
    }
  }

  async getYourItems(
    filters: YourFilters = {},
    sortOptions: SortOptions = {},
    pagination: PaginationOptions = {}
  ) {
    try {
      const queryFilters: any = {}
      
      if (filters.name) {
        queryFilters.name = new RegExp(filters.name, "i")
      }
      
      if (filters.category) {
        queryFilters.category = filters.category
      }

      return await this.find(queryFilters, pagination, sortOptions)
    } catch (error: any) {
      this.handleError(error, "get items")
    }
  }
}
```

## Migration Guide

To migrate existing services to use the base service:

1. **Import BaseService**: Import the base service and types
2. **Extend BaseService**: Change your service class to extend BaseService
3. **Update Constructor**: Call super() with your model and service name
4. **Replace Direct Operations**: Replace direct model operations with base service methods
5. **Update Error Handling**: Use the handleError method
6. **Test Thoroughly**: Test all functionality after migration

This architecture provides a solid foundation for building scalable and maintainable services in your application. 