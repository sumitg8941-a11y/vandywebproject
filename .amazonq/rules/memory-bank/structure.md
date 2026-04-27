# Project Structure

## Root Layout

```
VandanaProject/
├── server.js              # Express backend — single entry point, all API routes
├── admin.html             # Admin dashboard UI (vanilla HTML/CSS/JS)
├── admin.js               # Admin dashboard client logic
├── data.js                # API client helpers used by admin.js
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
│   └── SiteSettings.js    # Fields: id, gaId, facebookUrl, twitterUrl, instagramUrl, feedbackUrl, siteUrl
│
├── uploads/               # User-uploaded files (PDFs, images) — ephemeral on Railway, use R2
│
├── r2-storage.js          # Cloudflare R2 upload helper (with watermark + local fallback)
├── pdf-watermark.js       # PDF watermark utility
├── migrate-to-r2.js       # One-time migration script
├── r2-cors-config.json    # R2 CORS configuration
├── seed.js                # Database seed script
├── scraper.js             # Data scraper utility
├── download_and_seed.js   # Download and seed utility
├── deploy.js              # SSH deployment script (contains credentials — never commit)
│
├── frontend/              # Next.js 16 frontend (separate process, port 3001)
│   ├── app/               # App Router pages and components
│   ├── public/            # Static assets
│   ├── .env.local         # Frontend env vars
│   ├── next.config.ts     # Next.js config (image domains, rewrites)
│   ├── railway.json       # Railway frontend deployment config
│   └── package.json       # Frontend dependencies
│
├── railway.json           # Railway backend deployment config
├── .env.example           # Documents all required env vars
└── .amazonq/rules/memory-bank/   # Project documentation
```

## Backend Structure (`server.js`)

Single-file Express server. All routes defined inline in this order:

1. Security middleware (helmet, cors, rate-limit)
2. `verifyAdmin` middleware (JWT check — defined early, before routes)
3. MongoDB connection
4. Static file serving (ONLY `/uploads`, `admin.html`, `admin.js`, `data.js`)
5. Model imports
6. Public API routes
7. Admin-protected API routes
8. Upload routes (multer → R2 with local fallback)
9. CRUD routes
10. Error handler + server start

### API Route Groups

| Prefix | Auth | Purpose |
|--------|------|---------|
| `GET /api/health` | None | Health check |
| `GET /api/countries` | None | List countries |
| `GET /api/regions/:countryId` | None | Returns `{ states, directCities }` for mixed hierarchy |
| `GET /api/cities/:countryId` | None | Cities for a country |
| `GET /api/cities/state/:stateId` | None | Cities under a specific state |
| `GET /api/retailers/:cityId` | None | Retailers for a city |
| `GET /api/retailers` | None | All retailers |
| `GET /api/retailer/:id` | None | Single retailer |
| `GET /api/offer/:id` | None | Single offer |
| `GET /api/offers/:retailerId` | None | Offers for retailer (active only) |
| `GET /api/offers` | None | All offers |
| `GET /api/offers/expiring-soon` | None | Offers expiring within 7 days |
| `GET /api/offer-counts` | None | Active offer count per retailer |
| `GET /api/search` | None | Full-text search with filters (supports `?validity=today/week/month`) |
| `GET /api/search/filters` | None | Available filter options |
| `GET /api/breadcrumbs/:type/:id` | None | Breadcrumb hierarchy |
| `GET /api/settings` | None | Public site settings |
| `POST /api/offer/:id/like` | None | Increment likes |
| `POST /api/offer/:id/dislike` | None | Increment dislikes |
| `GET /api/redirect/offer/:id` | None | Tracked outbound redirect with UTM params |
| `POST /api/track/visit` | None | Increment global visit counter |
| `POST /api/track/retailer/:id` | None | Increment retailer click counter |
| `POST /api/track/offer/:id` | None | Increment offer click counter |
| `POST /api/track/offer-stats/:id` | None | Record time spent + max page |
| `GET /api/stats?since=N` | None | Rich stats dashboard (N = days, 0 = all time) |
| `POST /api/admin/login` | None | Returns JWT token |
| `PUT /api/admin/settings` | JWT | Update site settings (gaId, socialUrls, feedbackUrl, siteUrl) |
| `GET /api/admin/feedback?sort=newest\|oldest` | JWT | All feedback submissions |
| `DELETE /api/admin/feedback/:id` | JWT | Delete a feedback entry |
| `POST /api/upload` | JWT | File upload (multer → R2) |
| `POST /api/admin/upload` | JWT | File upload alias |
| `POST /api/countries` | JWT | Create country |
| `PUT /api/admin/countries/:id` | JWT | Update country |
| `DELETE /api/countries/:id` | JWT | Delete country |
| `POST /api/states` | JWT | Create state |
| `PUT /api/admin/states/:id` | JWT | Update state |
| `DELETE /api/states/:id` | JWT | Delete state |
| `POST /api/cities` | JWT | Create city |
| `PUT /api/admin/cities/:id` | JWT | Update city |
| `DELETE /api/cities/:id` | JWT | Delete city |
| `POST /api/retailers` | JWT | Create retailer |
| `PUT /api/admin/retailers/:id` | JWT | Update retailer |
| `DELETE /api/retailers/:id` | JWT | Delete retailer |
| `POST /api/offers` | JWT | Create offer |
| `PUT /api/offers/:id` | JWT | Update offer |
| `PUT /api/admin/offers/:id` | JWT | Update offer (alias) |
| `DELETE /api/offers/:id` | JWT | Delete offer |
| `POST /api/feedback` | None | Submit user feedback |

