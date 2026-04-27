# DealNamaa Quick Reference

## URLs

| Service | URL |
|---------|-----|
| Backend API | https://dealnamaa-backend-production.up.railway.app |
| Admin Dashboard | https://dealnamaa-backend-production.up.railway.app/admin.html |
| Frontend | Set in Railway → copy from frontend service URL |
| MongoDB Atlas | mongodb+srv://...cluster0dealnamaa.o9ps2d7.mongodb.net/dealnama |
| R2 Public | https://pub-45510cdb150f4139b1cb4be3a5cba4e6.r2.dev |

## Local Dev

```bash
# Terminal 1 — Backend (port 3000)
cd VandanaProject
npm install && npm run dev

# Terminal 2 — Frontend (port 3001)
cd VandanaProject/frontend
npm install && npm run dev

# Admin: http://localhost:3000/admin.html
```

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Express API — all routes, ~1250 lines, CRLF+BOM encoding |
| `admin.html` | Admin sidebar layout + CSS design system |
| `admin.js` | Admin tab rendering + form handlers |
| `data.js` | API helpers for admin.js (`api.getStats(since, from, to)`) |
| `r2-storage.js` | Cloudflare R2 upload helper |
| `SiteSettings.js` | Mongoose model — gaId, socialUrls, feedbackUrl, siteUrl |
| `frontend/app/layout.tsx` | Root layout — LangProvider, Tracker(visit), header, footer |
| `frontend/app/page.tsx` | Homepage server component |
| `frontend/app/HomeHero.tsx` | Homepage UI client component |
| `frontend/app/LangToggle.tsx` | LangProvider + useLang() + all EN/AR translations |
| `frontend/app/Tracker.tsx` | Analytics tracker — sessionStorage dedup |
| `frontend/app/SafeImage.tsx` | next/image wrapper with broken-src fallback |
| `frontend/app/PDFFlipbook.tsx` | PDF viewer (WhatsApp share + Download) |
| `frontend/app/GeoDetect.tsx` | IP geo-detection banner (ipapi.co) |
| `frontend/app/CouponReveal.tsx` | Blur/reveal coupon codes |
| `frontend/app/FollowButton.tsx` | Retailer follow (localStorage) |
| `frontend/app/MyRetailers.tsx` | Followed retailers section on homepage |
| `frontend/app/search/SearchClient.tsx` | Search with validity + category + city + retailer filters |
| `frontend/app/SocialProof.tsx` | Trust signals banner |
| `frontend/app/SaveButton.tsx` | Bookmark offers to localStorage |
| `frontend/app/RatingWidget.tsx` | 5-star rating with hover preview |
| `frontend/app/PushNotification.tsx` | Web push prompt popup |
| `frontend/app/SkeletonLoader.tsx` | Professional loading states |
| `frontend/app/error.tsx` | Top-level error boundary |

## Admin — Common Tasks

| Task | Steps |
|------|-------|
| Set live site URL | Site Settings → Production Site URL → Save |
| Add country | Countries → + Add Country |
| Add state | States → + Add State (only for Country→State→City hierarchy) |
| Add city | Cities → + Add City (optionally assign to a state) |
| Add retailer | Retailers → + Add Retailer |
| Add offer | Offers & PDFs → + Add New Offer |
| Edit offer | Offers & PDFs → Edit button on row |
| Clean expired offers | Offers & PDFs → Expired section → Select All → Delete Selected |
| View stats | Dashboard tab → select Last 7 days / Last 30 days / All time / Custom |
| Custom date range | Dashboard → Custom button → pick From/To dates → Apply |
| Delete feedback | Feedback tab → trash icon per row |

## Environment Variables (Railway)

### Backend
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=<96-char hex>
ADMIN_USER=admin
ADMIN_PASS=<password>
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=dealnamaa-offers
R2_PUBLIC_URL=https://pub-45510cdb150f4139b1cb4be3a5cba4e6.r2.dev
NODE_ENV=production
```

### Frontend
```
NEXT_PUBLIC_API_URL=https://dealnamaa-backend-production.up.railway.app
API_URL=https://dealnamaa-backend-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://<frontend-url>
```

## Tracking System

| Event | Where fired | sessionStorage key |
|-------|------------|-------------------|
| Visit | `layout.tsx` via `<Tracker type="visit">` | `dn_visited` |
| Country view | `cities/[countryId]/page.tsx` | `dn_tracked_country_{id}` |
| City view | `retailers/[cityId]/page.tsx` | `dn_tracked_city_{id}` |
| Retailer view | `offers/[retailerId]/page.tsx` | `dn_tracked_retailer_{id}` |
| Offer click | `OfferViewClient.tsx` on mount | `dn_tracked_offer_{id}` |
| Offer time + pages | `OfferViewClient.tsx` on unmount | — (always fires) |

All tracking is fire-and-forget. Dedup via sessionStorage prevents double-counting within a session.
Tracking endpoints are rate-limited to 20 req/min per IP.

## localStorage Keys (Frontend)

| Key | Purpose |
|-----|---------|
| `dn_followed_retailers` | JSON array of followed retailer IDs |
| `dn_saved_offers` | Array of saved offer IDs |
| `dn_rating_{offerId}` | User's 1-5 star rating for an offer |

## sessionStorage Keys (Frontend)

| Key | Purpose |
|-----|---------|
| `dn_visited` | Visit tracked this session |
| `dn_tracked_{type}_{id}` | Entity tracked this session |
| `dn_geo_dismissed` | GeoDetect banner dismissed this session |

## Critical: Editing server.js

```powershell
$f = 'server.js'
$c = [System.IO.File]::ReadAllText($f)
$c2 = $c.Replace('old string', 'new string')
[System.IO.File]::WriteAllText($f, $c2)
```

Never use `Set-Content`, `WriteAllLines`, or `fsReplace` tool on this file — all corrupt it.

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Build fails (TS error) | Run `npm run build` in `frontend/`, fix type errors shown |
| Admin login fails | Check `ADMIN_USER`/`ADMIN_PASS` in Railway env vars |
| Images not loading | Check R2 credentials, verify `R2_PUBLIC_URL` |
| Images show "No Image" placeholder | `SafeImage` fallback triggered — source URL is broken or empty |
| "View Live Website" button missing | Set Production Site URL in Admin → Site Settings |
| Stats all showing 0 | Normal on fresh deploy — data accumulates as users visit |
| GeoDetect banner not showing | Check browser console for `[GeoDetect]` log — country code from ipapi.co must match a DB country ID exactly |
| MongoDB connection fails | Verify `MONGO_URI` in Railway env vars, check Atlas IP allowlist (allow 0.0.0.0/0) |
| server.js edit corrupted file | Use .NET `ReadAllText`/`WriteAllText` — see Critical section above |

## Git

**Repo**: `https://github.com/sumitg8941-a11y/vandywebproject.git`
**Branch**: `main`

Recent commits:
- `98a3348` — SafeImage fallback, visit dedup, tracking rate limit
- `5caa957` — Wire all tracking calls (visit, country, city, retailer, offer)
- `3ca582e` — Custom date range filter on admin dashboard
- `2feb3d5` — GeoDetect diagnostic logging
