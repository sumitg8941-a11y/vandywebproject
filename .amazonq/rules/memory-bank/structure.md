# Project Structure

## Architecture Overview
DealNamaa follows a monorepo structure with a Node.js/Express backend and a Next.js frontend, both sharing the same workspace root.

## Directory Structure

```
VandanaProject/
├── frontend/                    # Next.js 16 frontend application
│   ├── app/                     # Next.js App Router pages
│   │   ├── about/              # About page
│   │   ├── admin/              # Admin dashboard
│   │   ├── cities/             # City listing pages
│   │   ├── contact/            # Contact page
│   │   ├── offers/             # Offer detail pages
│   │   ├── privacy/            # Privacy policy
│   │   ├── retailers/          # Retailer pages
│   │   ├── search/             # Search results
│   │   ├── terms/              # Terms of service
│   │   ├── view/               # Offer viewer
│   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs component
│   │   ├── SearchBar.tsx       # Global search component
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── public/                 # Static assets
│   ├── .next/                  # Next.js build output
│   ├── next.config.ts          # Next.js configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── package.json            # Frontend dependencies
│   └── README.md               # Frontend documentation
│
├── uploads/                    # User-uploaded files (PDFs, images)
│
├── .amazonq/                   # Amazon Q configuration
│   └── rules/
│       └── memory-bank/        # Project documentation
│
├── server.js                   # Main Express server entry point
├── app.js                      # Empty (legacy)
│
├── Country.js                  # Country model (Mongoose schema)
├── State.js                    # State model
├── City.js                     # City model
├── Retailer.js                 # Retailer model
├── Offer.js                    # Offer model
├── SiteStat.js                 # Site statistics model
├── Feedback.js                 # User feedback model
│
├── data.js                     # Data seeding utilities
├── seed.js                     # Database seeding script
├── download_and_seed.js        # Download and seed automation
├── scraper.js                  # Web scraping utilities
├── deploy.js                   # Deployment script
│
├── admin.html                  # Legacy admin interface
├── admin.js                    # Legacy admin logic
├── index.html                  # Legacy frontend
├── d4d.html                    # Legacy deal viewer
├── flipbook.js                 # PDF flipbook viewer
├── styles.css                  # Legacy styles
│
├── .env                        # Environment variables
├── package.json                # Backend dependencies
└── .gitignore                  # Git ignore rules
```

## Core Components

### Backend (Express API)
- **server.js**: Main application server with all API routes
- **Database Models**: Mongoose schemas for data entities
- **Middleware**: Security (Helmet, CORS), rate limiting, JWT authentication
- **File Uploads**: Multer-based file handling for offer materials

### Frontend (Next.js)
- **App Router**: File-based routing with React Server Components
- **Pages**: Dynamic routes for geographic navigation and content display
- **Components**: Reusable UI elements (SearchBar, Breadcrumbs)
- **Styling**: Tailwind CSS v4 with PostCSS

### Data Layer
- **MongoDB**: Primary database via Mongoose ODM
- **Models**: Country → State → City → Retailer → Offer hierarchy
- **Analytics**: SiteStat and Feedback collections

## Architectural Patterns

### Geographic Hierarchy
```
Country (e.g., India)
  └── State/Region (e.g., Maharashtra)
      └── City (e.g., Mumbai)
          └── Retailer (e.g., D-Mart)
              └── Offer (e.g., Weekly Sale)
```

### API Design
- RESTful endpoints with resource-based URLs
- JWT authentication for admin routes
- Input validation on all user-provided data
- Rate limiting on API routes (1000 requests per 15 minutes)

### Frontend Architecture
- Server-side rendering for SEO optimization
- Client-side navigation for performance
- Component-based UI with TypeScript
- Responsive design with Tailwind CSS

## Key Relationships

### Data Flow
1. User navigates: Country → State/Region → City → Retailer
2. Frontend fetches data from Express API
3. API queries MongoDB via Mongoose models
4. Results rendered with Next.js components

### Admin Workflow
1. Admin authenticates via JWT
2. Uploads files (PDFs, images) to /uploads
3. Creates/updates entities via protected API routes
4. Changes immediately reflected in user-facing pages

### Analytics Pipeline
1. User interactions trigger tracking endpoints
2. Server updates counters in MongoDB
3. Admin dashboard aggregates statistics
4. Top performers calculated via sorting queries
