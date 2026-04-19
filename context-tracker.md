# Project Context & Progress Tracker

## Architecture Overview
**Project:** DealNamaa - Dubai Offers & Discounts Platform
- **Backend:** Node.js, Express, MongoDB (Mongoose). Serves an API on port 3000.
- **Admin Panel:** Vanilla JS/HTML (`admin.html`, `admin.js`) served by the backend.
- **Frontend (Legacy):** Vanilla JS/HTML (`index.html`, `app.js`, `styles.css`) in the root directory. Deprecated in favor of Next.js.
- **Frontend (Current):** Next.js App Router (`frontend/` directory). Uses TailwindCSS.

## Directory Structure
- `/` (Root): Backend server, Database Models, Admin Panel, Legacy Frontend.
  - `server.js`: Entry point for the backend.
  - `Country.js`, `City.js`, `Retailer.js`, `Offer.js`, `SiteStat.js`: Mongoose schemas.
  - `admin.html`, `admin.js`: Backend dashboard for CRUD operations.
  - `seed.js`: Script to seed MongoDB with initial mock data.
- `/frontend/`: Next.js 15+ App Router.
  - `app/page.tsx`: Home page, fetches countries from the backend API.

## Completed Features
- **Backend Setup:** Node.js server with Express, connected to MongoDB.
- **Security:** Helmet, CORS, Rate Limiting, JSON payload limits implemented in `server.js`.
- **Database Models:** Country, City, Retailer, Offer, SiteStat.
- **API Endpoints:** Read/Write operations for all models, plus tracking/analytics endpoints.
- **Admin Panel:** Functional CRUD operations for Countries, Cities, Retailers, and Offers inserting directly into MongoDB.
- **Frontend Migration:** Next.js App Router. Home page fetches and displays countries.
- **Frontend Routing:** Next.js dynamic routes built for Cities (`/cities/[countryId]`), Retailers (`/retailers/[cityId]`), and Offers (`/offers/[retailerId]`).
- **Branding:** Website renamed to "DealNamaa".
- **Admin Access & Security:** 
  - Admin access is via stealth `/admin` Next.js route which redirects to `admin.html`.
  - Implemented JWT-based Login System covering the admin dashboard and all WRITE API endpoints.
- **Google Analytics:** Added via `@next/third-parties/google` to track global traffic.
- **Advanced Tracking & Ads Integration:** 
  - Time spent per offer is dynamically tracked via a dedicated view page (`/view/[offerId]`).
  - Added larger flyer-like thumbnails (aspect-[3/4]) and category grouping.
  - Ads/Sponsored content are seamlessly integrated into the grid.
  - Retailer traffic is tracked using coupon codes and UTM tagged backend redirects (`/api/redirect/offer/:id`).
- **File Uploads (Multer):**
  - Integrated `multer` in Node.js to handle physical Image and PDF file uploads straight from the Admin dashboard.
  - Uploaded files are served from the `/uploads` directory securely.

## Next Immediate Steps (Pending)
1. **Frontend Polish:**
   - Enhance the design and responsiveness of dynamic routes if needed.
2. **Additional Features:**
   - Develop dedicated static pages (About Us, Contact Us, Terms, Privacy) and Footer links.
   - Configure User Roles if multi-admin support is requested.

*Note: This file is updated after each iteration to maintain project context.*
