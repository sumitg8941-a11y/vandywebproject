# Project Context & Progress Tracker

## Project Overview
**Name:** DealNamaa - Dubai Offers & Discounts Platform
**Directory:** VANDANAPROJECT
**Description:** A website that showcases offers, deals, and coupons for various retailers. 

## Architecture
- **Backend:** Node.js, Express, MongoDB (Mongoose). Serves an API on port 3000.
- **Frontend (Current):** Next.js 15+ App Router (`frontend/` directory). Uses TailwindCSS. Runs on port 3001.
- **Admin Panel:** Vanilla JS/HTML (`admin.html`, `admin.js`) served by the backend.
- **Frontend (Legacy):** Vanilla JS/HTML (`index.html`, `app.js`, `styles.css`) in the root directory. (Deprecated; now redirects to port 3001 to prevent blank page issues).

## Deployment & Development Workflow
**MANDATORY WORKFLOW FOR ALL CHANGES:**
1. **Local Development:** Make changes to the code in the `VANDANAPROJECT` directory.
2. **Version Control:** Commit and push the changes to the GitHub repository (`https://github.com/sumitg8941-a11y/vandywebproject`).
3. **Deployment:** SSH into the webserver and pull the latest changes from GitHub.
4. **Context Updates:** Whenever any feature is added, modified, or removed, this `context-tracker.md` file MUST be updated to reflect the current state.

### Webserver SSH Details
- **IP Address:** `192.168.242.128`
- **Username:** `wsadm`
- **Password:** `india@123`
*(We use a custom Node.js script `run.js` with `ssh2` in the local temp directory for automated SSH commands).*

## Fresh Linux Ubuntu Deployment Guide
Follow these steps to deploy the project completely on a new Linux Ubuntu server:

1. **System Preparation:**
   ```bash
   sudo apt update
   sudo apt install git -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2
   ```
2. **Clone Repository:**
   ```bash
   git clone https://github.com/sumitg8941-a11y/vandywebproject.git
   cd vandywebproject
   ```
3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dealnamaa
   JWT_SECRET=your_super_secret_key_here
   ```
4. **Backend Setup (Runs on Port 3000):**
   ```bash
   npm install
   pm2 start server.js --name "dealnamaa-backend"
   ```
5. **Frontend Setup (Runs on Port 3001):**
   ```bash
   cd frontend
   npm install
   npm run build
   pm2 start npm --name "dealnamaa-frontend" -- start
   ```
6. **Save PM2 Configuration:**
   ```bash
   pm2 startup
   pm2 save
   ```

## Directory Structure
- `/` (Root): Backend server, Database Models, Admin Panel, legacy files.
  - `server.js`: Entry point for the backend.
  - `Country.js`, `City.js`, `Retailer.js`, `Offer.js`, `SiteStat.js`: Mongoose schemas.
  - `admin.html`, `admin.js`: Backend dashboard for CRUD operations.
  - `index.html`: Contains a JavaScript redirect (`window.location.port = 3001;`) to route port 3000 web traffic to the Next.js frontend on 3001.
- `/frontend/`: Next.js frontend application.

## Completed Features
- **Backend Setup:** Node.js server with Express, connected to MongoDB. Port 3000.
- **Security:** Helmet, CORS, Rate Limiting, JSON payload limits in `server.js`. Input validation added.
- **Database Models:** Country, State, City, Retailer, Offer, SiteStat.
- **API Endpoints:** Read/Write operations for all models, analytics endpoints, regions endpoint for states/cities.
- **Admin Panel:** CRUD operations inserting directly into MongoDB. Secured by JWT Login.
- **File Uploads (Multer):** Physical Image/PDF uploads from Admin dashboard to `/uploads`.
- **Frontend Setup:** Next.js App Router on Port 3001. Dynamic routes for Cities, Retailers, and Offers.
- **Static Pages:** About, Contact, Terms, and Privacy pages linked in footer.
- **Advanced Tracking:** Dynamic time tracking per offer, retailer traffic tracked via UTM tagged redirects (`/api/redirect/offer/:id`).
- **SEO & Performance:** robots.txt, sitemap.xml, SEO Meta Tags, Image optimization with next/image.
- **Search:** Global search with autocomplete functionality.
- **Server Fix:** Backend `index.html` updated to redirect users to port 3001 to solve blank page issue.
- **Image Optimization:** Implemented next/image component across all pages with WebP/AVIF support, lazy loading, and responsive sizing for improved Core Web Vitals.

## Next Immediate Steps (Pending)
1. Frontend Polish (design/responsiveness).
2. Configure User Roles if multi-admin support is requested.

*Note: This file is the absolute source of truth for the project and must be strictly maintained after every interaction.*
