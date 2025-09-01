# Admin Categories API Documentation

This module provides comprehensive category and subcategory management functionality for the admin panel, including icon upload capabilities using multer.

## Authentication
All endpoints require admin authentication with JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints Overview

### 1. Main Categories Management

#### GET `/api/admin/categories`
Fetch all categories with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search in name, description, or slug

**Response:**
```json
{
  "success": true,
  "categories": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST `/api/admin/categories`
Create a new category with icon upload.

**Request:** FormData with:
- `icon`: Image file (required)
- `formData`: JSON string containing:
  ```json
  {
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "isActive": true,
    "sortOrder": 1,
    "subcategories": []
  }
  ```

**Response:**
```json
{
  "success": true,
  "category": {...},
  "message": "Category created successfully"
}
```

#### PUT `/api/admin/categories`
Update an existing category.

**Request:** FormData with:
- `icon`: Image file (optional, only if updating icon)
- `formData`: JSON string containing:
  ```json
  {
    "categoryId": "category_id_here",
    "name": "Updated Electronics",
    "description": "Updated description",
    "isActive": true,
    "sortOrder": 1,
    "subcategories": [...]
  }
  ```

#### DELETE `/api/admin/categories?categoryId=<id>`
Delete a category (super_admin only).

### 2. Individual Category Management

#### GET `/api/admin/categories/[id]`
Fetch a specific category by ID.

#### PATCH `/api/admin/categories/[id]`
Update specific fields of a category.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 2
}
```

#### DELETE `/api/admin/categories/[id]`
Delete a specific category (super_admin only).

### 3. Category Icon Management

#### POST `/api/admin/categories/[id]/icon`
Upload or update category icon.

**Request:** FormData with:
- `icon`: Image file (required)

**Supported formats:** JPEG, PNG, WebP, GIF, SVG
**Max size:** 2MB

#### DELETE `/api/admin/categories/[id]/icon`
Remove category icon.

### 4. Subcategories Management

#### GET `/api/admin/categories/[id]/subcategories`
Fetch all subcategories for a specific category.

#### POST `/api/admin/categories/[id]/subcategories`
Add a new subcategory to a category.

**Request Body:**
```json
{
  "name": "Mobile Phones",
  "description": "Smartphones and feature phones",
  "isActive": true,
  "sortOrder": 1,
  "customFields": [
    {
      "fieldName": "brand",
      "fieldType": "select",
      "label": "Brand",
      "required": true,
      "options": ["Apple", "Samsung", "Huawei"]
    }
  ]
}
```

#### PUT `/api/admin/categories/[id]/subcategories`
Update all subcategories for a category.

**Request Body:**
```json
{
  "subcategories": [
    {
      "_id": "subcategory_id",
      "name": "Updated Subcategory",
      "description": "Updated description",
      "isActive": true,
      "sortOrder": 1,
      "customFields": [...]
    }
  ]
}
```

### 5. Individual Subcategory Management

#### GET `/api/admin/categories/[id]/subcategories/[subId]`
Fetch a specific subcategory.

#### PATCH `/api/admin/categories/[id]/subcategories/[subId]`
Update a specific subcategory.

**Request Body:**
```json
{
  "name": "Updated Subcategory Name",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 2,
  "customFields": [...]
}
```

#### DELETE `/api/admin/categories/[id]/subcategories/[subId]`
Delete a specific subcategory.

### 6. Bulk Operations

#### POST `/api/admin/categories/bulk`
Perform bulk operations on multiple categories (super_admin only).

**Request Body:**
```json
{
  "operation": "activate|deactivate|delete|updateSortOrder",
  "categoryIds": ["id1", "id2", "id3"],
  "data": [...] // Required for updateSortOrder operation
}
```

**Available Operations:**
- `activate`: Activate multiple categories
- `deactivate`: Deactivate multiple categories
- `delete`: Delete multiple categories
- `updateSortOrder`: Update sort order for multiple categories

**Example for updateSortOrder:**
```json
{
  "operation": "updateSortOrder",
  "categoryIds": ["id1", "id2"],
  "data": [
    { "categoryId": "id1", "sortOrder": 1 },
    { "categoryId": "id2", "sortOrder": 2 }
  ]
}
```

## Custom Fields Structure

Subcategories support custom fields for product specifications:

```json
{
  "fieldName": "brand",
  "fieldType": "text|number|select|boolean|textarea|date",
  "label": "Brand",
  "required": true,
  "options": ["Option1", "Option2"], // For select type
  "placeholder": "Enter brand name", // For text types
  "validation": {
    "min": 0,
    "max": 100,
    "minLength": 2,
    "maxLength": 50,
    "pattern": "^[a-zA-Z0-9]+$"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "stack": "..." // Only in development mode
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## File Upload Guidelines

### Icon Upload
- **Supported formats:** JPEG, PNG, WebP, GIF, SVG
- **Max file size:** 2MB
- **Storage location:** `/public/uploads/category-icons/`
- **File naming:** `category_{categoryId}_{timestamp}_{random}.{extension}`

### FormData Structure
When uploading files, use FormData with:
- File field: `icon` (for category icons)
- JSON field: `formData` (containing category/subcategory data)

## Security Features

1. **Role-based Access Control:**
   - `admin`: Can create, read, update categories and subcategories
   - `super_admin`: Can perform all operations including deletion and bulk operations

2. **Input Validation:**
   - File type and size validation
   - Required field validation
   - Unique name/slug validation
   - ObjectId validation

3. **File Security:**
   - Automatic file cleanup on deletion
   - Secure file naming with timestamps
   - File type restrictions

## Usage Examples

### Creating a Category with Icon
```javascript
const formData = new FormData();
formData.append('icon', iconFile);
formData.append('formData', JSON.stringify({
  name: 'Electronics',
  description: 'Electronic devices',
  isActive: true,
  sortOrder: 1,
  subcategories: []
}));

const response = await fetch('/api/admin/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Updating Category Icon
```javascript
const formData = new FormData();
formData.append('icon', newIconFile);

const response = await fetch(`/api/admin/categories/${categoryId}/icon`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Bulk Activate Categories
```javascript
const response = await fetch('/api/admin/categories/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    operation: 'activate',
    categoryIds: ['id1', 'id2', 'id3']
  })
});
```
