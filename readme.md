# BuySell Liberia

A modern marketplace for buying and selling in Liberia, built with Next.js (App Router), an Express + Socket.IO realtime server, and MongoDB via Mongoose.

## Overview

- Frontend/API: Next.js 14 (app directory) on port 3000
- Realtime server: Express + Socket.IO on port 3001 (`server/index.js`)
- Database: MongoDB (local or Atlas) via Mongoose (`lib/mongoose.ts`)
- Storage helpers: Local uploads under `/uploads` with a Next.js file-serving route at `/uploads/*`, optional Firebase helpers

Key features:

- Listings with categories, pagination, featured listings, and product detail views
- Client-side auth via JWT stored locally with fast UI state and background profile fetching
- Realtime presence, announcements, and messaging through Socket.IO
- Monetization plans (including banner ads), subscription/featured/bump flows
- Admin tools for banner images with auto-expiry and cleanup

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
git clone https://github.com/BinaryBrain010/buy-sell-liberia.git
cd buy-sell-liberia
npm install
```

### Environment variables

Create a `.env` in the project root and set at least:

```env
MONGODB_URI=mongodb://localhost:27017/buysell
# Optional: Firebase client vars if you use Firebase storage
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional: protect cron cleanup endpoint
CRON_SECRET=your-strong-random-secret
```

### Run (development)

- Frontend/API only:

```bash
npm run dev
```

- Socket server only:

```bash
npm run dev:socket
```

- Both together:

```bash
npm run dev:all
```

Visit http://localhost:3000 (Next.js) and the socket server at http://localhost:3001.

### Build and start (production)

```bash
npm run build
npm run start
```

## Seeding data

Categories and other seeds are provided.

- Seed categories (TS/JS variants available):

```bash
node seeders/categories-seeder.js
# or
node scripts/seed-categories.js
```

- Verify categories:

```bash
node scripts/check-categories.js
```

## Notable APIs and routes

- Monetization plans (used by marketing page):

  - GET `/api/monetization/plans` → returns currency, enabled flags, and plans including `plans.banner_ad`

- Banner image management (admin upload, public list):

  - GET `/api/admin/banner-ad` → public; returns minimal array of `{ id, imageUrl }`
  - POST `/api/admin/banner-ad` → admin; upload images (supports `days` to auto-expire)
  - DELETE `/api/admin/banner-ad` → admin; remove by `id` or `ids[]`

- Static uploads (serving files):

  - GET `/uploads/*` → serves files from the local `uploads/` folder with correct content type and caching

- Cron cleanup for expired banner ads:
  - GET/POST `/api/cron/cleanup-banner-ads` → deletes expired banners and local files
  - Set `CRON_SECRET` and include `x-cron-secret` header if you want to protect the endpoint
  - See `docs/CRON_SETUP.md`

## Frontend highlights

- Featured Listings carousel (Embla-based)

  - Responsive slidesToScroll (1 mobile, 2–4 larger screens)
  - Mobile swipe fixes to prevent accidental taps during drag
  - Optional arrows on larger screens

- Hero banner strip
  - Auto-rotating banner images (320×100 on mobile; full width with auto height on larger screens)
  - Falls back gracefully when no banner images are available

## Scripts

- `npm run dev` → Next.js dev server
- `npm run dev:socket` → Socket.IO server
- `npm run dev:all` → Start both
- `npm run build` → Build Next.js
- `npm run start` → Start Next.js production server
- `npm run lint` → ESLint
- Seeders and utility scripts: see `seeders/` and `scripts/`

## Project structure

```
app/                # Next.js app router (routes, pages, API)
components/         # UI and feature components
docs/               # Feature- and API-level documentation
hooks/              # React hooks
lib/                # Shared libraries (db, storage, socket helpers, jwt)
models/             # Mongoose models
public/             # Static assets
scripts/            # Dev and data scripts
seeders/            # Seed data scripts
server/             # Express + Socket.IO server
test/               # Tests (if added)
```

## Additional docs

- Featured listings: `docs/FEATURED_LISTINGS_API.md`, `docs/FEATURED_LISTINGS_IMPLEMENTATION.md`
- Revenue/Monetization: `docs/REVENUE_API.md`, `docs/SUBSCRIPTION_API.md`, `docs/MONETIZATION_INTEGRATION_README.md`
- Verification workflow: `docs/VERIFICATION_WORKFLOW.md`
- Cron setup: `docs/CRON_SETUP.md`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

## License

MIT

## Support

- Open an issue in this repository
- Email: info@buysellliberia.com

—

BuySell Liberia — Connecting buyers and sellers across Liberia 🇱🇷
