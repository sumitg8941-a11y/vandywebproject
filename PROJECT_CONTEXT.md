# DealNamaa - Complete Project Context Document

## 📋 Project Overview

**Project Name:** DealNamaa  
**Type:** Full-Stack Deals & Coupons Aggregation Platform  
**Architecture:** Monorepo (Backend + Frontend in same workspace)  
**Status:** Active Development / Production  
**Primary Purpose:** Connect users with retail offers across multiple geographic locations

---

## 🏗️ Technical Architecture

### Technology Stack

#### Backend
- **Runtime:** Node.js (CommonJS modules)
- **Framework:** Express.js 5.2.1
- **Database:** MongoDB 7.1.1 with Mongoose 9.4.1 ODM
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Security:** Helmet 8.1.0, CORS 2.8.6, express-rate-limit 8.3.2
- **File Uploads:** Multer 2.1.1
- **Environment:** dotenv 17.4.2
- **Deployment:** SSH2 1.17.0, PM2 process manager

#### Frontend
- **Framework:** Next.js 16.2.4 (App Router)
- **UI Library:** React 19.2.4
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x with PostCSS
- **Fonts:** Google Fonts (Poppins) via next/font
- **Icons:** Font Awesome 6.4.0 (CDN)
- **Analytics:** Google Analytics via @next/third-parties

#### Development Environment
- **OS:** Windows (CRLF line endings)
- **Backend Port:** 3000
- **Frontend Port:** 3001 (development)
- **Database:** MongoDB (local or remote via MONGO_URI)

---

## 📁 Project Structure

```
VandanaProject/
├── server.js                          # Main Express server (all API routes)
├── app.js                             # Empty (legacy)
│
├── Country.js                         # Mongoose model
├── State.js                           # Mongoose model
├── City.js                            # Mongoose model
├── Retailer.js                        # Mongoose model
├── Offer.js                           # Mongoose model
├── SiteStat.js                        # Mongoose model (analytics)
├── Feedback.js                        # Mongoose model (user feedback)
│
├── data.js                            # Data seeding utilities
├── seed.js                            # Database seeding script
├── download_and_seed.js               # Download and seed automation
├── scraper.js                         # Web scraping utilities
├── deploy.js                          # SSH deployment script
│
├── uploads/                           # User-uploaded files (PDFs, images)
│   ├── d4d_flyer_1.webp
│   ├── d4d_flyer_2.webp
│   └── ...
│
├── admin.html                         # Legacy admin interface
├── admin.js                           # Legacy admin logic
├── index.html                         # Legacy frontend
├── d4d.html                           # Legacy deal viewer
├── flipbook.js                        # PDF flipbook viewer
├── styles.css                         # Legacy styles
│
├── .env                               # Environment variables (not in git)
├── package.json                       # Backend dependencies
├── .gitignore                         # Git ignore rules
│
├── frontend/                          # Next.js application
│   ├── app/                           # App Router pages
│   │   ├── page.tsx                   # Homepage
│   │   ├── layout.tsx                 # Root layout
│   │   ├── globals.css                # Global styles
│   │   ├── SearchBar.tsx              # Global search component
│   │   ├── Breadcrumbs.tsx            # Original breadcrumb component
│   │   ├── BreadcrumbsEnhanced.tsx    # Enhanced breadcrumb (NEW)
│   │   ├── BreadcrumbsClient.tsx      # Client-side breadcrumb (NEW)
│   │   ├── breadcrumbUtils.ts         # Breadcrumb utilities (NEW)
│   │   │
│   │   ├── about/                     # Static page
│   │   ├── contact/                   # Static page
│   │   ├── privacy/                   # Static page
│   │   ├── terms/                     # Static page
│   │   │
│   │   ├── admin/                     # Admin redirect
│   │   │   └── page.tsx               # Redirects to backend admin.html
│   │   │
│   │   ├── cities/                    # City listing
│   │   │   ├── [countryId]/
│   │   │   │   └── page.tsx           # Cities by country
│   │   │   └── state/
│   │   │       └── [stateId]/
│   │   │           └── page.tsx       # Cities by state
│   │   │
│   │   ├── retailers/                 # Retailer listing
│   │   │   └── [cityId]/
│   │   │       ├── page.tsx           # Retailers by city
│   │   │       └── page-example.tsx   # Example with new breadcrumb (NEW)
│   │   │
│   │   ├── offers/                    # Offer listing
│   │   │   └── [retailerId]/
│   │   │       ├── page.tsx           # Offers by retailer
│   │   │       └── page-example.tsx   # Example with new breadcrumb (NEW)
│   │   │
│   │   ├── view/                      # Offer detail viewer
│   │   │   └── [offerId]/
│   │   │       └── page.tsx           # Single offer view
│   │   │
│   │   └── search/                    # Search results
│   │       └── page.tsx               # Global search page
│   │
│   ├── public/                        # Static assets
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── *.svg                      # Next.js default icons
│   │
│   ├── next.config.ts                 # Next.js configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── postcss.config.mjs             # PostCSS configuration
│   ├── eslint.config.mjs              # ESLint configuration
│   ├── package.json                   # Frontend dependencies
│   ├── README.md                      # Frontend documentation
│   ├── BREADCRUMB_GUIDE.md            # Breadcrumb implementation guide (NEW)
│   └── .next/                         # Build output (not in git)
│
├── .amazonq/                          # Amazon Q configuration
│   └── rules/
│       └── memory-bank/               # Project documentation
│           ├── product.md             # Product overview
│           ├── structure.md           # Project structure
│           ├── tech.md                # Technology stack
│           └── guidelines.md          # Development guidelines
│
└── BREADCRUMB_IMPLEMENTATION.md       # Breadcrumb summary (NEW)
```

