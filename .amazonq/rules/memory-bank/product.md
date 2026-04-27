# DealNamaa — Product Overview

## What It Is

DealNamaa is a deals and coupons aggregation website for the Middle East market. It aggregates retail flyers, PDF catalogs, coupon codes, and promotional offers from supermarkets, hypermarkets, electronics stores, and fashion retailers. Modelled after d4donline.com.

## Target Users

| User Type | How They Use It |
|-----------|----------------|
| Shoppers | Browse flyers, find coupon codes, share deals, bookmark offers |
| Website Owner | Manage all content via admin panel, track analytics |
| Retail Partners | Get traffic via tracked redirect links with UTM parameters |

## User-Facing Features

### Navigation
- Geographic drill-down: Country → State/City → Retailer → Offers
- Mixed hierarchy: countries can have direct cities OR states → cities (both shown simultaneously on the same page)
- Breadcrumb navigation on all deep pages (`Breadcrumbs` component, fetches from `/api/breadcrumbs/:type/:id`)
- Accessible Mobile Navigation (`MobileNav` component) — proper React state with backdrop, scroll lock, and animations.

### Homepage
- Split-column hero: solid red gradient left (text + search always readable) + 2×2 offer image mosaic right (desktop only, hidden on mobile, only renders if ≥4 offers have images, otherwise shows a loading placeholder icon).
- Visual Hierarchy: clear section separation with category pills ("Start Here", "Popular Stores", "Urgent", "Fresh Deals").
- "My Retailers" section — personalised, powered by localStorage follows (`dn_followed_retailers` key)
- Top Retailers grid with category pills and offer counts (displays Retailer Names instead of IDs).
- "Expiring This Week" urgency section (only shown if offers exist).
- Latest Coupons & Offers grid with urgency badges (Expires today / X days left / New this week).
- IP geo-detection banner (`GeoDetect`) — suggests country based on `ipapi.co/json/`, uses `sessionStorage` for dismiss state.
- Social Proof Banner (`SocialProof` component) — dynamically displays global stats like visitors, total deals saved, and average rating.
- Web Push Notifications (`PushNotification` component) — native browser push prompt appearing 5 seconds after page load.

### Offers & Search
- Full-text search with filters: category, city, retailer, validity (Today / This week / This month / Any time)
- Search results: both retailers and offers are shown as a grid. Offers have cover images with hover effects and badge overlays.
- Skeleton Loaders (`SkeletonLoader` component) — professional loading states across grids and lists while data is fetched.
- PDF flipbook viewer (`PDFFlipbook`) with native device Share (Web Share API) + Download buttons.
- Coupon code blur/tap-to-reveal (`CouponReveal` component)
- Like/dislike/undo feedback and Star Rating (1-5, `RatingWidget` component) on offer detail pages.
- Save/Bookmark Offers (`SaveButton` component, localStorage `dn_saved_offers`).
- Retailer website link on offer detail page (uses `websiteUrl` field)
- Urgency badges: "Expires today!", "X days left", "New this week"

### Engagement
- Retailer follow/unfollow (`FollowButton`, localStorage `dn_followed_retailers` key)
- Native Web Share API (`navigator.share`) on every offer and retailer page (falling back to WhatsApp with emotional messaging).
- EN/AR language toggle (`LangToggle`) with RTL direction support — powered by `LangProvider` React Context in `layout.tsx`, all translations consolidated in `LangToggle.tsx`

### Analytics & Tracking
All tracking is fire-and-forget via the `Tracker` component with sessionStorage dedup:
- `visit` — fires once per browser session (`dn_visited` key), increments global `SiteStat.visits`
- `country` — fires once per session per country page (`dn_tracked_country_{id}`)
- `city` — fires once per session per city page (`dn_tracked_city_{id}`)
- `retailer` — fires once per session per retailer page (`dn_tracked_retailer_{id}`)
- `offer` — fires once per session per offer view (`dn_tracked_offer_{id}`)
- `offer-stats` — fires on `beforeunload` (using `navigator.sendBeacon()`) and component unmount (using `fetch` with `keepalive: true`), records `totalTimeSeconds` + `maxPagesViewed`.
- Likes/dislikes — stored on `Offer` document, shown live. Users can undo their interactions.
- Ratings & Saves — stored on `Offer` document, aggregated globally in `SiteStat`.

