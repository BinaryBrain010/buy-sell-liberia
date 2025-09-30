# Featured Listings with Manual Payment - Implementation Summary

## ✅ Implementation Complete

This document summarizes the complete backend implementation of the Featured Listings monetization feature with manual payment flow.

---

## 📋 What Was Built

### 1. **Database Schema Updates**

#### **ManualPayment Model** (`models/ManualPayment.ts`)
Added feature-specific fields:
- `featureType: "featured_listing"` - Type of monetization feature
- `featurePlan: "3_days" | "7_days" | "14_days"` - Selected pricing plan
- `featureDuration: number` - Duration in days (3, 7, or 14)

#### **Product Model** (`models/Product.ts`)
Added expiration tracking:
- `featuredExpiresAt?: Date` - When featured status expires
- `featuredStartedAt?: Date` - When it was featured
- `featuredDuration?: number` - Duration in days

---

### 2. **API Endpoints**

#### **User-Facing APIs**

##### `GET /api/monetization/details`
**Purpose:** Get payment details and pricing plans for featuring listings

**Response:**
```json
{
  "enabled": true,
  "paymentDetails": {
    "mtn": { "number": "0123456789", "name": "Admin Name" },
    "orange": { "number": "0987654321", "name": "Admin Name" },
    "bank": { 
      "accountNumber": "1234567890",
      "accountName": "BuySell Liberia",
      "bankName": "GTBank Liberia"
    }
  },
  "plans": {
    "3_days": { "price": 150, "duration": 3, "label": "3 Days" },
    "7_days": { "price": 300, "duration": 7, "label": "7 Days" },
    "14_days": { "price": 500, "duration": 14, "label": "14 Days" }
  },
  "currency": "LRD"
}
```

##### `POST /api/manual-payments` (Updated)
**Purpose:** Submit feature payment request

**Request:**
```json
{
  "listing": "productId",
  "featurePlan": "7_days",
  "method": "MTN",
  "transactionId": "TXN123456",
  "screenshot": "file",
  "userNotes": "Paid via MTN"
}
```

**Features:**
- ✅ Auto-calculates amount from selected plan
- ✅ Validates plan exists in settings
- ✅ Prevents duplicate pending requests
- ✅ Checks if monetization is enabled
- ✅ Stores feature duration

---

#### **Admin APIs**

##### `GET /api/admin/manual-payments` (Updated)
**Purpose:** Get all manual payment requests

**Response includes:**
- User details (fullName, username, email)
- Listing details (title, featured status)
- Payment details (amount, method, transactionId, screenshot)
- **NEW:** Feature details (featureType, featurePlan, featureDuration)

##### `PATCH /api/admin/manual-payments/[id]/approve` (Updated)
**Purpose:** Approve payment and feature the listing

**New Logic:**
1. Calculates expiration: `now + featureDuration days`
2. Updates product:
   - `featured = true`
   - `featuredExpiresAt = calculated date`
   - `featuredStartedAt = now`
   - `featuredDuration = duration from plan`
3. Sends notification to user with plan details

##### `GET /api/cron/unfeature-expired` (NEW)
**Purpose:** Auto-unfeature expired listings (cron job)

**Security:** Protected by `CRON_SECRET` header

**Actions:**
1. Finds products where `featuredExpiresAt <= now`
2. Sets `featured = false`
3. Removes expiration fields
4. Notifies users via chat

---

### 3. **Settings & Configuration**

#### Default Pricing Structure
```javascript
{
  featured_listing: {
    "3_days": { 
      price: 150, 
      duration: 3, 
      label: "3 Days",
      description: "Feature your listing for 3 days"
    },
    "7_days": { 
      price: 300, 
      duration: 7, 
      label: "7 Days",
      description: "Feature your listing for 1 week"
    },
    "14_days": { 
      price: 500, 
      duration: 14, 
      label: "14 Days",
      description: "Feature your listing for 2 weeks"
    }
  }
}
```

#### Payment Account Details Template
```javascript
{
  mtn: {
    number: "",
    name: "",
    instructions: "Send payment to the MTN number above..."
  },
  orange: {
    number: "",
    name: "",
    instructions: "Send payment to the Orange number above..."
  },
  bank: {
    accountNumber: "",
    accountName: "",
    bankName: "",
    instructions: "Transfer to the bank account above..."
  }
}
```

**Admin Setup Required:**
1. Go to Admin Panel → Settings → Monetization
2. Enter payment account details (MTN, Orange, Bank)
3. Adjust pricing if needed (default: 150/300/500 LRD)
4. Toggle monetization enabled

---

## 🔄 Complete User Flow

### **User Journey:**

1. **User views their dashboard**
   - Sees "Feature This Ad" button on their listing

2. **User clicks "Feature" button**
   - Frontend calls: `GET /api/monetization/details`
   - Form displays:
     - Payment account options (MTN/Orange/Bank)
     - Pricing plans (3/7/14 days)

3. **User selects plan and pays**
   - Selects plan (e.g., "7_days")
   - Sends money to admin account (MTN/Orange/Bank)
   - Enters transaction ID
   - Uploads screenshot
   - Submits form

4. **System processes request**
   - Frontend calls: `POST /api/manual-payments`
   - Backend validates and stores request
   - Status: "pending"

5. **Admin reviews and approves**
   - Admin sees request in manual payments panel
   - Verifies screenshot and transaction ID
   - Clicks "Approve"
   - Backend calls: `PATCH /api/admin/manual-payments/[id]/approve`

6. **Product gets featured**
   - `featured = true`
   - `featuredExpiresAt = now + 7 days`
   - User gets chat notification: "Featured for 7 days"

