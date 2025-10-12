# BuySell Liberia - Subscription API Documentation

## Overview

The subscription system provides business plans for high-volume sellers with different tiers and features. Users can subscribe to plans, make payments, and get admin approval before features are enabled.

## Subscription Plans

### Plan Types

1. **Basic Plan**: 1,000 LD (20 ads per month)
2. **Pro Plan**: 2,500 LD (60 ads + 5 featured ads per month)
3. **VIP Plan**: 5,000 LD (Unlimited ads + homepage banner)

### Default Limits for Non-Subscribed Users
- **5 ads per month** (monthly limit)
- No featured ads
- No homepage banner

## API Endpoints

### 1. Get Subscription Plans

**GET** `/api/subscriptions/plans`

Returns all active subscription plans.

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "plan_id",
      "name": "Basic Plan",
      "type": "basic",
      "description": "Perfect for casual sellers",
      "price": 1000,
      "currency": "LD",
      "duration": 30,
      "maxAds": 20,
      "featuredAds": 0,
      "homepageBanner": false,
      "features": ["20 ads per month", "Standard listing visibility"],
      "isPopular": false,
      "priority": 1
    }
  ]
}
```

### 2. Subscribe to a Plan

**POST** `/api/subscriptions/subscribe`

Subscribe to a subscription plan with payment.

**Request Body (multipart/form-data):**
- `planType`: "basic" | "pro" | "vip"
- `paymentMethod`: "MTN" | "Orange" | "Bank" | "manual"
- `transactionId`: string
- `userNotes`: string (optional)
- `screenshot`: file (payment screenshot)

**Response:**
```json
{
  "success": true,
  "message": "Subscription request submitted successfully. Please wait for admin approval.",
  "subscription": {
    "id": "subscription_id",
    "planType": "pro",
    "amount": 2500,
    "status": "pending",
    "paymentStatus": "pending",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get User's Subscription

**GET** `/api/subscriptions/my-subscription`

Get user's current subscription status and history.

**Response:**
```json
{
  "success": true,
  "activeSubscription": {
    "id": "subscription_id",
    "planType": "pro",
    "status": "active",
    "paymentStatus": "paid",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "autoRenew": true,
    "adsUsed": 15,
    "featuredAdsUsed": 2,
    "homepageBannerUsed": false,
    "remainingAds": 45,
    "remainingFeaturedAds": 3,
    "canPostAd": true,
    "canUseFeaturedAd": true,
    "canUseHomepageBanner": false,
    "plan": {
      "name": "Pro Plan",
      "type": "pro",
      "description": "Ideal for active sellers",
      "features": ["60 ads per month", "5 featured ads included"]
    }
  },
  "pendingSubscriptions": [],
  "subscriptionHistory": []
}
```

### 4. Get Usage Information

**GET** `/api/subscriptions/usage`

Get user's subscription usage and limits.

**Response:**
```json
{
  "success": true,
  "hasSubscription": true,
  "subscription": {
    "id": "subscription_id",
    "planType": "pro",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "autoRenew": true
  },
  "limits": {
    "maxAds": 60,
    "maxFeaturedAds": 5,
    "homepageBanner": false
  },
  "usage": {
    "adsUsed": 15,
    "featuredAdsUsed": 2,
    "homepageBannerUsed": false
  },
  "remaining": {
    "ads": 45,
    "featuredAds": 3,
    "homepageBanner": false
  },
  "canPostAd": true,
  "canUseFeaturedAd": true,
  "canUseHomepageBanner": false
}
```

### 5. Increment Usage

**POST** `/api/subscriptions/usage`

Increment usage counters for ads, featured ads, or homepage banner.

**Request Body:**
```json
{
  "action": "increment",
  "type": "ad" | "featured_ad" | "homepage_banner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ad usage incremented",
  "subscription": {
    "id": "subscription_id",
    "adsUsed": 16,
    "featuredAdsUsed": 2,
    "homepageBannerUsed": false,
    "remainingAds": 44,
    "remainingFeaturedAds": 3,
    "canPostAd": true,
    "canUseFeaturedAd": true,
    "canUseHomepageBanner": false
  }
}
```

## Admin Endpoints

### 6. Get All Subscriptions (Admin)

**GET** `/api/admin/subscriptions`

Get all subscription requests with pagination and filtering.

**Query Parameters:**
- `status`: "pending" | "active" | "expired" | "cancelled" | "suspended"
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Headers:**
- `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "subscription_id",
      "user": {
        "fullName": "John Doe",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "plan": {
        "name": "Pro Plan",
        "type": "pro",
        "description": "Ideal for active sellers"
      },
      "planType": "pro",
      "status": "pending",
      "paymentStatus": "pending",
      "amount": 2500,
      "currency": "LD",
      "paymentMethod": "MTN",
      "transactionId": "MTN123456",
      "paymentScreenshot": "/uploads/payments/screenshot.jpg",
      "paymentNotes": "Payment made via MTN Mobile Money",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "pending": 15,
    "active": 80,
    "expired": 5,
    "cancelled": 10
  }
}
```

### 7. Approve Subscription (Admin)

**PATCH** `/api/admin/subscriptions/{id}/approve`

Approve a pending subscription request.

**Headers:**
- `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "adminNotes": "Payment verified and approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription approved successfully",
  "subscription": {
    "id": "subscription_id",
    "user": {
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "plan": {
      "name": "Pro Plan",
      "type": "pro"
    },
    "planType": "pro",
    "status": "active",
    "paymentStatus": "paid",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "approvedBy": "admin_user_id",
    "approvedAt": "2024-01-01T12:00:00.000Z",
    "adminNotes": "Payment verified and approved"
  }
}
```

### 8. Reject Subscription (Admin)

**PATCH** `/api/admin/subscriptions/{id}/reject`

Reject a pending subscription request.

**Headers:**
- `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Payment verification failed",
  "adminNotes": "Screenshot is unclear"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription rejected successfully",
  "subscription": {
    "id": "subscription_id",
    "user": {
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "plan": {
      "name": "Pro Plan",
      "type": "pro"
    },
    "planType": "pro",
    "status": "cancelled",
    "paymentStatus": "failed",
    "cancelledBy": "admin_user_id",
    "cancelledAt": "2024-01-01T12:00:00.000Z",
    "cancellationReason": "Payment verification failed",
    "adminNotes": "Screenshot is unclear"
  }
}
```

## Product Creation with Limits

When creating a product via `POST /api/products`, the system automatically:

1. **Checks subscription limits** before allowing product creation
2. **Returns appropriate error messages** if limits are exceeded
3. **Increments usage counters** after successful product creation

### Error Response for Limit Exceeded:

```json
{
  "error": "You have reached the limit of 5 ads per month. Please subscribe to a plan to post more ads.",
  "subscriptionInfo": {
    "adsUsed": 5,
    "maxAds": 5,
    "remainingAds": 0,
    "canUpgrade": true
  }
}
```

## Database Models

### SubscriptionPlan
- `name`: Plan name
- `type`: "basic" | "pro" | "vip"
- `description`: Plan description
- `price`: Price in LD
- `maxAds`: Maximum ads per month
- `featuredAds`: Featured ads included
- `homepageBanner`: VIP feature
- `features`: Array of feature descriptions

### UserSubscription
- `user`: Reference to User
- `plan`: Reference to SubscriptionPlan
- `planType`: "basic" | "pro" | "vip"
- `status`: "pending" | "active" | "expired" | "cancelled" | "suspended"
- `paymentStatus`: "pending" | "paid" | "failed" | "refunded"
- `startDate`: Subscription start date
- `endDate`: Subscription end date
- `adsUsed`: Number of ads used
- `featuredAdsUsed`: Number of featured ads used
- `homepageBannerUsed`: Whether homepage banner was used
- `amount`: Subscription amount
- `paymentMethod`: Payment method used
- `transactionId`: Payment transaction ID
- `paymentScreenshot`: Payment proof screenshot
- `approvedBy`: Admin who approved
- `approvedAt`: Approval timestamp

## Usage Flow

1. **User subscribes** → Creates subscription with "pending" status
2. **Admin reviews** → Approves or rejects the subscription
3. **Features enabled** → User can use subscription features
4. **Usage tracking** → System tracks ad usage and limits
5. **Renewal** → Auto-renewal or manual renewal when expired

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (limit exceeded)
- `404`: Not Found
- `409`: Conflict (duplicate subscription)
- `500`: Internal Server Error

Error responses include detailed error messages and relevant information for troubleshooting.
