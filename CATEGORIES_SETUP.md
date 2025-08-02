# Categories System Setup Guide

This guide explains how to set up and use the database-driven categories system in BuySell.

## Overview

The categories system is now fully database-driven, allowing admins to:
- Add/edit/delete categories without code changes
- Configure custom fields for each subcategory
- Manage category hierarchy and sorting
- Track product counts per category

## Setup Instructions

### 1. Seed Initial Categories

First, populate your database with the initial categories:

```bash
npm run seed:categories
```

This will create 17 main categories with subcategories and custom fields.

### 2. Test the API

Verify that the categories API is working:

```bash
npm run test:categories
```

This will test:
- Getting all categories
- Getting categories with products
- Getting categories with limited products

### 3. Start the Development Server

```bash
npm run dev
```

## API Endpoints

### GET /api/categories

Retrieve all categories with optional parameters:

**Parameters:**
- `includeProducts` (boolean): Include products for each category
- `includeCount` (boolean): Include product counts (default: true)
- `limit` (number): Limit number of categories returned
- `productsLimit` (number): Limit products per category (default: 5)

**Examples:**
```bash
# Get all categories
GET /api/categories

# Get categories with products
GET /api/categories?includeProducts=true

# Get categories with limited products
GET /api/categories?includeProducts=true&productsLimit=3

# Get only top 5 categories
GET /api/categories?limit=5
```

### POST /api/categories

Create a new category (admin only):

```json
{
  "name": "New Category",
  "slug": "new-category",
  "icon": "🎯",
  "description": "Description of the category",
  "sortOrder": 1,
  "subcategories": [
    {
      "name": "Subcategory",
      "slug": "subcategory",
      "description": "Subcategory description",
      "customFields": []
    }
  ]
}
```

### PUT /api/categories/[id]

Update an existing category:

```json
{
  "name": "Updated Category",
  "isActive": true,
  "sortOrder": 2
}
```

### DELETE /api/categories/[id]

Delete a category (only if no products exist).

## Frontend Usage

### Using the useCategories Hook

```typescript
import { useCategories } from '@/hooks/useCategories';

function MyComponent() {
  // Get all categories with products
  const { categories, loading, error } = useCategories(true);
  
  // Get categories without products
  const { categories } = useCategories(false);
  
  // Get limited categories
  const { categories } = useCategories(true, 5);
}
```

### Categories Page

The categories page (`/categories`) automatically:
- Loads all categories with their products
- Shows product counts
- Displays subcategories
- Provides navigation to category-specific pages

## Database Schema

### Category Model

```javascript
{
  name: String,           // Category name
  slug: String,           // URL-friendly slug
  icon: String,           // Emoji or icon
  description: String,    // Category description
  isActive: Boolean,      // Whether category is active
  sortOrder: Number,      // Display order
  subcategories: [        // Array of subcategories
    {
      name: String,
      slug: String,
      description: String,
      isActive: Boolean,
      sortOrder: Number,
      customFields: [     // Custom form fields
        {
          fieldName: String,
          fieldType: String, // 'text', 'number', 'select', 'boolean', 'textarea', 'date'
          label: String,
          required: Boolean,
          options: [String], // For select fields
          placeholder: String,
          validation: Object
        }
      ]
    }
  ]
}
```

## Admin Interface

Access the admin interface at `/admin/categories` to:
- View all categories
- Create new categories
- Edit existing categories
- Delete categories
- Manage subcategories and custom fields

## Custom Fields

Each subcategory can have custom fields that appear in the product form:

### Field Types

- **text**: Simple text input
- **number**: Numeric input
- **select**: Dropdown with options
- **boolean**: Checkbox
- **textarea**: Multi-line text
- **date**: Date picker

### Example Custom Fields

```javascript
customFields: [
  {
    fieldName: 'brand',
    fieldType: 'select',
    label: 'Brand',
    required: true,
    options: ['Apple', 'Samsung', 'Huawei', 'Other']
  },
  {
    fieldName: 'model',
    fieldType: 'text',
    label: 'Model',
    required: true,
    placeholder: 'e.g. iPhone 13 Pro'
  },
  {
    fieldName: 'condition',
    fieldType: 'select',
    label: 'Condition',
    required: true,
    options: ['Brand New', 'Like New', 'Good', 'Fair', 'Poor']
  }
]
```

## Troubleshooting

### Common Issues

1. **Categories not loading**
   - Check if database is connected
   - Verify categories exist in database
   - Run `npm run seed:categories` to populate

2. **Products not showing**
   - Ensure products have correct category names
   - Check if products are active and not expired
   - Verify product status is 'active'

3. **API errors**
   - Check MongoDB connection
   - Verify environment variables
   - Check server logs for detailed errors

### Debug Commands

```bash
# Check database connection
npm run test:categories

# Reset categories
npm run seed:categories

# Check server logs
npm run dev
```

## Performance Considerations

- Categories are cached in the frontend
- Product counts are calculated on-demand
- Large product lists are paginated
- Images are optimized and compressed

## Future Enhancements

- Category analytics and insights
- Category-based pricing
- Category templates
- Bulk category operations
- Category import/export
- Category-specific features 