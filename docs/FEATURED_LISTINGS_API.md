# Featured Listings API Reference

API documentation for implementing the featured listings feature on the frontend.

---

## 📌 Overview

Users can feature their listings by selecting a pricing plan and submitting a manual payment. Admin verifies and approves, then the listing gets featured for the selected duration.

---

## 🔐 Authentication

All user endpoints require authentication token:
```
Authorization: Bearer <user_token>
```

Admin endpoints require admin token:
```
Authorization: Bearer <admin_token>
```

---

## 📡 User APIs

### 1. Get Monetization Details

Get payment account details and pricing plans.

**Endpoint:** `GET /api/monetization/details`  
**Auth:** None (public)

#### Response (200 OK):
```json
{
  "enabled": true,
  "paymentDetails": {
    "mtn": {
      "number": "0123456789",
      "name": "Admin Name",
      "instructions": "Send payment to the MTN number above..."
    },
    "orange": {
      "number": "0987654321",
      "name": "Admin Name",
      "instructions": "Send payment to the Orange number above..."
    },
    "bank": {
      "accountNumber": "1234567890",
      "accountName": "BuySell Liberia",
      "bankName": "GTBank Liberia",
      "instructions": "Transfer to the bank account above..."
    }
  },
  "plans": {
    "3_days": {
      "price": 150,
      "duration": 3,
      "label": "3 Days",
      "description": "Feature your listing for 3 days"
    },
    "7_days": {
      "price": 300,
      "duration": 7,
      "label": "7 Days",
      "description": "Feature your listing for 1 week"
    },
    "14_days": {
      "price": 500,
      "duration": 14,
      "label": "14 Days",
      "description": "Feature your listing for 2 weeks"
    }
  },
  "currency": "LRD"
}
```

#### Response (Monetization Disabled):
```json
{
  "enabled": false,
  "message": "Monetization features are currently disabled"
}
```

---

### 2. Submit Feature Request

Submit a manual payment request to feature a listing.

**Endpoint:** `POST /api/manual-payments`  
**Auth:** Required (user must own the listing)  
**Content-Type:** `multipart/form-data`

#### Request Body:
```javascript
const formData = new FormData();
formData.append('listing', 'PRODUCT_ID');
formData.append('featurePlan', '7_days'); // or '3_days' or '14_days'
formData.append('method', 'MTN'); // or 'Orange' or 'Bank'
formData.append('transactionId', 'TXN123456789');
formData.append('screenshot', fileInput.files[0]); // Image file
formData.append('userNotes', 'Optional notes'); // Optional
```

#### Field Details:
| Field | Type | Required | Options |
|-------|------|----------|---------|
| `listing` | string | ✅ | Product ID |
| `featurePlan` | string | ✅ | `3_days`, `7_days`, `14_days` |
| `method` | string | ✅ | `MTN`, `Orange`, `Bank` |
| `transactionId` | string | ✅ | Payment transaction ID |
| `screenshot` | file | ✅ | Image file (jpg, png) |
| `userNotes` | string | ❌ | Additional notes |

#### Response (201 Created):
```json
{
  "_id": "670123456789abcdef012345",
  "user": "USER_ID",
  "listing": "PRODUCT_ID",
  "amount": 300,
  "method": "MTN",
  "transactionId": "TXN123456789",
  "screenshot": "/uploads/products/.../screenshot.jpg",
  "status": "pending",
  "featureType": "featured_listing",
  "featurePlan": "7_days",
  "featureDuration": 7,
  "createdAt": "2025-09-30T10:00:00.000Z"
}
```

#### Error Responses:

**400 Bad Request - Missing Fields:**
```json
{
  "error": "All fields (listing, method, transactionId, featurePlan) and screenshot are required."
}
```

**400 Bad Request - Invalid Plan:**
```json
{
  "error": "Invalid feature plan. Must be 3_days, 7_days, or 14_days."
}
```

**403 Forbidden - Monetization Disabled:**
```json
{
  "error": "Monetization features are currently disabled."
}
```

**403 Forbidden - Not Owner:**
```json
{
  "error": "You can only feature your own products."
}
```

**409 Conflict - Duplicate Request:**
```json
{
  "error": "You already have a pending feature request for this product. Please wait for admin response."
}
```

---

## 🔧 Admin APIs

### 3. Get Manual Payments

Get all manual payment requests with filtering.

**Endpoint:** `GET /api/admin/manual-payments`  
**Auth:** Required (admin)

#### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | - | Filter: `pending`, `approved`, `rejected` |

#### Response (200 OK):
```json
{
  "payments": [
    {
      "_id": "670123456789abcdef012345",
      "user": {
        "_id": "USER_ID",
        "fullName": "John Doe",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "listing": {
        "_id": "PRODUCT_ID",
        "title": "iPhone 13 Pro",
        "featured": false
      },
      "amount": 300,
      "method": "MTN",
      "transactionId": "TXN123456789",
      "screenshot": "/uploads/products/.../screenshot.jpg",
      "status": "pending",
      "userNotes": "Paid via MTN",
      "adminNotes": null,
      "featureType": "featured_listing",
      "featurePlan": "7_days",
      "featureDuration": 7,
      "createdAt": "2025-09-30T10:00:00.000Z",
      "reviewedBy": null,
      "reviewedAt": null
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3
}
```

---

### 4. Approve Payment

Approve a payment request and feature the listing.

**Endpoint:** `PATCH /api/admin/manual-payments/:id/approve`  
**Auth:** Required (super_admin only)

#### Request Body (Optional):
```json
{
  "adminNotes": "Payment verified. Featured for 7 days."
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Payment approved and user notified."
}
```

#### What Happens:
1. Payment status → `approved`
2. Product `featured` → `true`
3. Product `featuredExpiresAt` → `now + duration`
4. Product `featuredStartedAt` → `now`
5. User gets chat notification

#### Error Responses:

**400 Bad Request:**
```json
{
  "error": "Payment already processed"
}
```

**404 Not Found:**
```json
{
  "error": "Manual payment not found"
}
```

---

### 5. Reject Payment

Reject a payment request.

**Endpoint:** `PATCH /api/admin/manual-payments/:id/reject`  
**Auth:** Required (super_admin only)

#### Request Body (Optional):
```json
{
  "adminNotes": "Screenshot not clear. Please resubmit."
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Payment rejected and user notified. User can resubmit."
}
```

#### What Happens:
1. Payment status → `rejected`
2. User gets chat notification with reason
3. User can submit a new request

---

## 🤖 Cron Job API

### 6. Auto-Unfeature Expired Listings

Automatically unfeature listings whose featured period has expired.

**Endpoint:** `GET /api/cron/unfeature-expired`  
**Auth:** CRON_SECRET header

#### Request Headers:
```
x-cron-secret: your-secret-string
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Successfully unfeatured 3 expired listings",
  "count": 3,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "iPhone 13 Pro",
      "expiredAt": "2025-09-28T10:00:00.000Z"
    }
  ]
}
```

#### Response (No Expired):
```json
{
  "success": true,
  "message": "No expired featured listings found",
  "count": 0
}
```

---

## 💡 Frontend Implementation Guide

### Step 1: Check if Monetization is Enabled

```typescript
async function checkMonetization() {
  const response = await fetch('/api/monetization/details');
  const data = await response.json();
  
  if (!data.enabled) {
    // Hide feature buttons
    return null;
  }
  
  return data; // { paymentDetails, plans, currency }
}
```

---

### Step 2: Display Feature Button

```tsx
function ProductCard({ product, isOwner }) {
  const [monetization, setMonetization] = useState(null);
  
  useEffect(() => {
    checkMonetization().then(setMonetization);
  }, []);
  
  if (!isOwner || !monetization?.enabled || product.featured) {
    return null; // Don't show button
  }
  
  return (
    <button onClick={openFeatureModal}>
      Feature This Ad
    </button>
  );
}
```

---

### Step 3: Feature Form Modal

