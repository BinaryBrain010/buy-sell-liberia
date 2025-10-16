# Monetization, Bumps, Featured, and Verification — plans-integration

This document summarizes the end-to-end changes implemented on the `plans-integration` branch to unify monetization plan consumption, add UI flows for buying/using bumps and featuring listings, and introduce account verification requests.

## Overview

- Unified monetization surfaces are used throughout the UI:
  - Plans: `GET /api/monetization/plans`
  - Payment details: `GET /api/monetization/details`
  - Manual payment submission: `POST /api/monetization/manual-payment`
  - List my manual payments: `GET /api/monetization/manual-payment?page=1&limit=20&status=pending&featureType=bump_listing`
- Listing bump is executed server-side:
  - `GET /api/products/{id}/bump` (consumes a bump credit and bumps listing)
- New dashboard tab: Monetization, with quick access to buy/use bumps and feature listings.
- Profile tab now includes an “Apply for Verification” flow.

## What changed (high level)

- Aligned UI to the unified monetization API
  - Bump plans are now fetched from `GET /api/monetization/plans` under `plans.bump_listing` rather than a legacy endpoint.
  - The same endpoint exposes `plans.featured_listing` and optionally `plans.account_verification`, `plans.banner_ad`, and `plans.paid_category_listing` when configured.
- Bump flow
  - Users can buy bump credits via the Bump Payment modal, which posts to `POST /api/monetization/manual-payment` with `featureType: "bump_listing"`.
  - Users can spend a bump credit by selecting a listing and triggering `GET /api/products/{id}/bump`.
- Featured flow
  - New featured modal pair: plan picker and payment submission.
  - Users can feature a listing by choosing a featured plan and submitting a manual payment with transaction details and screenshot.
- Monetization Dashboard Tab
  - A single place to pick a listing, see summarized bump/featured plans, view payment details, and open the buy flows.
- Account Verification
  - A new modal in the Profile tab allows users to apply for verification if `account_verification` plans are present.

## UI components added/updated

Added

- `components/dashboard/FeaturedPlansModal.tsx`
  - Displays `featured_listing` plans from `GET /api/monetization/plans` and opens the payment modal.
- `components/dashboard/FeaturedPaymentModal.tsx`
  - Submits a manual payment for featured listings to `POST /api/monetization/manual-payment` with `featureType: "featured_listing"`.
- `components/dashboard/MonetizationTab.tsx`
  - Listing selector, quick actions (Buy Bumps, Feature Listing), plan summaries, and payment details overview.
- `components/dashboard/AccountVerificationModal.tsx`
  - Shows `account_verification` plans (if configured), payment methods, and posts `featureType: "account_verification"` to the unified manual payment endpoint.

Updated

- `components/dashboard/BumpPlansModal.tsx`
  - Now reads from `GET /api/monetization/plans`; maps `plans.bump_listing` with unified currency.
- `components/dashboard/BumpModal.tsx`
  - Passes the selected `productId` into the bump purchase flow so manual payments can be tied to a specific listing.
- `components/dashboard/userListings.tsx`
  - “Confirm Bump” calls `GET /api/products/{id}/bump` and decrements local bump count on success.
  - Adds wiring to open the Featured flow.
- `app/dashboard/page.tsx`
  - Adds a “Monetization” tab and renders `MonetizationTab` component.
- `components/dashboard/profileForm.tsx`
  - Adds an “Apply for Verification” button and integrates the `AccountVerificationModal`.

## Backend/API references

- `app/api/monetization/plans/route.ts`
  - Unified response with plan groups and `currency` from settings.
- `app/api/monetization/details/route.ts`
  - Payment destinations (MTN/Orange/Bank) for users to pay to.
- `app/api/monetization/manual-payment/route.ts`
  - Accepts unified manual payment requests for multiple `featureType`s: `featured_listing`, `bump_listing`, `account_verification`, etc.
  - Also supports `GET` for the authenticated user's submissions (pagination + filters: `status`, `featureType`).
  - Admins can list all submissions via `GET /api/admin/manual-payments`.
- `app/api/products/[id]/[action]/route.ts`
  - `GET /api/products/{id}/bump` executes the bump using available credits.

## Data and settings

- Prices and flags come from `SettingsService`:
  - `monetizationPrices.bump_listing` → credits per plan + price
  - `monetizationPrices.featured_listing` → duration per plan + price
  - Optional: `monetizationPrices.account_verification`, `banner_ad`, `paid_category_listing`
  - Currency is taken from `settings.platformCurrency` and exposed on the unified plans route.
- Payment details (`mtn`, `orange`, `bank`) are populated in settings and exposed by `GET /api/monetization/details`.

## How to use (quick functional walkthrough)

- Buying bumps
  - Open the Bump flow from Listings (or Monetization tab) → Choose a plan → Submit a manual payment with method, transaction ID, and screenshot.
  - After admin approves the payment, your product receives bump credits.
- Using a bump credit
  - Open “Bump” → select a listing → Confirm → client calls `GET /api/products/{id}/bump` and updates bump count on success.
- Featuring a listing
  - Open “Feature” → choose featured plan → submit manual payment with evidence.
- Account verification
  - Profile tab → “Apply for Verification” → choose plan → submit manual payment.

## Notes and caveats

- Currency
  - The UI uses `currency` from `GET /api/monetization/plans` for plan displays. Ensure `settings.platformCurrency` is set correctly.
  - If `GET /api/monetization/details` emits a different currency in any text, align it with platform currency (optional small refactor).
- Admin approvals
  - Manual payments land in the admin queue. Approval flows should grant bump credits or activate featured status accordingly.
  - For account verification, confirm the admin approval handler updates the user's verification status, mirroring the pattern for bump/featured when applicable.
- Feature toggles
  - The unified code respects toggles (e.g., monetizationEnabled). If features are disabled in settings, the UI will show limited or no plans.

## Acceptance checkpoints

- Plans load from `GET /api/monetization/plans` and display accurate label/price/credits/duration.
- Payment details load from `GET /api/monetization/details`.
- Manual payment submissions hit `POST /api/monetization/manual-payment` with correct payload:
  - Bump: `{ featureType: 'bump_listing', listing, plan, method, transactionId, screenshot }`
  - Featured: `{ featureType: 'featured_listing', listing, plan, method, transactionId, screenshot }`
  - Verification: `{ featureType: 'account_verification', plan, method, transactionId, screenshot }`
- Bumping a listing calls `GET /api/products/{id}/bump` and updates local state on success.
- Monetization tab is visible and functional.
- Profile tab shows “Apply for Verification” and submits successfully.

## Developer runbook (quick)

- Local dev
  - Frontend: `npm run dev` (Next.js on 3000)
  - Socket server: `npm run dev:socket` (Express + Socket.IO on 3001)
  - Start both: `npm run dev:all`
- Settings
  - Configure prices and payment details with the admin settings endpoints or directly in the DB via `SettingsService` keys.

## Quality gates (from this integration session)

- Typecheck on edited files: PASS
- Build/Lint: not executed in this session
- Tests: n/a (no tests present); consider adding small unit tests for new components and API route contracts

## Next steps

- Currency alignment: emit platformCurrency consistently from `GET /api/monetization/details` (if currently inconsistent).
- Toast UX: replace alert() with your toast system for consistent feedback.
- Admin approval: confirm `account_verification` approval flow marks the user as verified; add if missing.
- Tests: add UI unit tests for modals and service integration, and API route contracts.
