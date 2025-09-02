# Categories and Subcategories API Test Guide

This guide demonstrates how to use the improved Categories and Subcategories API with smooth CRUD operations and proper sort order management.

## Overview of Changes

### 🔧 **Fixed Issues**
1. **Sort Order Management**: Existing subcategory sort orders are now preserved during updates
2. **ID Preservation**: Subcategory IDs are maintained across updates to prevent data loss
3. **Enhanced CRUD**: Added individual subcategory management endpoints
4. **Improved Validation**: Comprehensive validation for all operations
5. **Automatic Slug Generation**: Slugs are auto-generated if not provided

### 🛠️ **New Features**
1. **Individual Subcategory CRUD**: Add, update, delete, and reorder subcategories individually
2. **Smart Sort Order**: Automatic sort order assignment and preservation
3. **Better Error Handling**: Detailed error messages and validation
4. **Duplicate Prevention**: Prevents duplicate names and slugs within categories

---

## API Endpoints

### 1. **Category CRUD Operations**

#### GET Categories
```bash
# Get all categories with subcategories sorted by sortOrder
GET /api/categories

# Get specific category by ID or slug
GET /api/categories?categoryId=64f123...
GET /api/categories?slug=electronics

# Include products in subcategories
GET /api/categories?includeProducts=true&limit=10&page=1
```

#### POST Create Category
```bash
POST /api/categories
Content-Type: multipart/form-data

Fields:
- name: "Electronics"
- slug: "electronics" (optional - auto-generated if not provided)
- description: "Electronic devices and gadgets"
- isActive: true
- sortOrder: 1 (optional - auto-assigned if not provided)
- icon: [file upload]
- subcategories: JSON array (optional)

Example subcategories:
[
  {
    "name": "Mobile Phones",
    "description": "Smartphones and basic phones",
    "isActive": true,
    "sortOrder": 0,
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
]
```

#### PUT Update Category
```bash
PUT /api/categories?categoryId=64f123...
Content-Type: multipart/form-data

Fields:
- name: "Updated Electronics"
- description: "Updated description"
- subcategories: JSON array (preserves existing IDs and sort orders)
```

#### DELETE Category
```bash
DELETE /api/categories?categoryId=64f123...
# or
DELETE /api/categories?slug=electronics
```

### 2. **Individual Subcategory Management**

#### Add Subcategory
```bash
PATCH /api/categories?categoryId=64f123...&action=add
Content-Type: application/json

{
  "name": "Tablets",
  "description": "iPad, Android tablets, etc.",
  "isActive": true,
  "customFields": []
}

Response:
{
  "subcategory": {
    "_id": "64f456...",
    "name": "Tablets",
    "slug": "tablets",
    "description": "iPad, Android tablets, etc.",
    "isActive": true,
    "sortOrder": 2,
    "customFields": []
  },
  "message": "Subcategory added successfully"
}
```

#### Update Subcategory
```bash
PATCH /api/categories?categoryId=64f123...&subcategoryId=64f456...&action=update
Content-Type: application/json

{
  "name": "Smart Tablets",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 1
}

Response:
{
  "subcategory": {
    "_id": "64f456...",
    "name": "Smart Tablets",
    "slug": "smart-tablets",
    "description": "Updated description",
    "isActive": true,
    "sortOrder": 1,
    "customFields": []
  },
  "message": "Subcategory updated successfully"
}
```

#### Delete Subcategory
```bash
PATCH /api/categories?categoryId=64f123...&subcategoryId=64f456...&action=delete
Content-Type: application/json

{}

Response:
{
  "message": "Subcategory deleted successfully"
}
```

#### Reorder Subcategories
```bash
PATCH /api/categories?categoryId=64f123...&action=reorder
Content-Type: application/json

{
  "subcategories": [
    { "_id": "64f456...", "sortOrder": 0 },
    { "_id": "64f789...", "sortOrder": 1 },
    { "_id": "64fabc...", "sortOrder": 2 }
  ]
}

Response:
{
  "subcategories": [
    // Reordered subcategories array
  ],
  "message": "Subcategories reordered successfully"
}
```