### SEO & Technical
- Rich SEO Footer with 4 columns (top countries, popular retailers, quick links, and social links).
- Branded 404 Page (`not-found.tsx`) showing alternative offers.
- Error Boundary (`error.tsx`) catching all unhandled JS errors with a recovery UI.
- JSON-LD structured data on offer pages.
- Dynamic `sitemap.xml` from live DB.
- `robots.txt` blocking `/admin` and `/api/`.
- `generateMetadata` on all dynamic pages.
- Open Graph tags on all pages.
- `SafeImage` component wraps all `next/image` usage — falls back to inline SVG placeholder on broken `src`.

### Business Model
- `isSponsored` flag — sponsored offers can be pinned/highlighted
- `externalAdLink` — third-party ad destination
- `couponUrl` with UTM tracking: `utm_source=DealNamaa&utm_medium=coupon_link&utm_campaign=retailer_traffic`

## Admin Panel

**URL**: `https://dealnamaa-backend-production.up.railway.app/admin.html`
**Auth**: JWT (12-hour token), credentials in `.env` as `ADMIN_USER` / `ADMIN_PASS`

### Sidebar Structure

```
Overview
  └── Dashboard

Content
  ├── Countries
  ├── States
  ├── Cities
  ├── Retailers
  └── Offers & PDFs

Insights
  └── Feedback

System
  └── Site Settings

Footer
  ├── View Live Website (hidden until siteUrl is set)
  └── Sign Out
```

### Dashboard Tab
- This is the **default tab** upon login to provide immediate insights.
- Date range filter: Last 7 days / Last 30 days / All time / **Custom** (date picker, from→to)
- Custom range uses `admin._statsFrom` / `admin._statsTo` state, calls `api.getStats(since, from, to)`
- KPI cards: Total Visits, Active Offers, Conversion Rate, Avg Engagement Time, Avg Pages Viewed, Monthly Growth
- Geographic Performance: Top Countries + Top Cities by visits
- Top Retailers + Top Offers by clicks
- PDF Engagement Analytics: avg pages, PDFs with views, most engaged PDFs
- Category Performance: offers + clicks by category
- Conversion Insights: conversion rate, zero-click offers, expiring soon count

### Countries / States / Cities / Retailers Tabs
- Full CRUD: add, edit, delete
- Image upload (to R2) or URL input
- States are optional — only needed for Country→State→City hierarchy
- Cities can be assigned to a state (optional) or be direct cities under a country

### Offers & PDFs Tab
- Active offers table (edit / delete per row)
- Expired offers section (orange background) with bulk select + delete
- Add/Edit form: ID, title, valid from/until, retailer, PDF upload, cover image upload, badge text
- **Reset Metrics**: Offers have a "Reset metrics" button for testing purposes (resets clicks, likes, ratings, saves, time, etc.).

### Feedback Tab
- Lists all user feedback submissions
- Sort: Newest First / Oldest First
- Delete individual entries

### Site Settings Tab
- Production Site URL (drives "View Live Website" button in sidebar)
- Google Analytics Measurement ID
- Social media URLs (Facebook, Twitter/X, Instagram)
- Feedback Page URL

## Content Hierarchy

```
Country (e.g., UAE)
  ├── State/Region (optional, e.g., Dubai Emirate)
  │     └── City (e.g., Dubai)
  │           └── Retailer → Offers
  └── Direct City (no state) → Retailer → Offers
```

Cities page shows states (red "Region" pill) and direct cities (orange "City" pill) in a single unified grid.

## Developer Credit

Footer of `layout.tsx` contains a hardcoded "Developed by Sumit Gupta" LinkedIn link. This is in the source code — admin panel has no ability to remove it.