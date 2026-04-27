# Project Structure

## Root Layout

```
VandanaProject/
├── server.js              # Express backend — single entry point, all API routes
├── admin.html             # Admin dashboard UI (vanilla HTML/CSS)
├── admin.js               # Admin dashboard client logic
├── data.js                # API client helpers used by admin.js
├── .env                   # Environment variables (never commit)
├── package.json           # Backend dependencies and scripts
│
├── Mongoose Models (root level, CommonJS)
│   ├── Country.js         # id, name, image, visits, offerViews
│   ├── State.js           # id, name, countryId, image
│   ├── City.js            # id, name, countryId, stateId?, image, visits, offerViews
│   ├── Retailer.js        # id, name, cityId, websiteUrl, image, category, clicks, totalTimeSeconds
│   ├── Offer.js           # id, title, retailerId, validFrom, validUntil, pdfUrl, image, badge,
│   │                      #   couponCode, couponUrl, isSponsored, externalAdLink, category,
│   │                      #   clicks, likes, dislikes, totalTimeSeconds, maxPagesViewed
│   ├── Feedback.js        # name, email, message, date
│   ├── SiteStat.js        # id='global', visits
│   └── SiteSettings.js    # id='global', gaId, facebookUrl, twitterUrl, instagramUrl,
│                          #   feedbackUrl, siteUrl
│
├── uploads/               # Local upload fallback (ephemeral on Railway — use R2 in prod)
├── r2-storage.js          # Cloudflare R2 upload helper (watermark + local fallback)
├── pdf-watermark.js       # PDF watermark utility
├── migrate-to-r2.js       # One-time migration script
├── r2-cors-config.json    # R2 CORS configuration
├── seed.js                # Database seed script
├── deploy.js              # SSH deployment script — NEVER COMMIT (hardcoded credentials)
│
├── frontend/              # Next.js 16 frontend (separate process, port 3001)
│   ├── app/               # App Router pages and components
│   ├── public/            # Static assets
│   ├── .env.local         # Frontend env vars (never commit)
│   ├── next.config.ts     # Next.js config (image domains, rewrites)
│   ├── railway.json       # Railway frontend deployment config
│   └── package.json       # Frontend dependencies
│
├── railway.json           # Railway backend deployment config
├── .env.example           # Documents all required env vars
└── .amazonq/rules/memory-bank/   # Project documentation
```

## Backend Structure (`server.js`)

Single-file Express server (~1250 lines). All routes defined inline in this order:

1. Security middleware (helmet, cors, rate-limit — general + tracking-specific)
2. `verifyAdmin` middleware (JWT check — defined early, before routes)
3. MongoDB connection
4. Static file serving (ONLY `/uploads`, `admin.html`, `admin.js`, `data.js`)
5. Model imports
6. Public API routes
7. Tracking routes
8. Admin-protected API routes
9. Upload routes (multer → R2 with local fallback)
10. CRUD routes
11. Server start

### API Route Reference

