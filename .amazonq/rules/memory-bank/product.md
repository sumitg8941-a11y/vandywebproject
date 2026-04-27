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
- Mixed hierarchy: countries can have direct cities OR states → cities (both shown simultaneously)
- Breadcrumb navigation on all deep pages

### Homepage
- Split-column hero: solid red gradient (text + search always readable) + 2×2 offer image mosaic (desktop only)
- "My Retailers" section — personalised, powered by localStorage follows
- Top Retailers grid with category pills and offer counts
- "Expiring This Week" urgency section
- Latest Coupons & Offers grid with urgency badges (Expires today / X days left / New this week)

### Offers & Search
- Full-text search with filters: category, city, retailer, validity (Today / This week / This month / Any time)
- PDF flipbook viewer with WhatsApp share + Download buttons
- Coupon code blur/tap-to-reveal (CouponReveal component)
- Like/dislike feedback on offers
- Retailer website link on offer detail page (uses `websiteUrl` field)
- "Expiring today!", "X days left", "New this week" urgency badges

### Engagement
- Retailer follow/unfollow (localStorage, `dn_followed_retailers` key)
- WhatsApp share on every offer and retailer page
- IP geo-detection banner (ipapi.co) — suggests country based on user location
- EN/AR language toggle with RTL direction support

### SEO & Technical
- JSON-LD structured data on offer pages
- Dynamic sitemap.xml from live DB
- robots.txt blocking /admin and /api
- `generateMetadata` on all dynamic pages
- Open Graph tags

### Business Model
- `isSponsored` flag — sponsored offers can be pinned/highlighted
- `externalAdLink` — third-party ad destination
- `couponUrl` with UTM tracking: `utm_source=DealNamaa&utm_medium=coupon_link&utm_campaign=retailer_traffic`

## Admin Panel

**URL**: `https://dealnamaa-backend-production.up.railway.app/admin.html`  
**Auth**: JWT (12-hour token), credentials in `.env` as `ADMIN_USER` / `ADMIN_PASS`

### Tabs

| Tab | Features |
|-----|---------|
| Dashboard | KPI cards (visits, active offers, conversion rate, avg engagement, PDF depth, monthly growth), geographic performance, top retailers/offers, PDF engagement analytics, category performance, conversion insights |
| Countries | CRUD + image upload |
| States | CRUD + image upload (optional — for Country→State→City hierarchy) |
| Cities | CRUD + image upload + optional state assignment |
| Retailers | CRUD + logo upload + website URL |
| Offers & PDFs | CRUD + PDF upload + cover image upload + validity dates + badge + coupon code. Active/expired separation. Bulk delete expired offers. |
| Feedback | View submissions, sort newest/oldest, delete individual entries |
| Site Settings | Google Analytics ID, social media URLs, feedback page URL, **production site URL** (drives "View Live Website" button) |

### Stats Date Range Filter
Three buttons: Last 7 days / Last 30 days / All time. Uses `admin._statsSince` state + `admin.loadStats(N)` method.

### Live Site Button
Driven by `siteUrl` in Site Settings. Hidden until set. Set it to the Railway frontend URL to enable.

## Content Hierarchy

```
Country (e.g., UAE)
  ├── State/Region (optional, e.g., Dubai Emirate)
  │     └── City (e.g., Dubai)
  │           └── Retailer → Offers
  └── Direct City (no state) → Retailer → Offers
```
