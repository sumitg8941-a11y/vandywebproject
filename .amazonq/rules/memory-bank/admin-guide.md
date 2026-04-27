# Admin Interface Guide

## Access

**Production URL**: `https://dealnamaa-backend-production.up.railway.app/admin.html`
**Local URL**: `http://localhost:3000/admin.html`
**Authentication**: JWT-based login (12-hour token)
**Credentials**: Set in `.env` as `ADMIN_USER` and `ADMIN_PASS`

## Architecture

| File | Purpose |
|------|---------|
| `admin.html` | Sidebar layout, CSS design system, login modal |
| `admin.js` | All tab rendering logic, form handlers, API calls |
| `data.js` | API helper functions (`api.getCountries()`, `api.getStats()`, etc.) |
| `server.js` | Backend API endpoints consumed by admin |

**Stack**: Vanilla JS (ES2020+), Fetch API, JWT in `localStorage`, no build step.

## Sidebar Structure

```
Overview
  └── Dashboard          ← default tab on login

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
  ├── View Live Website  ← hidden until siteUrl is set in Site Settings
  └── Sign Out
```

## Tab Reference

### Dashboard
Analytics dashboard with date range filter.

**Date range options**:
- Last 7 days / Last 30 days / All time — click to apply immediately
- Custom — reveals two date pickers (From / To) + Apply button
- Active range button turns red; Custom button shows selected range when active

**KPI Cards**: Total Visits, Active Offers, Conversion Rate, Avg Engagement Time, Avg Pages Viewed, Monthly Growth

**Sections**: Geographic Performance (top countries + cities), Top Retailers, Top Offers, PDF Engagement Analytics, Category Performance, Conversion Insights

### Countries
- Table: ID, Name, Image thumbnail, Edit / Delete actions
- Add / Edit form: Country Code (e.g. `ae`), Country Name, image upload or URL
- Edit pre-fills the form; ID becomes read-only during edit

### States
- Optional — only needed for Country → State → City hierarchy (e.g. India, USA)
- Table: ID, Name, Country, Image, Edit / Delete
- Add / Edit form: State Code, State Name, Country dropdown, image upload or URL

### Cities
- Table: ID, City Name, Country, State (shows "—" if direct city), Edit / Delete
- Add / Edit form: City Code, City Name, Country dropdown, State dropdown (optional), image upload or URL
- State dropdown dynamically filters when country changes (`admin.loadStatesForCity()`)

### Retailers
- Table: ID, Name, City Code, Edit / Delete
- Add / Edit form: Retailer ID, Name, Official Website URL (optional), City dropdown, logo upload or URL

### Offers & PDFs
- **Active Offers** table: Title, Retailer, Validity range, Edit / Delete
- **Expired Offers** section (orange): checkbox per row, Select All, bulk Delete Selected
- Add / Edit form fields:
  - Offer ID (unique, lowercase)
  - Title
  - Valid From / Valid Until (date pickers)
  - Retailer (dropdown)
  - PDF Flyer (file upload or URL)
  - Cover Image (file upload or URL)
  - Badge text (e.g. "50% OFF")
- **Reset Metrics**: Offers have a "Reset metrics" button to clear testing data (resets clicks, likes, ratings, saves, time, etc.).

### Feedback
- Lists all user feedback submissions with date, name, email, message
- Sort: Newest First / Oldest First (dropdown)
- Delete individual entries with trash icon

### Site Settings
All settings saved to MongoDB `sitesettings` collection, applied to live site immediately.

| Field | Purpose |
|-------|---------|
| Production Site URL | Drives "View Live Website" button in sidebar. Leave blank to hide button. |
| Google Analytics ID | e.g. `G-XXXXXXXXXX`. Leave blank to disable GA. |
| Facebook URL | Footer social icon link |
| Twitter / X URL | Footer social icon link |
| Instagram URL | Footer social icon link |
| Feedback Page URL | Default `/feedback`. Can be external Google Form URL. |

## File Upload System

**Supported types**: JPG, PNG, GIF, WebP, PDF

**Flow**:
1. User selects file in form
2. Admin JS sends `FormData` to `POST /api/admin/upload` with JWT header
3. Server processes via multer → uploads to Cloudflare R2
4. Returns `{ url: 'https://pub-....r2.dev/filename.ext' }`
5. URL stored in MongoDB with the entity

**Local dev fallback**: If R2 credentials are missing, file saves to `/uploads/` and returns `/uploads/filename.ext`

## Security

- JWT token stored in `localStorage` as `adminToken`
- All protected requests include `Authorization: Bearer <token>` header
- Token expires after 12 hours — logout and re-login to refresh
- Rate limit: 1000 req/15min general, 20 req/min on tracking endpoints

## Common Tasks

### Add a Country
Countries → + Add Country → fill Code + Name + image → Save Country

### Add a State (optional)
States → + Add State → fill Code + Name + select Country + image → Save State
Only needed if that country uses State → City hierarchy.

### Add a City
Cities → + Add City → fill Code + Name + select Country + optionally select State + image → Save City

### Add a Retailer
Retailers → + Add Retailer → fill ID + Name + Website URL + select City + logo → Save Retailer

### Add an Offer
Offers & PDFs → + Add New Offer → fill all fields → Save Offer
- PDF and cover image are optional
- Badge is optional (e.g. "Up to 50% OFF")

### Edit an Offer
Offers & PDFs → click Edit on any active offer row → modify fields → Update Offer

### Bulk Delete Expired Offers
Offers & PDFs → scroll to Expired Offers section → Select All → Delete Selected → confirm

### View Analytics
Dashboard tab → select date range → review KPI cards and charts

### Set Live Site URL
Site Settings → Production Site URL → paste Railway frontend URL → Save Settings
The "View Live Website" link in the sidebar footer will appear immediately.

## Troubleshooting

| Problem | Solution |
|---------|---------|
| "Invalid credentials" on login | Check `ADMIN_USER` / `ADMIN_PASS` in Railway env vars or `.env` |
| "Invalid Token" / "Access Denied" | Token expired — logout and login again |
| File upload fails | Check R2 credentials in env vars; check `/uploads` dir exists for local dev |
| Data shows "Loading..." forever | MongoDB connection issue — check `MONGO_URI`, check Atlas IP allowlist (0.0.0.0/0) |
| "View Live Website" button missing | Set Production Site URL in Site Settings |
| Stats all showing 0 | Tracking was recently fixed — data accumulates from user visits going forward |
| Dashboard date filter not working | Must be on Dashboard tab — filter buttons are inside the tab content |

## Development Notes

### Modifying Admin
- Edit `admin.html` for layout/structure changes
- Edit `admin.js` for logic/rendering changes
- No build step — refresh browser to see changes

### Adding a New Tab
1. Add `<button class="tab-btn" onclick="admin.showTab('tabname', event)">` in `admin.html` sidebar
2. Add `case 'tabname': html = await this.renderTabname(); break;` in `showTab()` in `admin.js`
3. Create `renderTabname: async function() { ... return htmlString; }` in `admin.js`
4. Add API endpoints in `server.js` using the .NET `ReadAllText`/`WriteAllText` edit method
