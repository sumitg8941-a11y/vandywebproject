# Project Structure

## Root Layout

```
VandanaProject/
├── server.js              # Express backend — single entry point, all API routes
├── admin.html             # Admin dashboard UI (vanilla HTML/CSS/JS)
├── admin.js               # Admin dashboard client logic
├── data.js                # API client helpers + seed data constants (used by admin.js)
├── .env                   # Environment variables (never commit)
├── package.json           # Backend dependencies and scripts
│
├── Mongoose Models (root level, CommonJS)
│   ├── Country.js
│   ├── State.js
│   ├── City.js
│   ├── Retailer.js
│   ├── Offer.js
│   ├── Feedback.js
│   ├── SiteStat.js
│   └── SiteSettings.js
│
├── uploads/               # User-uploaded files (PDFs, images) — served at /uploads/*
│
├── frontend/              # Next.js 16 frontend (separate process, port 3001)
│   ├── app/               # App Router pages and components
│   ├── public/            # Static assets (SVGs only — sitemap/robots are dynamic)
│   ├── .env.local         # Frontend env vars
│   ├── next.config.ts     # Next.js config (image domains, rewrites)
│   └── package.json       # Frontend dependencies
│
├── tmpsrc/                # DEAD CODE — abandoned TypeScript rewrite, never wired in
│
└── .amazonq/rules/memory-bank/   # Project documentation
```

## Backend Structure (`server.js`)

Single-file Express server. All routes are defined inline in this order:

1. Security middleware (helmet, cors, rate-limit)
2. `verifyAdmin` middleware (JWT check — defined early, used by protected routes)
3. MongoDB connection
4. Static file serving (ONLY `/uploads`, `admin.html`, `admin.js`)
5. Model imports
6. Public API routes
7. Admin-protected API routes
8. Upload routes (multer)
9. CRUD routes
10. Error handler + server start

### API Route Groups

| Prefix | Auth | Purpose |
|--------|------|---------|
| `GET /api/health` | None | Health check |
| `GET /api/countries` | None | List countries |
| `GET /api/regions/:countryId` | None | States or cities for a country |
| `GET /api/cities/:countryId` | None | Cities for a country |
| `GET /api/retailers/:cityId` | None | Retailers for a city (supports `?limit=N&sort=clicks`) |
| `GET /api/retailers` | None | All retailers (supports `?limit=N&sort=clicks`) |
| `GET /api/retailer/:id` | None | Single retailer |
| `GET /api/offer/:id` | None | Single offer |
| `GET /api/offers/:retailerId` | None | Offers for retailer (active only, `?includeExpired=true` to bypass) |
| `GET /api/offers` | None | All offers (`?limit=N`, `?includeExpired=true`) |
| `GET /api/offers/expiring-soon` | None | Offers expiring within 7 days |
| `GET /api/offer-counts` | None | Active offer count per retailer (map: `{retailerId: count}`) |
| `GET /api/search` | None | Full-text search with filters |
| `GET /api/search/filters` | None | Available filter options |
| `GET /api/breadcrumbs/:type/:id` | None | Breadcrumb hierarchy (type: city/state/retailer/offer) |
| `GET /api/settings` | None | Public site settings (GA ID, social URLs) |
| `POST /api/offer/:id/like` | None | Increment likes |
| `POST /api/offer/:id/dislike` | None | Increment dislikes |
| `GET /api/redirect/offer/:id` | None | Tracked outbound redirect with UTM params |
| `POST /api/track/visit` | None | Increment global visit counter |
| `POST /api/track/retailer/:id` | None | Increment retailer click counter |
| `POST /api/track/offer/:id` | None | Increment offer click counter |
| `POST /api/track/offer-stats/:id` | None | Record time spent + max page |
| `GET /api/stats` | None | Rich stats dashboard data |
| `POST /api/admin/login` | None | Returns JWT token |
| `PUT /api/admin/settings` | JWT | Update site settings |
| `GET /api/admin/feedback` | JWT | All feedback submissions |
| `POST /api/upload` | JWT | File upload (multer) |
| `POST /api/admin/upload` | JWT | File upload alias |
| `POST /api/countries` | JWT | Create country |
| `POST /api/admin/countries` | JWT | Create country (alias) |
| `PUT /api/admin/countries/:id` | JWT | Update country |
| `DELETE /api/countries/:id` | JWT | Delete country |
| `POST /api/cities` | JWT | Create city |
| `POST /api/admin/cities` | JWT | Create city (alias) |
| `PUT /api/admin/cities/:id` | JWT | Update city |
| `DELETE /api/cities/:id` | JWT | Delete city |
| `POST /api/retailers` | JWT | Create retailer |
| `POST /api/admin/retailers` | JWT | Create retailer (alias) |
| `PUT /api/admin/retailers/:id` | JWT | Update retailer |
| `DELETE /api/retailers/:id` | JWT | Delete retailer |
| `POST /api/offers` | JWT | Create offer |
| `POST /api/admin/offers` | JWT | Create offer (alias) |
| `PUT /api/offers/:id` | JWT | Update offer |
| `PUT /api/admin/offers/:id` | JWT | Update offer (alias) |
| `DELETE /api/offers/:id` | JWT | Delete offer |