---

## 🗄️ Database Schema

### Geographic Hierarchy
```
Country → State (optional) → City → Retailer → Offer
```

### Collections

#### countries
```javascript
{
  id: String (unique, lowercase, URL-friendly),
  name: String,
  image: String (flag/image URL),
  createdAt: Date,
  updatedAt: Date
}
```

#### states
```javascript
{
  id: String (unique, lowercase),
  name: String,
  image: String,
  countryId: String (relationship),
  createdAt: Date,
  updatedAt: Date
}
```

#### cities
```javascript
{
  id: String (unique, lowercase),
  name: String,
  image: String,
  countryId: String (relationship),
  stateId: String (optional relationship),
  createdAt: Date,
  updatedAt: Date
}
```

#### retailers
```javascript
{
  id: String (unique, lowercase),
  name: String,
  websiteUrl: String,
  clicks: Number (default: 0),
  totalTimeSeconds: Number (default: 0),
  image: String (logo URL),
  category: String (default: 'Supermarket'),
  cityId: String (relationship),
  createdAt: Date,
  updatedAt: Date
}
```

#### offers
```javascript
{
  id: String (unique, lowercase),
  title: String,
  validFrom: Date,
  validUntil: Date,
  pdfUrl: String (default: '#'),
  clicks: Number (default: 0),
  likes: Number (default: 0),
  dislikes: Number (default: 0),
  totalTimeSeconds: Number (default: 0),
  maxPagesViewed: Number (default: 0),
  image: String,
  badge: String (e.g., 'HOT DEAL', 'LIMITED'),
  isSponsored: Boolean (default: false),
  externalAdLink: String,
  category: String (default: 'General'),
  couponCode: String,
  couponUrl: String,
  retailerId: String (relationship),
  createdAt: Date,
  updatedAt: Date
}
```

