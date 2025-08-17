# Marketplace Database Schema Design

## Overview
This schema is designed for a marketplace listing system with category-specific fields, user management, and automatic expiry functionality.

## Schema Collections

### 1. Categories Collection
```javascript
{
  _id: ObjectId,
  name: String, // "Electronics"
  slug: String, // "electronics"
  icon: String, // "📱"
  description: String,
  isActive: Boolean,
  sortOrder: Number,
  subcategories: [{
    _id: ObjectId,
    name: String, // "Mobile Phones"
    slug: String, // "mobile-phones"
    description: String,
    isActive: Boolean,
    sortOrder: Number,
    // Category-specific field definitions
    customFields: [{
      fieldName: String, // "brand", "model", "condition"
      fieldType: String, // "select", "text", "number", "boolean"
      label: String, // "Brand"
      required: Boolean,
      options: [String], // For select fields: ["Apple", "Samsung", "Huawei"]
      placeholder: String,
      validation: {
        min: Number,
        max: Number,
        pattern: String
      }
    }]
  }],
  created_at: Date,
  updated_at: Date
}
```

### 2. Products/Listings Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // Reference to Users collection
  
  // Basic Information
  title: String,
  description: String,
  category_id: ObjectId,
  subcategory_id: ObjectId,
  
  // Pricing & Location
  price: {
    amount: Number,
    currency: String, // "USD", "PKR", etc.
    negotiable: Boolean
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact Information
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    preferredMethod: String // "phone", "whatsapp", "email"
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    order: Number
  }], // Max 10 images
  
  // Category-specific dynamic fields
  customFields: [{
    fieldName: String,
    value: String // Stored as string, parsed based on field type
  }],
  
  // Status & Management
  status: String, // "active", "sold", "expired", "removed", "pending"
  listingType: String, // "sale", "rent", "service", "job"
  featured: Boolean,
  views: Number,
  
  // Timing
  created_at: Date,
  updated_at: Date,
  expires_at: Date, // Auto-expiry after 30 days
  renewed_at: Date,
  
  // SEO & Search
  tags: [String],
  slug: String,
  
  // Analytics
  viewHistory: [{
    user_id: ObjectId,
    viewed_at: Date,
    ip_address: String
  }],
  
  // Indexes for search and filtering
  searchText: String // Combined title, description, tags for text search
}
```

### 3. Users Collection (Enhanced)
```javascript
{
  _id: ObjectId,
  // ... existing user fields ...
  
  // Marketplace specific fields
  profile: {
    displayName: String,
    bio: String,
    avatar: String,
    verificationStatus: String, // "unverified", "phone_verified", "email_verified", "fully_verified"
    rating: {
      average: Number,
      count: Number
    }
  },
  
  // User preferences
  preferences: {
    defaultLocation: {
      city: String,
      state: String,
      country: String
    },
    notifications: {
      emailUpdates: Boolean,
      smsUpdates: Boolean,
      pushNotifications: Boolean
    }
  },
  
  // Activity tracking
  activity: {
    totalListings: Number,
    activeListings: Number,
    soldItems: Number,
    joinedDate: Date,
    lastActive: Date
  },
  
  // Liked products
  likedProducts: [{
    product_id: ObjectId,
    liked_at: Date
  }],
  
  // Following/Followers for social features
  following: [ObjectId], // User IDs
  followers: [ObjectId], // User IDs
  
  created_at: Date,
  updated_at: Date
}
```

### 4. User Reviews/Ratings Collection
```javascript
{
  _id: ObjectId,
  reviewer_id: ObjectId, // Who gave the review
  reviewed_user_id: ObjectId, // Who received the review
  product_id: ObjectId, // Related product/transaction
  
  rating: Number, // 1-5 stars
  comment: String,
  
  // Review context
  transactionType: String, // "purchase", "sale", "service"
  
  // Status
  isVerified: Boolean, // If transaction is verified
  isReported: Boolean,
  
  created_at: Date,
  updated_at: Date
}
```

### 5. Messages/Chat Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // User IDs
  product_id: ObjectId, // Related product
  
  messages: [{
    sender_id: ObjectId,
    content: String,
    timestamp: Date,
    messageType: String, // "text", "image", "offer"
    isRead: Boolean,
    offer: { // For price negotiations
      amount: Number,
      status: String // "pending", "accepted", "rejected"
    }
  }],
  
  lastMessage: {
    content: String,
    timestamp: Date,
    sender_id: ObjectId
  },
  
  created_at: Date,
  updated_at: Date
}
```

