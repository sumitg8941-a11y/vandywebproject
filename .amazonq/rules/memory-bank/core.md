# DealNamaa — Project Core File

> **What is DealNamaa?**  
> A coupon/deal aggregation platform for the Middle East (UAE, Saudi Arabia, Qatar). Shoppers browse retailer flyers, reveal coupon codes, and save deals. An admin dashboard manages all content and tracks analytics.

> **Tech Stack:**  
> Backend — Node.js + Express 5 + Mongoose (MongoDB)  
> Frontend — Next.js (TypeScript, App Router) + Tailwind  
> Storage — Cloudflare R2 (with local fallback)  
> Deployment — Railway (separate services for backend & frontend)

---

## Root-Level Files (Backend)

| File | Purpose |
|------|---------|
| `server.js` | **Main backend entry point.** Express app with all API routes (countries, cities, retailers, offers, search, breadcrumbs, stats, admin CRUD, file uploads). Includes security middleware (Helmet, CORS, rate limiting), JWT admin auth, input validation, and Multer file upload handling. ~1350 lines, monolithic. |
| `package.json` | Backend dependencies and scripts. `npm start` → `node server.js`, `npm run dev` → `nodemon server.js`. Key deps: express 5, mongoose 9, multer, jsonwebtoken, @aws-sdk/client-s3, pdf-lib, helmet, cors, express-rate-limit. |
| `.env` | Environment secrets: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, R2 credentials (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`). |
| `.env.example` | Template of all required env vars with placeholder values. |
| `.gitignore` | Ignores `node_modules`, `.env`, `uploads/`. |
| `railway.json` | Railway deployment config for backend. Nixpacks builder, start command `node server.js`, healthcheck at `/api/health`. |

---

## Mongoose Models (Root)

| File | Purpose |
|------|---------|
| `Country.js` | Schema: `id`, `name`, `image`, `visits`. Represents a country (e.g., UAE, Saudi Arabia). |
| `State.js` | Schema: `id`, `name`, `countryId`, `image`. Represents a state/province within a country. |
| `City.js` | Schema: `id`, `name`, `countryId`, `stateId` (optional), `image`, `visits`. A city belonging to a country or state. |
| `Retailer.js` | Schema: `id`, `name`, `cityId`, `cityIds`, `image`, `category`, `clicks`, `affiliateType`, `affiliateValue`. A retail store within one or more cities (Slide 30). |
| `Offer.js` | Schema: `id`, `title`, `validFrom`, `validUntil`, `pdfUrl`, `image`, `badge`, `retailerId`, `category`, `couponCode`, `couponUrl`, `retailerUrl`, `externalAdLink`, `isSponsored`, `archived`, `metaTitle`, `metaDescription`, `clicks`, `likes`, `dislikes`, `totalTimeSeconds`, `maxPagesViewed`, `rating`, `ratingCount`, `savedCount`, `affiliateOverrideUrl`. Timestamps enabled. The central content entity. `affiliateOverrideUrl` for direct tracking (Slide 30). |
| `Blog.js` | Schema: `slug`, `title`, `excerpt`, `content`, `image`, `metaTitle`, `metaDescription`, `status`, `views`. Represents a blog post (Slide 8). |
| `User.js` | Schema: `username`, `passwordHash`, `role`. Admin users with role-based access control (superadmin vs admin) (Slide 3). |
| `Feedback.js` | Schema: `name`, `email`, `message`, `rating`. User-submitted feedback. |
| `SiteStat.js` | Schema: `id` (default `'global'`), `visits`. Global site visit counter. |
| `SiteSettings.js` | Schema: `id` (default `'global'`), `gaId`, social URLs, `contactEmail`, `contactPhone`, `contactAddress`, `privacyPolicy`, `aboutUs`, `termsOfService`, `showStats`, `customLogoUrl`, `homeMessage`, `faviconUrl`, `adSenseId`. Admin-configurable site settings. |

---

## Utility / Script Files (Root)

| File | Purpose |
|------|---------|
| `r2-storage.js` | Cloudflare R2 integration module. Exports `uploadToR2(buffer, name, mime)`, `deleteFromR2(url)`, `isR2Configured()`. Uses AWS S3 SDK. |
| `pdf-watermark.js` | Adds a diagonal "DealNamaa Offers" watermark and a small "dealnamaa.com" footer to every page of uploaded PDFs. Uses `pdf-lib`. |
| `data.js` | Legacy static dataset (countries/cities/retailers/offers) + browser-side API helper object (`api.*`). Served to `admin.html` as a client-side JS file for admin dashboard fetch calls. |
| `admin.html` | Standalone single-page admin dashboard (vanilla HTML/JS). CRUD management for countries, states, cities, retailers, flyers, settings. Includes analytics charts. Sidebar nav label reads "Flyers" (renamed from "Offers & PDFs" per client feedback). |
| `admin.js` | Client-side JavaScript for `admin.html` (~94 KB). URL upload inputs hidden. Reset Metrics button removed. Dates dd-MMM-yyyy. Section heading "Flyers". CSV export for metrics, offers, feedback. Data access explanation. Settings tooltips. Cascading Country→City→Retailer dropdowns (Slide 21). Auto-generated offer IDs (Slide 22). Archive/restore workflow (Slide 23). |
| `seed.js` | One-time script to populate MongoDB with sample countries, cities, retailers, and offers. Run with `node seed.js`. Clears existing data first. |
| `download_and_seed.js` | Downloads D4D flyer images from CDN into `/uploads` and inserts corresponding offer records. One-time data ingestion script. |
| `migrate-to-r2.js` | Migrates all files from local `/uploads` to Cloudflare R2, then updates image/PDF URLs in all MongoDB records. One-time migration script. |
| `scraper.js` | Quick scraper that fetches a D4D page and extracts image URLs. Debugging/research tool, not used in production. |
| `r2-cors-config.json` | CORS rules for the R2 bucket. |
| `CLIENT-SUMMARY.txt` | Non-technical summary of the platform's features for the client. |
| `DealNamaa - Feedback.pptx` | Client feedback presentation deck. |

---

## `dist/` — Refactored Backend (TypeScript compiled output)

A cleaner, modularized version of the monolithic `server.js`. Currently compiled JS output.

| File | Purpose |
|------|---------|
| `dist/server.js` | Refactored entry point. Uses Express Router for modular routes. Same security stack. |
| `dist/routes/public.js` | Public API routes — countries, cities, regions, retailers, offers, breadcrumbs, tracking. |
| `dist/routes/admin.js` | Admin CRUD routes — create/update/delete for all entities + file uploads. |
| `dist/routes/search.js` | Search API with filters (query, category, city, retailer, validity). |
| `dist/routes/breadcrumbs.js` | Breadcrumb hierarchy builder (offer → retailer → city → state → country). |
| `dist/routes/stats.js` | Analytics/stats dashboard API with date-range filtering. |
| `dist/middleware/auth.js` | JWT admin authentication middleware. |
| `dist/middleware/upload.js` | Multer upload middleware config. |
| `dist/middleware/validation.js` | Input validation helpers. |
| `dist/models/*.js` | Compiled Mongoose model files (same schemas as root). |
| `dist/types/index.js` | TypeScript type exports (compiled). |

---

## `frontend/` — Next.js Public Website

| File | Purpose |
|------|---------|
| `frontend/package.json` | Frontend deps. Next.js, React 19, Tailwind CSS. |
| `frontend/next.config.ts` | Next.js config. Image optimization for remote URLs, rewrites `/uploads/*` to backend API. |
| `frontend/tsconfig.json` | TypeScript config for the frontend. |
| `frontend/.env.local` | Frontend env: `API_URL` pointing to the backend. |
| `frontend/railway.json` | Railway deployment config for frontend. Build with `npm run build`, start with `npm run start`. |

### `frontend/app/` — Pages & Components

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout. HTML structure, metadata, Google Fonts, Google Analytics, global nav/footer, language toggle, push notification prompt. |
| `page.tsx` | Homepage. Ad slot, geo-detection, country selection, featured deals, expiring-soon offers. Hero section removed per client feedback (Slide 13). |
| `globals.css` | Global CSS. |
| `error.tsx` | Global error boundary. |
| `not-found.tsx` | Custom 404 page with branded "Deal Not Found" UI. |
| `robots.ts` | Dynamic robots.txt generation. |
| `sitemap.ts` | Dynamic sitemap.xml — lists all countries, cities, retailers, offers for SEO. |
| `favicon.ico` | Site favicon. |

### `frontend/app/` — Route Directories

| Directory | Purpose |
|-----------|---------|
| `about/` | About Us page (content pulled from SiteSettings). |
| `cities/[countryId]/` | Lists all cities in a country. Large banner replaced with compact header + ad slot (Slide 14). |
| `retailers/[cityId]/` | Lists all retailers in a city. |
| `offers/[retailerId]/` | Lists all offers for a retailer. |
| `view/[offerId]/` | Single offer detail page — PDF flipbook viewer, coupon reveal, like/dislike, rating, save, share. |
| `search/` | Search results page with advanced filters (category, city, retailer, validity). |
| `feedback/` | User feedback submission form with email regex validation and Google reCAPTCHA v2 (Slide 12). reCAPTCHA requires `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` env var. |
| `contact/` | Contact page. Phone number removed from display (Slide 11). |
| `privacy/` | Privacy policy page. |
| `terms/` | Terms of service page. |
| `admin/` | Admin login redirect / admin info page. |

### `frontend/app/` — Shared Components

| Component | Purpose |
|-----------|---------|
| `HomeHero.tsx` | Homepage content: search bar, country cards, top retailers, expiring-soon, latest offers. Large hero banner removed (Slide 13), replaced with ad slot → search → countries. |
| `GeoDetect.tsx` | Auto-detects user country via IP and redirects to relevant city page. |
| `PDFFlipbook.tsx` | Interactive PDF viewer with page-by-page navigation, zoom, fullscreen, and engagement tracking (time + pages). Download button removed (Slide 31). |
| `CouponReveal.tsx` | Tap-to-reveal coupon code with copy-to-clipboard + confetti animation. Tracks intent. |
| `LangToggle.tsx` | English/Arabic language toggle with full RTL support. |
| `MobileNav.tsx` | Responsive mobile hamburger navigation menu. |
| `NavLinks.tsx` | Desktop navigation links. |
| `Breadcrumbs.tsx` | Dynamic breadcrumb trail (country → state → city → retailer → offer). |
| `SearchBar.tsx` | Search input component. |
| `RatingWidget.tsx` | 5-star rating widget for offers. |
| `SaveButton.tsx` | Bookmark/save offer to localStorage favorites. |
| `FollowButton.tsx` | Follow a retailer (localStorage-based). |
| `MyRetailers.tsx` | Shows user's followed retailers. |
| `SocialProof.tsx` | Displays live site stats (visitors, ratings) to build trust. |
| `PushNotification.tsx` | Browser push notification opt-in prompt. |
| `AdSlot.tsx` | Google AdSense ad slot component. Supports horizontal (728x90), rectangle (300x250), and vertical (300x600) formats. |
| `SafeImage.tsx` | Image component with fallback handling for broken URLs. |
| `SkeletonLoader.tsx` | Loading skeleton placeholder for async content. |
| `Tracker.tsx` | Client-side visit/click tracking component. |
| `FindDealsButton.tsx` | CTA button linking to search/browse flow. |

---

## `uploads/` — Local File Storage

Stores uploaded PDFs, images, and flyer assets. Served statically at `/uploads/*`. Falls back to this when R2 is not configured.

---

*Last updated: 2026-05-04 — Phase 1+2 Complete, Phase 3 Partial (Slides 3, 5, 7, 8, 9, 25, 27, 28, 30, 32) + Blog System Complete (Slide 8)*