```tsx
function FeatureModal({ product, monetization }) {
  const [plan, setPlan] = useState('7_days');
  const [method, setMethod] = useState('MTN');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  
  const selectedPlan = monetization.plans[plan];
  const paymentAccount = monetization.paymentDetails[method.toLowerCase()];
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('listing', product._id);
    formData.append('featurePlan', plan);
    formData.append('method', method);
    formData.append('transactionId', transactionId);
    formData.append('screenshot', screenshot);
    
    const response = await fetch('/api/manual-payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: formData
    });
    
    if (response.ok) {
      alert('Request submitted! Admin will review soon.');
    } else {
      const error = await response.json();
      alert(error.error);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Plan Selection */}
      <select value={plan} onChange={e => setPlan(e.target.value)}>
        {Object.entries(monetization.plans).map(([key, p]) => (
          <option key={key} value={key}>
            {p.label} - {p.price} {monetization.currency}
          </option>
        ))}
      </select>
      
      {/* Payment Method */}
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="MTN">MTN Mobile Money</option>
        <option value="Orange">Orange Money</option>
        <option value="Bank">Bank Transfer</option>
      </select>
      
      {/* Payment Account Display */}
      <div>
        <h3>Send {selectedPlan.price} {monetization.currency} to:</h3>
        {method === 'MTN' && (
          <p>MTN: {paymentAccount.number} ({paymentAccount.name})</p>
        )}
        {method === 'Orange' && (
          <p>Orange: {paymentAccount.number} ({paymentAccount.name})</p>
        )}
        {method === 'Bank' && (
          <div>
            <p>Account: {paymentAccount.accountNumber}</p>
            <p>Name: {paymentAccount.accountName}</p>
            <p>Bank: {paymentAccount.bankName}</p>
          </div>
        )}
        <p className="instructions">{paymentAccount.instructions}</p>
      </div>
      
      {/* Transaction ID */}
      <input
        type="text"
        placeholder="Enter Transaction ID"
        value={transactionId}
        onChange={e => setTransactionId(e.target.value)}
        required
      />
      
      {/* Screenshot */}
      <input
        type="file"
        accept="image/*"
        onChange={e => setScreenshot(e.target.files[0])}
        required
      />
      
      <button type="submit">Submit Request</button>
    </form>
  );
}
```

---

### Step 4: Admin Panel - Manual Payments List

```tsx
function ManualPaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('pending');
  
  async function fetchPayments() {
    const response = await fetch(
      `/api/admin/manual-payments?status=${status}`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    const data = await response.json();
    setPayments(data.payments);
  }
  
  async function approvePayment(id) {
    const notes = prompt('Admin notes (optional):');
    
    await fetch(`/api/admin/manual-payments/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminNotes: notes })
    });
    
    fetchPayments(); // Refresh list
  }
  
  async function rejectPayment(id) {
    const reason = prompt('Rejection reason:');
    
    await fetch(`/api/admin/manual-payments/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminNotes: reason })
    });
    
    fetchPayments(); // Refresh list
  }
  
  return (
    <div>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      
      {payments.map(payment => (
        <div key={payment._id}>
          <h3>{payment.listing.title}</h3>
          <p>User: {payment.user.fullName} ({payment.user.email})</p>
          <p>Plan: {payment.featurePlan} ({payment.featureDuration} days)</p>
          <p>Amount: {payment.amount} LRD</p>
          <p>Method: {payment.method}</p>
          <p>Transaction ID: {payment.transactionId}</p>
          <img src={payment.screenshot} alt="Payment proof" />
          
          {payment.status === 'pending' && (
            <>
              <button onClick={() => approvePayment(payment._id)}>
                Approve
              </button>
              <button onClick={() => rejectPayment(payment._id)}>
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Notes for Frontend

### Important Behaviors:
1. **Prevent Duplicate Requests:** Disable feature button if user already has a pending request
2. **Show Featured Badge:** Display special badge on featured listings
3. **Countdown Timer:** Optionally show time remaining for featured listings
4. **Screenshot Preview:** Allow users to preview screenshot before upload
5. **Validation:** Validate transaction ID format before submission

### Error Handling:
- Show user-friendly error messages
- Handle network errors gracefully
- Retry failed requests with exponential backoff

### UI/UX Tips:
- Show clear pricing comparison (3/7/14 days)
- Highlight best value (7 days most popular)
- Display payment instructions clearly
- Confirm before submission
- Show success message after submission
- Link to admin chat for status updates

---

## 🧪 Testing Checklist

- [ ] Can fetch monetization details
- [ ] Feature button only shows for product owner
- [ ] Feature button hidden if already featured
- [ ] Feature button hidden if pending request exists
- [ ] Can select all three plans
- [ ] Can select all three payment methods
- [ ] Can upload screenshot (jpg, png)
- [ ] Form validates all required fields
- [ ] Success message after submission
- [ ] Admin can see pending requests
- [ ] Admin can approve with notes
- [ ] Admin can reject with reason
- [ ] User receives chat notification
- [ ] Product becomes featured after approval
- [ ] Featured badge displays correctly
- [ ] Featured expires after duration

---

## 🔗 Related Documentation

- [Implementation Summary](./FEATURED_LISTINGS_IMPLEMENTATION.md)
- [Cron Setup Guide](./CRON_SETUP.md)
- Admin Panel Settings Documentation
