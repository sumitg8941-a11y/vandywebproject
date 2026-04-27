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
npm install && npm run dev

# Terminal 2 — Frontend (port 3001)
cd frontend && npm install && npm run dev

# Admin: http://localhost:3000/admin.html
```

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Express API + static file serving |
| `admin.html` | Admin dashboard HTML |
| `admin.js` | Admin dashboard JS logic |
| `data.js` | API helpers for admin.js |
| `r2-storage.js` | Cloudflare R2 upload helper |
| `SiteSettings.js` | Mongoose model — includes `siteUrl` field |
| `frontend/app/page.tsx` | Homepage (hero mosaic, urgency badges, MyRetailers) |
| `frontend/app/layout.tsx` | Root layout (LangToggle) |
| `frontend/app/PDFFlipbook.tsx` | PDF viewer (WhatsApp share + Download) |
| `frontend/app/GeoDetect.tsx` | IP geo-detection banner |
| `frontend/app/CouponReveal.tsx` | Blur/reveal coupon codes |
| `frontend/app/FollowButton.tsx` | Retailer follow (localStorage) |
| `frontend/app/MyRetailers.tsx` | Followed retailers section |
| `frontend/app/LangToggle.tsx` | EN/AR toggle |
| `frontend/app/search/SearchClient.tsx` | Search with validity filter |

## Admin — Common Tasks

| Task | Steps |
|------|-------|
| Set live site URL | Site Settings → Production Site URL → Save |
| Add country | Countries → + Add Country |
| Add state | States → + Add State (only for Country→State→City hierarchy) |
| Add city | Cities → + Add City (optionally assign to a state) |
| Add retailer | Retailers → + Add Retailer |
| Add offer | Offers & PDFs → + Add New Offer |
| Clean expired offers | Offers & PDFs → Expired section → Select All → Delete Selected |
| View stats by date | Dashboard → Last 7 days / Last 30 days / All time buttons |
| Delete feedback | Feedback → trash icon per row |

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

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Build fails (TS error) | Check `frontend/app/` for type errors, run `npm run build` locally |
| Admin login fails | Check `ADMIN_USER`/`ADMIN_PASS` in Railway env vars |
| Images not loading | Check R2 credentials, verify `R2_PUBLIC_URL` |
| "Live Site" button missing | Set Production Site URL in Admin → Site Settings |
| Stats date filter not working | Uses `admin.loadStats(N)` — check browser console |
| MongoDB connection fails | Verify `MONGO_URI` in Railway env vars, check Atlas IP allowlist (allow all: 0.0.0.0/0) |