## Frontend Structure (`frontend/app/`)

Next.js 16 App Router. Server components by default; client components marked `'use client'`.

```
app/
├── layout.tsx             # Root layout — header, footer, GA injection, LangToggle
├── page.tsx               # Homepage — countries, hero mosaic, top retailers, expiring soon, latest offers
├── globals.css            # Tailwind import + smooth scroll
├── robots.ts              # Dynamic robots.txt
├── sitemap.ts             # Dynamic sitemap from live DB
├── SearchBar.tsx          # Hero search form (bg-white input, always readable)
├── Breadcrumbs.tsx        # 'use client' — fetches breadcrumb hierarchy on mount
├── PDFFlipbook.tsx        # 'use client' — PDF viewer with WhatsApp share + Download buttons
├── GeoDetect.tsx          # 'use client' — IP geo-detection banner (ipapi.co)
├── CouponReveal.tsx       # 'use client' — blur/tap-to-reveal coupon codes
├── FollowButton.tsx       # 'use client' — retailer follow (localStorage)
├── MyRetailers.tsx        # 'use client' — followed retailers section on homepage
├── LangToggle.tsx         # 'use client' — EN/AR language toggle (RTL support)
│
├── cities/[countryId]/
│   └── page.tsx           # Shows states section + direct cities simultaneously
│
├── cities/state/[stateId]/
│   └── page.tsx           # Cities under a specific state
│
├── retailers/[cityId]/
│   └── page.tsx           # Retailers for a city with offer counts
│
├── offers/[retailerId]/
│   └── page.tsx           # Active offers for a retailer (CouponReveal, FollowButton)
│
├── view/[offerId]/
│   ├── page.tsx           # SERVER — fetches offer+retailer, JSON-LD
│   └── OfferViewClient.tsx # 'use client' — like/dislike, flipbook, WhatsApp share, retailer website link
│
├── search/
│   ├── page.tsx           # Server wrapper
│   └── SearchClient.tsx   # 'use client' — live search with validity filter (Today/Week/Month)
│
├── feedback/page.tsx      # Client feedback form
├── about/page.tsx
├── contact/page.tsx
├── privacy/page.tsx
└── terms/page.tsx
```

## Data Flow

```
Browser (port 3001 / Railway frontend URL)
    │
    ├── Next.js Server Components ──fetch──► Express API (port 3000 / Railway backend URL)
    │       └── uses API_URL (server-side, private)
    │
    └── Next.js Client Components ──fetch──► Express API
            └── uses NEXT_PUBLIC_API_URL (browser-visible)
                                                    │
                                                    ▼
                                              MongoDB Atlas
                                         (dealnama database)
```

## Environment Variables

### Root `.env`
```
PORT=8080
NODE_ENV=production
MONGO_URI=mongodb+srv://...@cluster0dealnamaa.o9ps2d7.mongodb.net/dealnama
JWT_SECRET=<96-char hex>
ADMIN_USER=admin
ADMIN_PASS=<password>
R2_ACCOUNT_ID=<cloudflare account id>
R2_ACCESS_KEY_ID=<r2 access key>
R2_SECRET_ACCESS_KEY=<r2 secret>
R2_BUCKET_NAME=dealnamaa-offers
R2_PUBLIC_URL=https://pub-45510cdb150f4139b1cb4be3a5cba4e6.r2.dev
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=https://dealnamaa-backend-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://<frontend-railway-url>
API_URL=https://dealnamaa-backend-production.up.railway.app
```

## Key Architectural Decisions

- **`express.static` locked down** — only serves `/uploads`, `admin.html`, `admin.js`, `data.js`.
- **`verifyAdmin` defined before all routes** — avoids hoisting crash.
- **Offer expiry filtering** — all public endpoints filter `validUntil >= today`. Pass `?includeExpired=true` to bypass.
- **Mixed hierarchy** — `/api/regions/:countryId` returns `{ states, directCities }`. Country page shows both simultaneously.
- **R2 storage** — all uploads go to Cloudflare R2. Local `/uploads` fallback for dev.
- **Hero** — split-column layout: solid red gradient left (text + search always readable), 2×2 mosaic right (hidden on mobile).
- **Live Site button** — driven by `siteUrl` in SiteSettings. Set via Admin → Site Settings. Hidden if blank.
- **Stats date range** — `admin._statsSince` state variable, `admin.loadStats(N)` method. Buttons call `loadStats` directly.

## MongoDB Collections

| Collection | Key Fields |
|-----------|-----------|
| `countries` | id, name, image |
| `states` | id, name, countryId, image |
| `cities` | id, name, countryId, stateId?, image |
| `retailers` | id, name, cityId, websiteUrl, image, category, clicks |
| `offers` | id, title, retailerId, validFrom, validUntil, pdfUrl, image, badge, couponCode, couponUrl, isSponsored, externalAdLink, category, clicks, likes, dislikes, totalTimeSeconds, maxPagesViewed |
| `feedbacks` | name, email, message, date |
| `sitestats` | id='global', visits |
| `sitesettings` | id='global', gaId, facebookUrl, twitterUrl, instagramUrl, feedbackUrl, siteUrl |
