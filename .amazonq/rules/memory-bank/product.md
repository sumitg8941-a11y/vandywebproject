# DealNamaa — Product Overview

## What It Is

DealNamaa is a deals and coupons aggregation website for the Middle East market (UAE, Saudi Arabia, Qatar, Kuwait, etc.). It aggregates retail flyers, PDF catalogs, coupon codes, and promotional offers from supermarkets, hypermarkets, electronics stores, and fashion retailers — all in one searchable platform. The concept is modelled after d4donline.com.

## Value Proposition

- Users browse by geography: Country → State/City → Retailer → Offers
- Each offer can have a PDF flipbook catalog, a cover image, a coupon code, and validity dates
- Expired offers are automatically hidden from users
- WhatsApp sharing is built in (critical for Middle East market)
- Urgency labels ("Expires today!", "3 days left") drive click-through

## Target Users

| User Type | How They Use It |
|-----------|----------------|
| Shoppers | Browse flyers, find coupon codes, share deals on WhatsApp |
| Website Owner | Manage all content via admin panel, track analytics |
| Retail Partners | Get traffic via tracked redirect links with UTM parameters |

## Key Features

### User-Facing
- Geographic drill-down navigation (Country → City → Retailer → Offers)
- Full-text search with filters (category, city, retailer)
- PDF flipbook viewer for catalog flyers
- Like/dislike feedback on offers
- Coupon code copy-to-clipboard
- "Expiring This Week" urgency section on homepage
- WhatsApp share button on every offer and retailer page
- Live offer mosaic in homepage hero (shows real offer images)
- Breadcrumb navigation on all deep pages
- JSON-LD structured data on offer pages (Google indexable)
- Dynamic sitemap.xml generated from live database
- Proper robots.txt blocking /admin and /api

### Admin Panel (`http://localhost:3000/admin.html`)
- JWT-authenticated login (12-hour token)
- **Dashboard/Statistics** — rich KPI cards: total visits, active/expired offers, expiring soon, top retailers by clicks, top offers by clicks and likes, most engaged offers (time spent), recent additions, feedback count
- **Countries** — CRUD with image upload
- **Cities** — CRUD linked to countries
- **Retailers** — CRUD linked to cities, with logo upload
- **Offers & PDFs** — CRUD with PDF + cover image upload, validity dates, badge text, coupon code
- **Feedback** — view all user-submitted feedback
- **Site Settings** — Google Analytics ID, social media URLs (Facebook/Twitter/Instagram), feedback page URL — all DB-driven, no code changes needed

### Analytics Tracked
- Total site visits
- Per-retailer click counts
- Per-offer click counts
- Per-offer time spent (seconds)
- Per-offer max page reached in flipbook
- Per-offer likes and dislikes

## Business Model Hooks

- `isSponsored` flag on offers — sponsored offers can be pinned/highlighted
- `externalAdLink` on offers — third-party ad destination
- `couponUrl` with UTM tracking — tracked outbound links to retailer sites
- UTM parameters auto-appended: `utm_source=DealNamaa`, `utm_medium=coupon_link`, `utm_campaign=retailer_traffic`

## Content Hierarchy

```
Country (e.g., UAE)
  └── State/Region (optional, e.g., Dubai Emirate)
        └── City (e.g., Dubai)
              └── Retailer (e.g., Carrefour)
                    └── Offer (e.g., Weekend Sale — PDF + image + coupon)
```

## Admin Access

- URL: `http://localhost:3000/admin.html`
- Credentials: set in root `.env` as `ADMIN_USER` and `ADMIN_PASS`
- Token expires after 12 hours — logout and re-login to refresh
