<!--
Guidance for AI coding assistants working on the BuySell Liberia repo.
Keep this short and specific: architecture, developer workflows, integration points,
common patterns and examples that are discoverable from the codebase.
-->

# Copilot instructions — BuySell Liberia

This file captures the minimal, actionable knowledge an AI assistant needs to be productive in this repository.

1. Big picture

- Stack: Next.js (app directory, React 18) for frontend + an Express + Socket.IO server (in `server/index.js`) for realtime features. MongoDB via Mongoose for persistence (`lib/mongoose.ts`). Firebase is used for optional auth/storage helpers (`lib/firebase.ts`).
- Responsibilities:
  - Next.js (port 3000) serves the UI and serverless API routes under `app/api/**`.
  - `server/index.js` runs a separate Express + socket.io server (port 3001); used for presence, broadcast announcements, and real-time messaging.
  - Shared services and business logic live under `app/api/modules/**` and `lib/` (e.g. BaseService in `app/api/modules/shared/services`).

2. Key developer workflows (commands)

- Install and run frontend dev: `npm install` then `npm run dev` (Next.js on 3000).
- Run socket server separately: `npm run dev:socket` (Express + Socket.IO on 3001).
- Start both together (recommended for local dev): `npm run dev:all` (starts Next then socket server).
- Build for production: `npm run build` and `npm run start`.
- Seed categories (example seeder): `npm run seed:categories`.
- Lint: `npm run lint`.

3. Environment and config notes

- Environment variables used by code:
  - `MONGODB_URI` or default to `mongodb://localhost:27017/buysell` (see `lib/mongoose.ts`).
  - Firebase variables prefixed with `NEXT_PUBLIC_FIREBASE_*` (see `lib/firebase.ts`).
  - Next.js config for remote images is in `next.config.mjs` and uses `localhost` in dev and `buysellliberia.com` in prod.
- For realtime features, the frontend expects the socket server at `http://localhost:3001` by default.

4. Auth & session patterns

- Client-side auth uses JWT stored in localStorage: `accessToken` and `refreshToken`. Helpers live in `lib/jwt.ts` (decode/isTokenValid/getLocalAuthStatus/clearAllAuthData).
- UI-wide auth state is provided by `components/auth-provider.tsx` which relies on `app/services/Auth.Service` client wrappers. The provider does a fast JWT-derived UI state and then fetches full profile in background.
- On logout, `clearAllAuthData()` dispatches a `auth:logout` window event; consumers use `hooks/use-auth-logout.ts` to reset state.

5. Patterns and conventions

- Files under `app/api/modules/*/services` follow a BaseService pattern; prefer extending BaseService for CRUD and pagination (see `app/api/modules/shared/services/README.md`).
- Server-side code (Express/socket) uses CommonJS (`require/module.exports` in `server/index.js`) while most app code is ESM/TSX — be mindful when importing/exporting between server and app code.
- Components in `components/` are client, often using "use client" at top. The root layout wraps the tree with `ThemeProvider` and `AuthProvider` (`app/layout.tsx`).
- Storage uploads use `lib/multer.ts`, `lib/firebase.ts`, or `lib/local-file-upload.ts` depending on environment.

6. Integration points to watch

- Socket.io events: `user:online`, `presence:subscribe`, `message`, `announcement:broadcast`, `announcement:new`, `presence:update` (see `server/index.js`). Any client code interacting with these should handle reconnects and absent auth.
- Swagger is mounted on the socket server at `/api-docs` and collects API docs from `./app/api/**/*.ts`.
- Many backend services rely on Mongoose models in `models/` — when changing model shapes, update service usages and API surfaces.

7. Useful code examples (copyable snippets)

- Fast client-side auth check (uses `lib/jwt.ts`):
  - getLocalAuthStatus() -> { isLoggedIn, payload, source }
- Emit a server announcement from Node code:
  - require the helper: `const { emitAnnouncement } = require('../../server/index.js')` then `emitAnnouncement({ title: 'x', body: 'y' })`.

8. What NOT to change lightly

- The `server/index.js` socket server protocol (event names and payload shapes) — breaking changes require frontend coordination.
- JWT client helpers and logout event name (`auth:logout`) — many UI components rely on these.

9. Where tests and CI would go

- There are no tests in the repo root. If adding tests, follow Next.js + Jest/Testing Library patterns and keep fast unit tests for services and small integration tests for API routes.

10. When you need more info from maintainers

- Exact production hostnames and CORS allowances for the socket server.
- Firebase project credentials and whether the Firebase emulator is used in local dev.

If anything above is ambiguous or you want this trimmed/expanded (e.g., include more code samples), tell me which sections to iterate on.