---

## Frontend Service Integration

### Using CategoryService

```typescript
import { CategoryService } from '@/services/Category.Service';

const categoryService = new CategoryService();

// Get categories with proper sorting
const categories = await categoryService.getCategories({ 
  includeProducts: true, 
  limit: 50 
});

// Add new subcategory
const newSubcategory = await categoryService.addSubcategory('categoryId', {
  name: 'New Subcategory',
  description: 'Description here',
  isActive: true
});

// Update subcategory
const updatedSubcategory = await categoryService.updateSubcategory(
  'categoryId',
  'subcategoryId',
  { name: 'Updated Name', sortOrder: 5 }
);

// Delete subcategory
await categoryService.deleteSubcategory('categoryId', 'subcategoryId');

// Reorder subcategories
const reordered = await categoryService.reorderSubcategories('categoryId', [
  { _id: 'sub1', sortOrder: 0 },
  { _id: 'sub2', sortOrder: 1 }
]);
```

---

## Key Improvements

### 🎯 **Sort Order Management**
- **Preserves Existing Orders**: When updating categories, existing subcategory sort orders are maintained
- **Auto-Assignment**: New subcategories get the next available sort order
- **Reordering**: Dedicated endpoint for changing subcategory order
- **Consistent Sorting**: All API responses return subcategories sorted by sortOrder

### 🔄 **ID Preservation**
- **Smart Matching**: Finds existing subcategories by ID, slug, or name to preserve data
- **No Data Loss**: Updates maintain existing subcategory IDs and custom fields
- **Seamless Updates**: Frontend can update categories without losing subcategory state

### ✅ **Enhanced Validation**
- **Duplicate Prevention**: Checks for duplicate names and slugs within categories
- **Required Fields**: Validates required fields with clear error messages
- **Type Safety**: Proper TypeScript interfaces for all operations
- **Constraint Checking**: Prevents deletion of categories/subcategories with active products

### 🛡️ **Error Handling**
- **Detailed Messages**: Clear error messages for all failure scenarios
- **Status Codes**: Proper HTTP status codes for different error types
- **Validation Errors**: Specific validation error messages
- **Graceful Failures**: Operations fail gracefully without corrupting data

---

## Migration Notes

### For Existing Data
1. **Automatic Compatibility**: New API is backward compatible with existing category data
2. **Sort Order Migration**: Existing subcategories will get auto-assigned sort orders on first update
3. **Slug Generation**: Missing slugs will be auto-generated from names
4. **ID Preservation**: Existing subcategory IDs will be maintained

### For Frontend Code
1. **Service Updates**: Use the updated CategoryService methods for subcategory management
2. **Sort Order UI**: Implement drag-and-drop reordering using the reorder endpoint
3. **Error Handling**: Update error handling to use the new detailed error messages
4. **State Management**: Leverage ID preservation for smoother state updates

---

## Testing Checklist

### ✅ **Category Operations**
- [ ] Create category with subcategories
- [ ] Update category preserving subcategory data
- [ ] Delete category (should fail if has active products)
- [ ] Get categories with proper subcategory sorting

### ✅ **Subcategory Operations**
- [ ] Add individual subcategory
- [ ] Update subcategory (name, description, custom fields)
- [ ] Delete subcategory (should fail if has active products)
- [ ] Reorder subcategories

### ✅ **Sort Order Management**
- [ ] New subcategories get correct sort order
- [ ] Existing sort orders are preserved during updates
- [ ] Reordering works correctly
- [ ] All responses return sorted subcategories

### ✅ **Validation**
- [ ] Duplicate name prevention
- [ ] Duplicate slug prevention
- [ ] Required field validation
- [ ] Invalid ID handling

### ✅ **Error Handling**
- [ ] Clear error messages
- [ ] Proper HTTP status codes
- [ ] Graceful failure handling
- [ ] Product constraint checking

This improved API provides a robust foundation for category and subcategory management with smooth CRUD operations and proper data consistency.