### 6. Saved Searches Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  name: String, // User-defined name for the search
  
  searchCriteria: {
    category_id: ObjectId,
    subcategory_id: ObjectId,
    location: String,
    priceRange: {
      min: Number,
      max: Number
    },
    customFilters: [{
      fieldName: String,
      value: String
    }],
    keywords: String
  },
  
  notifications: Boolean, // Notify when new items match
  
  created_at: Date,
  updated_at: Date
}
```

## Category-Specific Field Examples

### Electronics > Mobile Phones
```javascript
customFields: [
  { fieldName: "brand", fieldType: "select", label: "Brand", required: true, options: ["Apple", "Samsung", "Huawei", "Xiaomi", "OnePlus", "Other"] },
  { fieldName: "model", fieldType: "text", label: "Model", required: true },
  { fieldName: "condition", fieldType: "select", label: "Condition", required: true, options: ["Brand New", "Like New", "Good", "Fair", "Poor"] },
  { fieldName: "storage", fieldType: "select", label: "Storage", options: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] },
  { fieldName: "color", fieldType: "text", label: "Color" },
  { fieldName: "boxPack", fieldType: "boolean", label: "Original Box & Accessories" },
  { fieldName: "warranty", fieldType: "select", label: "Warranty", options: ["No Warranty", "Company Warranty", "Shop Warranty"] }
]
```

### Vehicles > Cars
```javascript
customFields: [
  { fieldName: "make", fieldType: "select", label: "Make", required: true, options: ["Toyota", "Honda", "Suzuki", "Hyundai", "KIA", "Other"] },
  { fieldName: "model", fieldType: "text", label: "Model", required: true },
  { fieldName: "year", fieldType: "number", label: "Year", required: true, validation: { min: 1990, max: 2024 } },
  { fieldName: "mileage", fieldType: "number", label: "Mileage (KM)" },
  { fieldName: "fuelType", fieldType: "select", label: "Fuel Type", options: ["Petrol", "Diesel", "CNG", "Hybrid", "Electric"] },
  { fieldName: "transmission", fieldType: "select", label: "Transmission", options: ["Manual", "Automatic"] },
  { fieldName: "engineCapacity", fieldType: "text", label: "Engine Capacity" },
  { fieldName: "condition", fieldType: "select", label: "Condition", options: ["Excellent", "Good", "Fair", "Needs Work"] },
  { fieldName: "color", fieldType: "text", label: "Color" }
]
```

### Real Estate > Houses for Sale
```javascript
customFields: [
  { fieldName: "bedrooms", fieldType: "number", label: "Bedrooms", required: true },
  { fieldName: "bathrooms", fieldType: "number", label: "Bathrooms", required: true },
  { fieldName: "area", fieldType: "number", label: "Area (Sq Ft)", required: true },
  { fieldName: "areaUnit", fieldType: "select", label: "Area Unit", options: ["Sq Ft", "Sq Meter", "Marla", "Kanal"] },
  { fieldName: "propertyType", fieldType: "select", label: "Property Type", options: ["House", "Flat", "Plot", "Commercial"] },
  { fieldName: "furnished", fieldType: "select", label: "Furnished", options: ["Furnished", "Semi-Furnished", "Unfurnished"] },
  { fieldName: "parking", fieldType: "number", label: "Parking Spaces" },
  { fieldName: "age", fieldType: "select", label: "Property Age", options: ["Under Construction", "New", "1-5 Years", "5-10 Years", "10+ Years"] }
]
```

## Database Indexes

```javascript
// Products Collection Indexes
db.products.createIndex({ "user_id": 1 })
db.products.createIndex({ "category_id": 1, "subcategory_id": 1 })
db.products.createIndex({ "location.city": 1, "location.state": 1 })
db.products.createIndex({ "price.amount": 1 })
db.products.createIndex({ "status": 1, "expires_at": 1 })
db.products.createIndex({ "created_at": -1 })
db.products.createIndex({ "searchText": "text", "title": "text", "description": "text" })

// Users Collection Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "likedProducts.product_id": 1 })

// Categories Collection Indexes
db.categories.createIndex({ "slug": 1 }, { unique: true })
db.categories.createIndex({ "subcategories.slug": 1 })

// Messages Collection Indexes
db.messages.createIndex({ "participants": 1, "lastMessage.timestamp": -1 })
db.messages.createIndex({ "product_id": 1 })
```

## Key Features Supported

1. **Category-specific fields**: Dynamic custom fields per subcategory
2. **Auto-expiry**: Products expire after 30 days with renewal option
3. **User dashboard**: Track all user's listings and activity
4. **Liked products**: Users can like/save products
5. **Search & filters**: Text search and category-specific filtering
6. **Location-based**: Support for location-based searches
7. **Messaging**: Built-in chat system for negotiations
8. **Reviews**: User rating and review system
9. **Scalable**: Designed for future enhancements

This schema provides a solid foundation for your marketplace while being flexible enough to accommodate different product types and future expansions.