| Method + Path | Auth | Purpose |
|--------------|------|---------|
| `GET /api/health` | None | Health check |
| `GET /api/countries` | None | List all countries |
| `GET /api/regions/:countryId` | None | `{ states, directCities }` for mixed hierarchy |
| `GET /api/cities` | None | All cities |
| `GET /api/cities/:countryId` | None | Cities for a country |
| `GET /api/cities/state/:stateId` | None | Cities under a specific state |
| `GET /api/states` | None | All states |
| `GET /api/retailers` | None | All retailers |
| `GET /api/retailers/:cityId` | None | Retailers for a city |
| `GET /api/retailer/:id` | None | Single retailer |
| `GET /api/offers` | None | All active offers (`?includeExpired=true` to bypass) |
| `GET /api/offers/:retailerId` | None | Active offers for a retailer |
| `GET /api/offers/expiring-soon` | None | Offers expiring within 7 days |
| `GET /api/offer/:id` | None | Single offer |
| `GET /api/offer-counts` | None | Active offer count per retailer `{ retailerId: count }` |
| `GET /api/search` | None | Full-text search (`?q=&category=&cityId=&retailerId=&validity=today/week/month`) |
| `GET /api/search/filters` | None | Available filter options |
| `GET /api/breadcrumbs/:type/:id` | None | Breadcrumb hierarchy |
| `GET /api/settings` | None | Public site settings |
| `GET /api/stats` | None | Analytics dashboard (`?since=N` or `?from=YYYY-MM-DD&to=YYYY-MM-DD`) |
| `GET /api/redirect/offer/:id` | None | Tracked outbound redirect with UTM params |
| `POST /api/offer/:id/like` | None | Increment likes |
| `POST /api/offer/:id/dislike` | None | Increment dislikes |
| `POST /api/track/visit` | None | Increment global visit counter |
| `POST /api/track/country/:id` | None | Increment country visits |
| `POST /api/track/city/:id` | None | Increment city visits |
| `POST /api/track/retailer/:id` | None | Increment retailer clicks |
| `POST /api/track/offer/:id` | None | Increment offer clicks |
| `POST /api/track/offer-stats/:id` | None | Record `{ duration, maxPage }` |
| `POST /api/feedback` | None | Submit user feedback |
| `POST /api/admin/login` | None | Returns JWT token |
| `GET /api/admin/feedback` | JWT | All feedback (`?sort=newest\|oldest`) |
| `DELETE /api/admin/feedback/:id` | JWT | Delete a feedback entry |
| `PUT /api/admin/settings` | JWT | Update site settings |
| `POST /api/upload` | JWT | File upload (multer → R2) |
| `POST /api/admin/upload` | JWT | File upload alias |
| `POST /api/admin/countries` | JWT | Create country |
| `PUT /api/admin/countries/:id` | JWT | Update country |
| `DELETE /api/countries/:id` | JWT | Delete country |
| `POST /api/states` | JWT | Create state |
| `PUT /api/admin/states/:id` | JWT | Update state |
| `DELETE /api/states/:id` | JWT | Delete state |
| `POST /api/admin/cities` | JWT | Create city |
| `PUT /api/admin/cities/:id` | JWT | Update city |
| `DELETE /api/admin/cities/:id` | JWT | Delete city |
| `POST /api/admin/retailers` | JWT | Create retailer |
| `PUT /api/admin/retailers/:id` | JWT | Update retailer |
| `DELETE /api/admin/retailers/:id` | JWT | Delete retailer |
| `POST /api/admin/offers` | JWT | Create offer |
| `PUT /api/admin/offers/:id` | JWT | Update offer |
| `DELETE /api/admin/offers/:id` | JWT | Delete offer |

### Stats Route Date Filtering

```js
// Three modes — all mutually exclusive:
?since=7          // last 7 days
?since=30         // last 30 days
                  // no params = all time
?from=2025-01-01&to=2025-01-31  // custom range
```

## Frontend Structure (`frontend/app/`)

Next.js 16 App Router. Server components by default; client components marked `'use client'`.

