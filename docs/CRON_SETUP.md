# Cron Job Setup for Auto-Unfeaturing Expired Listings

This document explains how to set up the automatic unfeaturing of expired featured listings.

## Overview

The system needs to periodically check for featured listings whose `featuredExpiresAt` date has passed and automatically unfeature them.

**Endpoint:** `GET /api/cron/unfeature-expired`

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel Deployment)

1. Create a `vercel.json` file in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/unfeature-expired",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs the job every hour.

2. Add the CRON_SECRET to your environment variables in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `CRON_SECRET=your-random-secret-string`

3. Deploy to Vercel - the cron job will run automatically.

**Schedule Examples:**
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 */6 * * *` - Every 6 hours
- `*/30 * * * *` - Every 30 minutes

---

### Option 2: External Cron Service (e.g., cron-job.org)

1. Go to [cron-job.org](https://cron-job.org) or similar service
2. Create a new cron job:
   - URL: `https://your-domain.com/api/cron/unfeature-expired`
   - Method: GET
   - Headers: `x-cron-secret: your-random-secret-string`
   - Schedule: Every hour (or as needed)

3. Add the CRON_SECRET to your `.env.local`:
```bash
CRON_SECRET=your-random-secret-string
```

---

### Option 3: Node-Cron (Self-Hosted)

1. Install node-cron:
```bash
npm install node-cron
```

2. Create a file `server/cron.js`:

```javascript
const cron = require('node-cron');
const https = require('https');

// Run every hour
cron.schedule('0 * * * *', () => {
  console.log('[CRON] Running unfeature-expired job');
  
  const options = {
    hostname: process.env.APP_URL || 'localhost',
    port: process.env.PORT || 3000,
    path: '/api/cron/unfeature-expired',
    method: 'GET',
    headers: {
      'x-cron-secret': process.env.CRON_SECRET
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('[CRON] Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('[CRON] Error:', error);
  });

  req.end();
});

console.log('[CRON] Job scheduler started');
```

3. Update your `package.json` scripts:
```json
{
  "scripts": {
    "dev": "node server/cron.js & next dev",
    "start": "node server/cron.js & next start"
  }
}
```

---

## Testing the Cron Job

### Manual Trigger (No Auth Required in Dev)

```bash
# In development (no secret required if CRON_SECRET not set)
curl http://localhost:3000/api/cron/unfeature-expired

# In production (with secret)
curl -H "x-cron-secret: your-secret" https://your-domain.com/api/cron/unfeature-expired
```

### Expected Response:

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

---

## Environment Variables

Add to `.env.local` or Vercel Environment Variables:

```bash
# Optional: Protect the cron endpoint
CRON_SECRET=some-random-secret-string-here
```

**How to generate a secure secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use a password generator
```

---

## Monitoring

The cron job logs:
- How many expired listings were found
- How many were unfeatured
- Any errors encountered

**Check logs in:**
- Vercel: Dashboard → Functions → Logs
- Self-hosted: Console output
- External service: Service dashboard

---

## Troubleshooting

### Cron job not running
1. Verify the schedule syntax is correct
2. Check environment variables are set
3. Ensure the endpoint is accessible

### Products not being unfeatured
1. Check if `featuredExpiresAt` is being set correctly when featuring
2. Verify the date comparison logic
3. Check database connection

### Manual test to check expired products:

```javascript
// In MongoDB shell or admin panel
db.products.find({ 
  featured: true, 
  featuredExpiresAt: { $lte: new Date() } 
})
```

---

## Best Practices

1. **Run frequency:** Every hour is recommended (not too frequent, not too slow)
2. **Monitoring:** Set up alerts if the cron job fails
3. **Logging:** Keep logs of unfeatured products for audit trail
4. **Notifications:** Users are notified automatically when their featured period ends
5. **Security:** Always use CRON_SECRET in production

---

## What Happens When a Listing Expires?

1. Cron job finds products where `featuredExpiresAt <= now`
2. Sets `featured = false`
3. Removes `featuredExpiresAt`, `featuredStartedAt`, `featuredDuration`
4. Sends notification to user via chat system
5. Returns summary of actions taken

Users can then resubmit a new payment to feature again.