7. **Auto-expiration**
   - Cron job runs hourly
   - Checks: `featuredExpiresAt <= now`
   - Sets `featured = false`
   - Notifies user: "Featured period ended"

---

## 🔒 Security & Validation

### Request Validation
- ✅ User authentication required
- ✅ User can only feature their own products
- ✅ Prevents duplicate pending requests
- ✅ Validates feature plan exists
- ✅ Auto-calculates amount (can't be manipulated)
- ✅ Screenshot upload required

### Admin Controls
- ✅ Only super_admin can approve/reject payments
- ✅ Audit logging for all operations
- ✅ Admin can manually unfeature anytime

### Cron Job Security
- ✅ Protected by CRON_SECRET header
- ✅ Fails gracefully if notifications error
- ✅ Logs all operations

---

## 📊 Database Changes Summary

### New Fields Added:

**ManualPayment Collection:**
```javascript
{
  // ... existing fields ...
  featureType: "featured_listing",
  featurePlan: "7_days",
  featureDuration: 7
}
```

**Product Collection:**
```javascript
{
  // ... existing fields ...
  featured: true,
  featuredExpiresAt: ISODate("2025-10-07T10:00:00.000Z"),
  featuredStartedAt: ISODate("2025-09-30T10:00:00.000Z"),
  featuredDuration: 7
}
```

**Settings Collection:**
```javascript
{
  key: "monetization_prices",
  value: { featured_listing: { ... } }
},
{
  key: "monetization_payment_details",
  value: { mtn: {...}, orange: {...}, bank: {...} }
}
```

---

## 🚀 Deployment Checklist

### 1. Environment Variables
Add to `.env.local` or Vercel:
```bash
CRON_SECRET=your-random-secret-string
```

### 2. Initialize Settings
Run once after deployment:
```bash
# This will create default pricing and payment details
curl -X POST https://your-domain.com/api/admin/settings/init
```

### 3. Configure Payment Accounts
1. Login to admin panel
2. Go to Settings → Monetization
3. Enter:
   - MTN number and name
   - Orange number and name
   - Bank account details
4. Save changes

### 4. Enable Monetization
1. In admin panel → Settings → Monetization
2. Toggle "Monetization Enabled" to ON
3. Save

### 5. Setup Cron Job
Choose one option:
- **Vercel:** Add `vercel.json` with cron configuration (see CRON_SETUP.md)
- **External:** Use cron-job.org with hourly schedule
- **Self-hosted:** Use node-cron (see CRON_SETUP.md)

### 6. Test the Flow
1. Create a test listing
2. Try to feature it with test payment
3. Verify admin can see and approve
4. Check product gets featured with expiration
5. Manually trigger cron to test expiration

---

## 📈 Revenue Tracking

Existing revenue endpoint already tracks featured payments:
- `GET /api/admin/revenue/summary`
- Breakdown by payment method (MTN, Orange, Bank)
- Breakdown by feature type
- Date range filtering

---

## 🔮 Future Enhancements (Not Implemented)

These were in the original plan but not implemented:
- ❌ Bump Ad to Top (100 LD per bump)
- ❌ Business Subscriptions (monthly plans)
- ❌ Paid Categories (charge per ad in certain categories)
- ❌ Paid Verified Badge (500 LD for verification)
- ❌ Delivery Commission (2%-5% on delivery)
- ❌ In-App Banner Ads

The current implementation provides a solid foundation to add these features later.

---

## 📝 Testing Guide

### Test User Flow:
```bash
# 1. Get monetization details
curl http://localhost:3000/api/monetization/details

# 2. Submit feature request (requires auth token)
curl -X POST http://localhost:3000/api/manual-payments \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "listing=PRODUCT_ID" \
  -F "featurePlan=7_days" \
  -F "method=MTN" \
  -F "transactionId=TXN123" \
  -F "screenshot=@screenshot.jpg"

# 3. Admin approves (requires admin token)
curl -X PATCH http://localhost:3000/api/admin/manual-payments/PAYMENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"adminNotes": "Verified"}'

# 4. Run cron to test expiration
curl -H "x-cron-secret: YOUR_SECRET" \
  http://localhost:3000/api/cron/unfeature-expired
```

---

## 🎯 Success Metrics

After implementation, you can track:
- Number of feature requests (pending/approved/rejected)
- Revenue by plan (3/7/14 days)
- Revenue by payment method (MTN/Orange/Bank)
- Featured listings conversion rate
- Average feature duration selected

---

## 📞 Support

For issues:
1. Check cron job logs
2. Verify settings are initialized
3. Ensure payment accounts are configured
4. Test with manual API calls

**Key Files:**
- Schema: `models/ManualPayment.ts`, `models/Product.ts`
- User APIs: `app/api/manual-payments/route.ts`, `app/api/monetization/details/route.ts`
- Admin APIs: `app/api/admin/manual-payments/`
- Cron: `app/api/cron/unfeature-expired/route.ts`
- Settings: `app/api/modules/shared/services/settings.service.ts`

---

## ✨ Summary

**What Works:**
✅ Complete manual payment flow for featured listings  
✅ Three pricing tiers (3/7/14 days)  
✅ Auto-calculation of amount from plan  
✅ Admin approval/rejection workflow  
✅ Automatic expiration of featured listings  
✅ User notifications via chat  
✅ Revenue tracking  
✅ Audit logging  
✅ Admin toggle to enable/disable  

**Backend Implementation:** 100% Complete for Featured Listings

The system is production-ready for the featured listings monetization feature!