```
app/
├── layout.tsx             # Root layout — header, footer, GA injection, LangProvider, Tracker(visit)
├── page.tsx               # Homepage server component — fetches data, passes to HomeHero + GeoDetect
├── globals.css            # Tailwind import + smooth scroll
├── robots.ts              # Dynamic robots.txt — blocks /admin and /api/
├── sitemap.ts             # Dynamic sitemap from live DB
│
├── HomeHero.tsx           # 'use client' — full homepage UI, reads useLang() for all strings
├── SearchBar.tsx          # Hero search form (server-renderable, no state)
├── Breadcrumbs.tsx        # 'use client' — fetches /api/breadcrumbs/:type/:id on mount
├── PDFFlipbook.tsx        # 'use client' — PDF viewer (pdfjs), WhatsApp share + Download
├── GeoDetect.tsx          # 'use client' — ipapi.co geo banner, sessionStorage dismiss
├── CouponReveal.tsx       # 'use client' — blur/tap-to-reveal coupon codes
├── FollowButton.tsx       # 'use client' — retailer follow/unfollow (localStorage)
├── MyRetailers.tsx        # 'use client' — followed retailers section on homepage
├── LangToggle.tsx         # Exports: LangProvider (Context), useLang() hook, default LangToggle
│                          #   Single source of truth for ALL EN/AR translations
├── NavLinks.tsx           # 'use client' — desktop + mobile nav, reads useLang()
├── FindDealsButton.tsx    # 'use client' — hero CTA button, reads useLang()
├── Tracker.tsx            # 'use client' — fire-and-forget analytics, sessionStorage dedup
│                          #   Props: type ('visit'|'country'|'city'|'retailer'|'offer'), id?
└── SafeImage.tsx          # 'use client' — next/image wrapper with onError fallback to SVG placeholder
│
├── cities/[countryId]/
│   └── page.tsx           # Unified grid: states (red "Region" pill) + direct cities (orange "City" pill)
│                          # Fires <Tracker type="country" id={countryId} />
│
├── cities/state/[stateId]/
│   └── page.tsx           # Cities under a specific state
│
├── retailers/[cityId]/
│   └── page.tsx           # Retailers grid for a city
│                          # Fires <Tracker type="city" id={cityId} />
│
├── offers/[retailerId]/
│   └── page.tsx           # Active offers grid for a retailer (CouponReveal, FollowButton)
│                          # Fires <Tracker type="retailer" id={retailerId} />
│
├── view/[offerId]/
│   ├── page.tsx           # SERVER — fetches offer+retailer, JSON-LD structured data
│   └── OfferViewClient.tsx # 'use client' — like/dislike, flipbook, WhatsApp share,
│                           #   retailer website link, offer click tracking on mount,
│                           #   offer-stats tracking on unmount (keepalive: true)
│
├── search/
│   ├── page.tsx           # Server wrapper (Suspense boundary)
│   └── SearchClient.tsx   # 'use client' — live search, debounced 300ms, URL-synced filters
│
├── feedback/page.tsx      # Client feedback form → POST /api/feedback
├── about/page.tsx
├── contact/page.tsx
├── privacy/page.tsx
└── terms/page.tsx
```

## Language System

`LangToggle.tsx` is the single source of truth for all translations:
- Exports `LangProvider` — wraps entire `<body>` in `layout.tsx`
- Exports `useLang()` hook — returns `{ lang, setLang, t }` where `t` is the translation object
- Type `T = Record<string, string>` to avoid TS literal type mismatch
- All components that need translated strings import `useLang()` — never use independent `useState`
- RTL support: toggling to AR sets `document.documentElement.dir = 'rtl'`

## Data Flow

```
Browser (port 3001 / Railway frontend URL)
    │
    ├── Next.js Server Components ──fetch──► Express API (port 3000 / Railway backend URL)
    │       └── uses API_URL (server-side env var, never in browser bundle)
    │
    └── Next.js Client Components ──fetch──► Express API
            └── uses NEXT_PUBLIC_API_URL (browser-visible)
                                                    │
                                                    ▼
                                              MongoDB Atlas
                                         (dealnama database)
```

## MongoDB Collections

| Collection | Key Fields |
|-----------|-----------|
| `countries` | id, name, image, visits, offerViews |
| `states` | id, name, countryId, image |
| `cities` | id, name, countryId, stateId (optional), image, visits, offerViews |
| `retailers` | id, name, cityId, websiteUrl, image, category, clicks, totalTimeSeconds |
| `offers` | id, title, retailerId, validFrom, validUntil, pdfUrl, image, badge, couponCode, couponUrl, isSponsored, externalAdLink, category, clicks, likes, dislikes, totalTimeSeconds, maxPagesViewed |
| `feedbacks` | name, email, message, date |
| `sitestats` | id='global', visits |
| `sitesettings` | id='global', gaId, facebookUrl, twitterUrl, instagramUrl, feedbackUrl, siteUrl |

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
API_URL=https://dealnamaa-backend-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://<frontend-railway-url>
```
