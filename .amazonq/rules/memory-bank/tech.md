# Technology Stack

## Overview

Two separate processes, both must be running for the site to work:

| Process | Runtime | Port | Start Command |
|---------|---------|------|---------------|
| Backend API | Node.js + Express | 3000 | `npm start` or `npm run dev` |
| Frontend | Next.js 16 | 3001 | `cd frontend && npm run dev` |
| Admin Panel | Served by backend | 3000 | (no separate start needed) |
| Database | MongoDB | 27017 | `mongod` |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | ^5.2.1 | HTTP server and routing |
| Mongoose | ^9.4.1 | MongoDB ODM |
| MongoDB | ^7.1.1 | Database driver |
| jsonwebtoken | ^9.0.3 | JWT auth for admin |
| multer | ^2.1.1 | File upload handling |
| helmet | ^8.1.0 | HTTP security headers |
| cors | ^2.8.6 | Cross-origin requests |
| express-rate-limit | ^8.3.2 | Rate limiting (1000 req/15min per IP) |
| dotenv | ^17.4.2 | Environment variable loading |
| nodemon | ^3.1.14 | Dev auto-restart |

**Module system**: CommonJS (`"type": "commonjs"` in package.json)

**Scripts**:
```bash
npm start        # node server.js
npm run dev      # nodemon server.js (auto-restart on file changes)
```

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| pdfjs-dist | ^5.6.205 | PDF rendering in flipbook |
| react-pdf | ^10.4.1 | React wrapper for pdfjs |
| Inter (Google Fonts) | — | Typography (admin panel) |
| Poppins (Google Fonts) | — | Typography (frontend) |
| Font Awesome | 6.4.0 | Icons (CDN, both frontend and admin) |

**Scripts**:
```bash
cd frontend
npm run dev      # next dev -p 3001
npm run build    # next build
npm start        # next start -p 3001
npm run lint     # eslint
```

## Admin Panel

Pure vanilla stack — no build step, no framework:
- HTML5 + inline CSS design system (CSS custom properties)
- Vanilla JavaScript (ES2020+, async/await)
- Font Awesome 6.4 (CDN)
- Inter font (Google Fonts CDN)
- Fetch API for all backend communication
- JWT stored in `localStorage`

## Database

- **MongoDB** (local instance at `mongodb://127.0.0.1:27017/dealnama`)
- **Mongoose** schemas with `{ timestamps: true }` on all models
- All `id` fields are custom strings (lowercase, alphanumeric, hyphens) — NOT MongoDB ObjectIds
- Indexes: unique on `id` field for all models

## File Storage

- Uploaded files saved to `/uploads/` directory in project root
- Naming: `{timestamp}-{random9digits}.{ext}`
- Served at `/uploads/*` via Express static middleware
- Frontend proxies `/uploads/*` to backend via Next.js rewrites (so images work on port 3001)

## SEO Infrastructure

- `frontend/app/sitemap.ts` — dynamic Next.js sitemap, fetches all entities from DB
- `frontend/app/robots.ts` — dynamic robots.txt, blocks `/admin` and `/api/`
- JSON-LD structured data on offer view pages (rendered server-side)
- `generateMetadata` on all dynamic pages
- Open Graph tags on all pages

## Security

- `helmet` — sets secure HTTP headers
- `express-rate-limit` — 1000 requests per 15 minutes per IP on all `/api` routes
- `verifyAdmin` middleware — JWT verification, defined at top of server.js before all routes
- `validateId()` helper — regex validates all URL params: `/^[a-z0-9_-]+$/`, max 50 chars
- `express.static` restricted to only `/uploads`, `admin.html`, `admin.js` — project root NOT served
- JWT expires after 12 hours
- Admin credentials in `.env` only — never hardcoded (fallback values exist but should be overridden)

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Two terminal windows

### Terminal 1 — Backend
```bash
cd VandanaProject
npm install
# ensure .env exists with MONGO_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS
npm run dev
# Server: http://localhost:3000
# Admin:  http://localhost:3000/admin.html
```

### Terminal 2 — Frontend
```bash
cd VandanaProject/frontend
npm install
# ensure .env.local exists
npm run dev
# Frontend: http://localhost:3001
```

### Seed Database (optional)
```bash
node seed.js
```

## Next.js Configuration (`next.config.ts`)

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },           // any HTTPS image
    { protocol: 'http', hostname: '127.0.0.1', port: '3000' },
    { protocol: 'http', hostname: 'localhost', port: '3000' },
  ],
  formats: ['image/avif', 'image/webp'],
}
rewrites: [
  { source: '/uploads/:path*', destination: 'http://127.0.0.1:3000/uploads/:path*' }
]
```

## TypeScript Configuration

- `strict: true` in `tsconfig.json`
- Path alias: `@/*` → `./src/*` (not actively used — app dir is used directly)
- Target: ES2017, module: ESNext

## Key Dependency Notes

- `@next/third-parties` is installed but NOT used — GA is injected via `next/script` with dynamic ID from DB
- `tmpsrc/` contains TypeScript source with its own types — this is dead code, never compiled or run
- `ssh2` in backend dependencies — used by `deploy.js` for remote deployment
