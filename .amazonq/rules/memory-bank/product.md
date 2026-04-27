# DealNamaa — Product Overview

## What It Is

DealNamaa is a deals and coupons aggregation website for the Middle East market. It aggregates retail flyers, PDF catalogs, coupon codes, and promotional offers from supermarkets, hypermarkets, electronics stores, and fashion retailers. Modelled after d4donline.com.

## Target Users

| User Type | How They Use It |
|-----------|----------------|
| Shoppers | Browse flyers, find coupon codes, share deals on WhatsApp |
| Website Owner | Manage all content via admin panel, track analytics |
| Retail Partners | Get traffic via tracked redirect links with UTM parameters |

## User-Facing Features

### Navigation
- Geographic drill-down: Country → State/City → Retailer → Offers
- Mixed hierarchy: countries can have direct cities OR states → cities (both shown simultaneously on the same page)
- Breadcrumb navigation on all deep pages (`Breadcrumbs` component, fetches from `/api/breadcrumbs/:type/:id`)

### Homepage
- Split-column hero: solid red gradient left (text + search always readable) + 2×2 offer image mosaic right (desktop only, hidden on mobile, only renders if ≥4 offers have images)
- "My Retailers" section — personalised, powered by localStorage follows (`dn_followed_retailers` key)
- Top Retailers grid with category pills and offer counts
- "Expiring This Week" urgency section (only shown if offers exist)
- Latest Coupons & Offers grid with urgency badges (Expires today / X days left / New this week)
- IP geo-detection banner (`GeoDetect`) — suggests country based on `ipapi.co/json/`, uses `sessionStorage` for dismiss state

### Offers & Search
- Full-text search with filters: category, city, retailer, validity (Today / This week / This month / Any time)
- Search results: retailers shown as grid, offers shown as list with image
- PDF flipbook viewer (`PDFFlipbook`) with WhatsApp share + Download buttons
- Coupon code blur/tap-to-reveal (`CouponReveal` component)
- Like/dislike feedback on offer detail pages
- Retailer website link on offer detail page (uses `websiteUrl` field)
- Urgency badges: "Expires today!", "X days left", "New this week"

### Engagement
- Retailer follow/unfollow (`FollowButton`, localStorage `dn_followed_retailers` key)
- WhatsApp share on every offer and retailer page
- EN/AR language toggle (`LangToggle`) with RTL direction support — powered by `LangProvider` React Context in `layout.tsx`, all translations consolidated in `LangToggle.tsx`

### Analytics & Tracking
All tracking is fire-and-forget via the `Tracker` component with sessionStorage dedup:
- `visit` — fires once per browser session (`dn_visited` key), increments global `SiteStat.visits`
- `country` — fires once per session per country page (`dn_tracked_country_{id}`)
- `city` — fires once per session per city page (`dn_tracked_city_{id}`)
- `retailer` — fires once per session per retailer page (`dn_tracked_retailer_{id}`)
- `offer` — fires once per session per offer view (`dn_tracked_offer_{id}`)
- `offer-stats` — fires on `OfferViewClient` unmount via `useEffect` cleanup, records `totalTimeSeconds` + `maxPagesViewed` with `keepalive: true`
- Likes/dislikes — stored on `Offer` document, shown live

### SEO & Technical
- JSON-LD structured data on offer pages
- Dynamic `sitemap.xml` from live DB
- `robots.txt` blocking `/admin` and `/api/`
- `generateMetadata` on all dynamic pages
- Open Graph tags on all pages
- `SafeImage` component wraps all `next/image` usage — falls back to inline SVG placeholder on broken `src`

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
