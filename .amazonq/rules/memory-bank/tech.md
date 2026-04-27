# Technology Stack

## Overview

Two separate Railway services:

| Process | Runtime | Port | URL |
|---------|---------|------|-----|
| Backend API | Node.js + Express | 8080 | `https://dealnamaa-backend-production.up.railway.app` |
| Frontend | Next.js 16 | Railway-assigned | `https://<frontend>.up.railway.app` |
| Admin Panel | Served by backend | 8080 | `https://dealnamaa-backend-production.up.railway.app/admin.html` |
| Database | MongoDB Atlas | 27017 | `mongodb+srv://...cluster0dealnamaa.o9ps2d7.mongodb.net/dealnama` |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 | Runtime |
| Express | ^5.2.1 | HTTP server and routing |
| Mongoose | ^9.4.1 | MongoDB ODM |
| jsonwebtoken | ^9.0.3 | JWT auth for admin |
| multer | ^2.1.1 | File upload handling |
| @aws-sdk/client-s3 | latest | Cloudflare R2 uploads |
| helmet | ^8.1.0 | HTTP security headers |
| cors | ^2.8.6 | Cross-origin requests |
| express-rate-limit | ^8.3.2 | Rate limiting |
| dotenv | ^17.4.2 | Environment variable loading |
| nodemon | ^3.1.14 | Dev auto-restart |

**Module system**: CommonJS (`"type": "commonjs"`)

**Scripts**:
```bash
npm start        # node server.js
npm run dev      # nodemon server.js
```

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| pdfjs-dist | ^5.6.205 | PDF rendering in flipbook |
| react-pdf | ^10.4.1 | React wrapper for pdfjs |
| Poppins (Google Fonts) | — | Typography |
| Font Awesome | 6.4.0 | Icons (CDN) |

**Scripts**:
```bash
cd frontend
npm run dev      # next dev -p 3001
npm run build    # next build
npm start        # next start (Railway injects PORT)
```

## Admin Panel

Pure vanilla stack — no build step:
- HTML5 + CSS design system (CSS custom properties defined in `admin.html` `<style>`)
- Vanilla JavaScript (ES2020+, async/await)
- Font Awesome 6.4 (CDN), Inter font (Google Fonts CDN)
- Fetch API for all backend communication
- JWT stored in `localStorage` as `adminToken`

## File Storage

- **Production**: Cloudflare R2 bucket `dealnamaa-offers`
- **Public URL**: `https://pub-45510cdb150f4139b1cb4be3a5cba4e6.r2.dev`
- **Dev fallback**: local `/uploads/` directory
- **Naming**: `{timestamp}-{random9digits}.{ext}`
- **Frontend proxy**: Next.js rewrites `/uploads/*` → backend (for local dev)

## Deployment (Railway)

### Backend (`railway.json` at root)
```json
{ "build": { "builder": "NIXPACKS" }, "deploy": { "startCommand": "npm start" } }
```

### Frontend (`frontend/railway.json`)
```json
{ "build": { "builder": "NIXPACKS" }, "deploy": { "startCommand": "npm start" } }
```

Railway injects `PORT` automatically. Frontend `package.json` uses `"start": "next start"` (no port flag).

### Required Railway Environment Variables

**Backend service:**
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

**Frontend service:**
```
NEXT_PUBLIC_API_URL=https://dealnamaa-backend-production.up.railway.app
API_URL=https://dealnamaa-backend-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://<frontend-url>
```

## Security

| Layer | Detail |
|-------|--------|
| `helmet` | Secure HTTP headers on all responses |
| General rate limit | 1000 req / 15 min per IP on all `/api` routes |
| Tracking rate limit | 20 req / 1 min per IP on `/api/track/*` — prevents stat inflation |
| `verifyAdmin` middleware | JWT verification, defined at top of `server.js` before all routes |
| `validateId()` | Regex `/^[a-z0-9_-]+$/` max 50 chars — applied to every URL param before DB query |
| `express.static` lockdown | Only serves `/uploads`, `admin.html`, `admin.js`, `data.js` — never `__dirname` |
| JWT expiry | 12 hours |
| `robots.txt` | Blocks `/admin` and `/api/` from all crawlers |
| Tracking dedup | `Tracker` component uses `sessionStorage` — visit fires once per session, entity tracks fire once per session per ID |

## Local Development

### Terminal 1 — Backend
```bash
cd VandanaProject
npm install
# ensure .env exists with all required vars
npm run dev
# Server: http://localhost:3000
# Admin:  http://localhost:3000/admin.html
```

### Terminal 2 — Frontend
```bash
cd VandanaProject/frontend
npm install
# ensure .env.local exists:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
# API_URL=http://127.0.0.1:3000
# NEXT_PUBLIC_SITE_URL=http://localhost:3001
npm run dev
# Frontend: http://localhost:3001
```

## Next.js Configuration (`next.config.ts`)

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '3000' },
    { protocol: 'http', hostname: 'localhost', port: '3000' },
  ],
  formats: ['image/avif', 'image/webp'],
}
rewrites: [
  { source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` }
]
```

## Critical: server.js File Encoding

`server.js` uses **CRLF line endings + UTF-8 BOM**. The only safe way to edit it programmatically is:

```powershell
$c = [System.IO.File]::ReadAllText('server.js')
$c2 = $c.Replace($oldString, $newString)
[System.IO.File]::WriteAllText('server.js', $c2)
```

Never use PowerShell `Set-Content -NoNewline` or array slicing with `WriteAllLines` — both corrupt the file.
`fsReplace` tool also fails on this file due to CRLF mismatch — always use the .NET method above.