#### sitestats
```javascript
{
  id: String (e.g., 'global'),
  visits: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### feedbacks
```javascript
{
  name: String,
  email: String,
  message: String,
  date: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Public Endpoints

#### Health & Info
- `GET /api/health` - Health check

#### Geographic Navigation
- `GET /api/countries` - List all countries
- `GET /api/regions/:countryId` - Get states or cities by country
- `GET /api/cities/:countryId` - Get cities by country
- `GET /api/cities` - Get all cities (admin)
- `GET /api/states` - Get all states (admin)

#### Retailers & Offers
- `GET /api/retailers/:cityId` - Get retailers by city
- `GET /api/retailers` - Get all retailers (admin)
- `GET /api/retailer/:id` - Get single retailer details
- `GET /api/offers/:retailerId` - Get offers by retailer
- `GET /api/offers` - Get all offers (admin)
- `GET /api/offer/:id` - Get single offer details

#### Search
- `GET /api/search?q=query` - Global search (retailers + offers)

#### Breadcrumbs (NEW)
- `GET /api/breadcrumbs/:type/:id` - Get breadcrumb hierarchy
  - Types: `city`, `state`, `retailer`, `offer`
  - Returns: Complete hierarchy from country to current level

#### User Interactions
- `POST /api/offer/:id/like` - Like an offer
- `POST /api/offer/:id/dislike` - Dislike an offer
- `GET /api/redirect/offer/:id` - Tracked redirect with UTM parameters
- `POST /api/feedback` - Submit user feedback

#### Analytics Tracking
- `POST /api/track/visit` - Track site visit
- `POST /api/track/retailer/:id` - Track retailer click
- `POST /api/track/offer/:id` - Track offer click
- `POST /api/track/offer-stats/:id` - Track offer engagement (time, pages)

### Admin Endpoints (JWT Protected)

#### Authentication
- `POST /api/admin/login` - Admin login (returns JWT token)
  - Body: `{ username, password }`
  - Returns: `{ token }`

#### Content Management
- `POST /api/upload` - Upload file (PDF, image)
- `POST /api/countries` - Create country
- `POST /api/states` - Create state
- `POST /api/cities` - Create city
- `POST /api/retailers` - Create retailer
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/countries/:id` - Delete country
- `DELETE /api/states/:id` - Delete state
- `DELETE /api/cities/:id` - Delete city
- `DELETE /api/retailers/:id` - Delete retailer
- `DELETE /api/offers/:id` - Delete offer

#### Analytics
- `GET /api/stats` - Get global statistics
  - Returns: visits, top 5 retailers, top 5 offers
- `GET /api/admin/feedback` - Get all user feedback

---

## 🎨 Frontend Routes

### Public Pages
- `/` - Homepage (country selection)
- `/cities/:countryId` - Cities in country
- `/cities/state/:stateId` - Cities in state
- `/retailers/:cityId` - Retailers in city
- `/offers/:retailerId` - Offers from retailer
- `/view/:offerId` - Single offer detail view
- `/search?q=query` - Search results page

### Static Pages
- `/about` - About page
- `/contact` - Contact page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Admin
- `/admin` - Redirects to backend admin.html

---

## 🔐 Security Features

### Implemented
1. **Helmet.js** - Security headers (CSP disabled for flexibility)
2. **CORS** - Cross-origin resource sharing enabled
3. **Rate Limiting** - 1000 requests per 15 minutes per IP
4. **JWT Authentication** - Admin routes protected
5. **Input Validation** - Regex validation for IDs (`/^[a-z0-9_-]+$/`)
6. **Body Size Limits** - 10KB limit on JSON payloads
7. **SQL Injection Prevention** - Mongoose parameterized queries
8. **XSS Prevention** - Input sanitization (regex escaping)

### Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017/dealnamaa
JWT_SECRET=your_secret_key_here
ADMIN_USER=admin
ADMIN_PASS=secure_password_here
PORT=3000
```

---

## 📊 Key Features

### User-Facing Features
1. **Geographic Navigation** - Drill down: Country → State → City → Retailer
2. **Retailer Browsing** - View retailers by city with category filtering
3. **Offer Viewing** - PDF flyers, coupon codes, external links
4. **Global Search** - Search across retailers and offers
5. **Feedback System** - Like/dislike offers
6. **Tracked Redirects** - UTM parameters for affiliate tracking
7. **Responsive Design** - Mobile-first with Tailwind CSS
8. **Breadcrumb Navigation** - Dynamic hierarchy navigation (NEW)

### Admin Features
1. **JWT Authentication** - Secure admin access
2. **CRUD Operations** - Manage all entities
3. **File Upload System** - Upload PDFs and images
4. **Analytics Dashboard** - Visit tracking, top performers
5. **Feedback Management** - View user submissions

### Analytics & Tracking
1. **Site Visits** - Global visit counter
2. **Retailer Clicks** - Track retailer engagement
3. **Offer Metrics** - Clicks, views, time spent, pages viewed
4. **User Feedback** - Likes/dislikes collection
5. **Outbound Tracking** - UTM parameters on external links

---

## 🎯 Recent Changes (Latest Session)

### Breadcrumb Navigation System (NEW)
**Date:** Current session  
**Status:** Implemented locally, NOT deployed

#### Changes Made:
1. **Backend API Endpoint** (`server.js`)
   - Added `GET /api/breadcrumbs/:type/:id`
   - Traverses database relationships to build hierarchy
   - Supports: city, state, retailer, offer types

2. **Frontend Components**
   - `BreadcrumbsEnhanced.tsx` - Server-side breadcrumb component
   - `BreadcrumbsClient.tsx` - Client-side alternative
   - `breadcrumbUtils.ts` - Utility functions library

3. **Documentation**
   - `BREADCRUMB_GUIDE.md` - Complete implementation guide
   - `BREADCRUMB_IMPLEMENTATION.md` - Quick reference
   - Example usage files for retailers and offers pages

#### Features:
- ✅ Dynamic hierarchy generation from database
- ✅ Interactive navigation links
- ✅ Responsive text truncation (mobile/tablet/desktop)
- ✅ Accessibility compliant (ARIA labels)
- ✅ TypeScript with strict typing
- ✅ Server-side rendering for SEO

#### Deployment Status:
- ⚠️ **NOT committed to Git**
- ⚠️ **NOT pushed to GitHub**
- ⚠️ **NOT deployed to web server**

---

## 🚀 Deployment Process

### Current Setup
- **Web Server:** 192.168.242.128
- **SSH User:** wsadm
- **SSH Password:** india@123
- **Project Path:** ~/vandywebproject
- **Process Manager:** PM2
- **Backend Process:** dealnamaa-backend

### Deployment Steps
1. **Local Changes** → Commit to Git
2. **Push to GitHub** → `git push origin main`
3. **Deploy Script** → `node deploy.js` (automated SSH deployment)
   - Connects via SSH
   - Runs: `git clean -fd && git stash && git pull`
   - Restarts: `pm2 restart dealnamaa-backend`

### Manual Deployment
```bash
ssh wsadm@192.168.242.128
cd vandywebproject
git pull
pm2 restart dealnamaa-backend
```

---

## 🧪 Development Workflow

### Backend Development
```bash
# Install dependencies
npm install

# Start server
npm start
# Runs: node server.js
# Listens on: http://0.0.0.0:3000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Runs: next dev
# Opens: http://localhost:3001
```

### Database Seeding
```bash
node seed.js              # Seed from data.js
node download_and_seed.js # Download and seed
```

---

## 📝 Code Style & Conventions

### Backend (JavaScript)
- **Indentation:** 4 spaces
- **Semicolons:** Required
- **Quotes:** Single quotes
- **Naming:** camelCase for variables/functions
- **Constants:** SCREAMING_SNAKE_CASE
- **Comments:** Emoji section headers (`// 🛡️ SECURITY MIDDLEWARES`)

### Frontend (TypeScript)
- **Indentation:** 2 spaces
- **Semicolons:** Optional (follows Next.js conventions)
- **Quotes:** Single quotes
- **Components:** PascalCase
- **Files:** Capitalized for components, lowercase for pages

### Database
- **IDs:** Lowercase, URL-friendly strings (not ObjectId)
- **Relationships:** Suffix with `Id` (e.g., `cityId`, `retailerId`)
- **Timestamps:** Automatic via `{ timestamps: true }`

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No State Support in Some Countries** - Some countries go directly to cities
2. **Legacy Files Present** - Old HTML/CSS files still in root
3. **No Caching** - All API calls use `cache: 'no-store'`
4. **Single Admin User** - No multi-user admin system
5. **No Image Optimization** - Images served directly, not optimized

### Technical Debt
1. **Monolithic server.js** - All routes in one file (~600+ lines)
2. **Mixed Architecture** - Legacy HTML + modern Next.js
3. **No Tests** - No unit or integration tests
4. **No CI/CD** - Manual deployment process
5. **Hardcoded Credentials** - SSH credentials in deploy.js

---

## 📈 Performance Characteristics

### Backend
- **Response Time:** 50-100ms (typical API call)
- **Database Queries:** Optimized with `.lean()` for read operations
- **Rate Limiting:** 1000 req/15min per IP
- **Concurrent Connections:** Handled by Express/Node.js

### Frontend
- **Rendering:** Server-side (SSR) for initial load
- **Navigation:** Client-side routing (instant)
- **Bundle Size:** Optimized by Next.js
- **Images:** Not optimized (potential improvement)

---

## 🔮 Future Enhancements (Potential)

### Suggested Improvements
1. **Caching Layer** - Redis for API responses
2. **Image Optimization** - Next.js Image component
3. **Multi-language Support** - i18n implementation
4. **Advanced Search** - Filters, sorting, pagination
5. **User Accounts** - Save favorites, personalized deals
6. **Push Notifications** - New offer alerts
7. **Mobile App** - React Native or PWA
8. **Analytics Dashboard** - Enhanced admin analytics
9. **A/B Testing** - Offer performance testing
10. **API Documentation** - Swagger/OpenAPI spec

---

## 🎓 Learning Resources

### For Understanding This Project
1. **Express.js Docs** - https://expressjs.com/
2. **Next.js App Router** - https://nextjs.org/docs/app
3. **Mongoose ODM** - https://mongoosejs.com/
4. **Tailwind CSS** - https://tailwindcss.com/
5. **JWT Authentication** - https://jwt.io/

### Key Concepts
- **Monorepo Structure** - Backend + Frontend in one repo
- **Server Components** - React Server Components in Next.js
- **RESTful API Design** - Resource-based URLs
- **Document Database** - MongoDB schema design
- **Geographic Hierarchy** - Multi-level drill-down navigation

---

## 📞 Quick Reference

### Start Development
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Test API
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/countries
curl http://localhost:3000/api/breadcrumbs/city/mumbai
```

### Deploy to Production
```bash
git add .
git commit -m "Your message"
git push origin main
node deploy.js
```

### Access Admin
```
http://localhost:3000/admin.html
Username: admin (or from .env)
Password: admin123 (or from .env)
```

---

## 🎯 Current Project Status

### Completed
- ✅ Full-stack architecture
- ✅ Geographic navigation system
- ✅ Retailer and offer management
- ✅ Search functionality
- ✅ Admin panel with JWT auth
- ✅ Analytics tracking
- ✅ File upload system
- ✅ Responsive frontend
- ✅ Breadcrumb navigation system (local only)

### In Progress
- 🔄 Breadcrumb deployment (pending Git push)

### Pending
- ⏳ Replace old breadcrumb component in all pages
- ⏳ Add SEO schema to pages
- ⏳ Performance optimization
- ⏳ Test coverage
- ⏳ CI/CD pipeline

---

## 💡 Important Notes for AI Assistants

1. **Deployment Required** - Recent breadcrumb changes are LOCAL ONLY
2. **Windows Environment** - Use Windows commands (not Unix)
3. **Monorepo Structure** - Backend and frontend share workspace
4. **Legacy Code Present** - Don't remove without confirmation
5. **Production Server** - Changes require Git push + SSH deployment
6. **Environment Variables** - Never commit .env file
7. **Database IDs** - Always lowercase strings, not ObjectId
8. **API Validation** - Always validate IDs before database queries
9. **Error Handling** - Use try-catch for all async operations
10. **TypeScript** - Frontend uses strict TypeScript, backend uses JavaScript

---

## 📄 File Locations for Quick Access

### Configuration
- Backend config: `package.json`, `.env`, `server.js`
- Frontend config: `frontend/package.json`, `frontend/next.config.ts`, `frontend/tsconfig.json`

### Models
- All in root: `Country.js`, `State.js`, `City.js`, `Retailer.js`, `Offer.js`, `SiteStat.js`, `Feedback.js`

### Components
- Layout: `frontend/app/layout.tsx`
- Search: `frontend/app/SearchBar.tsx`
- Breadcrumbs: `frontend/app/BreadcrumbsEnhanced.tsx` (NEW)

### Documentation
- Memory Bank: `.amazonq/rules/memory-bank/*.md`
- Breadcrumb Guide: `frontend/BREADCRUMB_GUIDE.md`
- This File: `PROJECT_CONTEXT.md`

---

**Last Updated:** Current session (breadcrumb implementation)  
**Version:** 1.0.0  
**Maintained By:** Development team  
**Purpose:** Complete project context for AI assistants

---

## 🤖 How to Use This Document

When sharing with an AI assistant:

1. **Share this entire file** - It contains complete context
2. **Mention specific areas** - If focusing on particular features
3. **Update after changes** - Keep this document current
4. **Reference sections** - Use section headers for quick navigation

Example prompts:
- "Based on PROJECT_CONTEXT.md, help me optimize the search API"
- "Review the database schema in PROJECT_CONTEXT.md and suggest improvements"
- "Using the deployment process in PROJECT_CONTEXT.md, create a CI/CD pipeline"

---

**End of Document**