## Frontend Structure (`frontend/app/`)

Next.js 16 App Router. All pages are server components by default; client components are explicitly marked `'use client'`.

```
app/
├── layout.tsx             # Root layout — header, footer, GA injection, settings fetch
├── page.tsx               # Homepage — countries, top retailers, expiring soon, latest offers
├── globals.css            # Tailwind import + smooth scroll
├── robots.ts              # Dynamic robots.txt (blocks /admin, /api)
├── sitemap.ts             # Dynamic sitemap from live DB
├── SearchBar.tsx          # Hero search form (server component, native form submit)
├── Breadcrumbs.tsx        # 'use client' — fetches breadcrumb hierarchy on mount
├── PDFFlipbook.tsx        # 'use client' — PDF viewer modal using pdfjs-dist
│
├── cities/[countryId]/
│   └── page.tsx           # Shows states or cities for a country
│
├── retailers/[cityId]/
│   └── page.tsx           # Shows retailers for a city with offer counts
│
├── offers/[retailerId]/
│   └── page.tsx           # Shows all active offers for a retailer
│
├── view/[offerId]/
│   ├── page.tsx           # SERVER component — fetches offer+retailer, renders JSON-LD
│   └── OfferViewClient.tsx # 'use client' — like/dislike, flipbook, WhatsApp share, time tracking
│
├── search/
│   ├── page.tsx           # Server wrapper — exports metadata
│   └── SearchClient.tsx   # 'use client' — live search with filters, URL sync
│
├── about/page.tsx
├── contact/page.tsx
├── privacy/page.tsx
└── terms/page.tsx
```

## Data Flow

```
Browser (port 3001)
    │
    ├── Next.js Server Components ──fetch──► Express API (port 3000)
    │       └── uses API_URL (server-side, private)                │
    │                                                               ▼
    └── Next.js Client Components ──fetch──► Express API (port 3000)
            └── uses NEXT_PUBLIC_API_URL (browser-visible)         │
                                                                    ▼
                                                              MongoDB
                                                         (dealnamaa database)
```

## Environment Variables

### Root `.env`
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dealnama
JWT_SECRET=<96-char hex>
ADMIN_USER=admin
ADMIN_PASS=<password>
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3000   # browser-visible, used in client components
NEXT_PUBLIC_SITE_URL=http://localhost:3001  # used for OG tags and share URLs
API_URL=http://127.0.0.1:3000              # server-side only, not in browser bundle
```

## Key Architectural Decisions

- **`express.static` is locked down** — only serves `/uploads`, `admin.html`, `admin.js`. The project root is NOT served (prevents `.env` exposure).
- **`verifyAdmin` is defined before all routes** — avoids `const` hoisting crash.
- **Offer expiry filtering** — all public endpoints filter `validUntil >= today` by default. Pass `?includeExpired=true` to bypass (admin use only).
- **Server components use `API_URL`** (private), client components use `NEXT_PUBLIC_API_URL` — internal URL not leaked to browser bundle.
- **Offer view page is split** — `page.tsx` (server) handles SEO/metadata/JSON-LD, `OfferViewClient.tsx` (client) handles interactivity.
- **`tmpsrc/`** is dead code — an abandoned TypeScript rewrite. Safe to delete. Never imported anywhere.
- **Next.js rewrites** proxy `/uploads/*` from port 3001 to port 3000 so images work in both dev and prod.

## MongoDB Collections

| Collection | Key Fields |
|-----------|-----------|
| `countries` | id, name, image |
| `states` | id, name, countryId, image |
| `cities` | id, name, countryId, stateId?, image |
| `retailers` | id, name, cityId, websiteUrl, image, category, clicks, totalTimeSeconds |
| `offers` | id, title, retailerId, validFrom, validUntil, pdfUrl, image, badge, isSponsored, externalAdLink, category, couponCode, couponUrl, clicks, likes, dislikes, totalTimeSeconds, maxPagesViewed |
| `feedbacks` | name, email, message, date |
| `sitestats` | id='global', visits |
| `sitesettings` | id='global', gaId, facebookUrl, twitterUrl, instagramUrl, feedbackUrl |
