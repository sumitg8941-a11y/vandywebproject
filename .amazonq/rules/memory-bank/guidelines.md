# Development Guidelines

## Code Quality Standards

### General
- Write the **minimum code needed** — no verbose implementations, no unused helpers
- No comments unless the logic is genuinely non-obvious
- All IDs are lowercase strings — never use MongoDB ObjectIds as public identifiers
- Always validate URL params with `validateId()` before any DB query
- Errors are caught and returned as `{ error: 'message' }` JSON — never expose stack traces

### Naming Conventions
- **Backend files**: PascalCase for models (`Offer.js`, `SiteSettings.js`), camelCase for scripts
- **Frontend files**: PascalCase for components (`OfferViewClient.tsx`), camelCase for utilities
- **Route params**: camelCase (`retailerId`, `countryId`, `offerId`)
- **MongoDB custom IDs**: lowercase, alphanumeric, hyphens only (e.g., `kw`, `dxb`, `r1`, `o20`)
- **Environment variables**: `SCREAMING_SNAKE_CASE`
- **CSS custom properties (admin)**: `--kebab-case`

---

## Backend Patterns (`server.js`)

### Route Structure
Every route follows this exact pattern — no exceptions:

```js
app.get('/api/something/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const result = await Model.findOne({ id: id.toLowerCase() });
        if (!result) return res.status(404).json({ error: 'Not found' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ...' });
    }
});
```

### ID Validation — Always First
```js
function validateId(id) {
    return /^[a-z0-9_-]+$/.test(id) && id.length <= 50;
}
// Use at the top of every route that takes an :id param
if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
```

### Protected Routes — verifyAdmin Middleware
`verifyAdmin` is defined at the TOP of server.js (before any routes) to avoid `const` hoisting issues:

```js
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access Denied: No Token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};
```

### Expiry Filtering — Default Behaviour
All public offer endpoints filter expired offers by default. Always include this pattern:

```js
const filter = { retailerId: retailerId.toLowerCase() };
if (req.query.includeExpired !== 'true') {
    filter.validUntil = { $gte: new Date() };
}
```

### Parallel DB Queries — Use Promise.all
```js
const [retailers, offerCounts] = await Promise.all([
    Retailer.find({ cityId }).lean(),
    Offer.aggregate([...]),
]);
```

### Static File Security
Only these three paths are served statically — never `express.static(__dirname)`:
```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin.html', express.static(path.join(__dirname, 'admin.html')));
app.use('/admin.js', express.static(path.join(__dirname, 'admin.js')));
```

### Mongoose Models
All models follow this pattern:
```js
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // ... fields with defaults
}, { timestamps: true });
module.exports = mongoose.model('ModelName', schema);
```
- Always `{ timestamps: true }` — gives `createdAt` and `updatedAt` for free
- String fields that are IDs: always `lowercase: true, trim: true`
- String fields that are user content: always `trim: true`
- Numeric counters: always `default: 0`

---

## Frontend Patterns (Next.js)

### Server vs Client Component Split
The golden rule: **fetch data in server components, handle interactivity in client components**.

```
page.tsx (server)          OfferViewClient.tsx ('use client')
    │                              │
    ├── fetch data                 ├── useState / useEffect
    ├── generateMetadata           ├── event handlers
    ├── JSON-LD script tag         ├── like/dislike
    └── render <ClientComponent    └── flipbook / share
         offer={data} />
```

Never export `metadata` from a `'use client'` component — split the file instead.

### API URL Pattern — Server vs Client
```ts
// In server components (page.tsx, layout.tsx) — private, not in browser bundle
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// In client components ('use client') — must be NEXT_PUBLIC_
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
```

### Async Params — Next.js 15+ Pattern
Always await params — they are Promises in Next.js 15:
```ts
// CORRECT
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    ...
}

// WRONG (old pattern — causes warnings)
export default async function Page({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params); // don't do this
    ...
}
```

### Data Fetching in Server Components
```ts
async function getData(id: string) {
    try {
        const res = await fetch(`${API}/api/something/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch { return null; }
}
```
- Always `cache: 'no-store'` for dynamic content
- Use `{ next: { revalidate: 300 } }` only for rarely-changing data (e.g., site settings)
- Always return `null` on error — never throw from data fetching functions
- Use `Promise.all` for parallel fetches

### generateMetadata Pattern
```ts
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getData(id);
    if (!data) return { title: 'Not Found' };
    return {
        title: `${data.name} | DealNamaa`,
        description: `...`,
        openGraph: { title: `...`, description: `...`, images: [...] },
    };
}
```

### Image Component Usage
Always use `next/image` with `fill` + `sizes` for responsive images:
```tsx
<div className="relative h-24 overflow-hidden">
    <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 50vw, 20vw"
        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"   // use priority only for above-the-fold hero images
    />
</div>
```

### Tailwind Patterns
- Cards: `bg-white rounded-xl shadow-sm border border-gray-100`
- Hover lift: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- Hero gradient: `bg-gradient-to-br from-red-700 via-red-600 to-orange-500`
- Section max-width: `max-w-6xl mx-auto px-4`
- Scroll anchor offset: `scroll-mt-20` (accounts for sticky header height)
- Responsive grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5`
- Brand red: `red-600` / `red-700` for hover
- Urgency orange: `orange-500`
- Success green: `green-500` / `green-600`

### WhatsApp Share Pattern
```tsx
const whatsappText = encodeURIComponent(`🔥 Check out this deal: ${title}\n${siteUrl}/view/${id}`);
<a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
    <i className="fa-brands fa-whatsapp"></i> Share on WhatsApp
</a>
```

### Breadcrumbs
Always include `<Breadcrumbs type="..." id="..." />` on all deep pages:
- `type="country"` — on cities page
- `type="city"` — on retailers page
- `type="retailer"` — on offers page
- `type="offer"` — on offer view page

---

## Admin Panel Patterns (`admin.js`)

### Tab Rendering Pattern
Every tab renderer is an `async function` that returns an HTML string:
```js
renderSomething: async function() {
    const data = await api.getSomething();
    return `<div>...${data.map(item => `<tr>...</tr>`).join('')}...</div>`;
}
```

### API Calls from Admin
All protected calls include the JWT header:
```js
const res = await fetch('/api/admin/something', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    },
    body: JSON.stringify(payload)
});
if (!res.ok) throw new Error('Failed');
```

### File Upload Pattern
```js
uploadFile: async function(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: formData  // NO Content-Type header — browser sets multipart boundary
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;  // returns '/uploads/timestamp-random.ext'
}
```

### Admin CSS Design System
The admin uses CSS custom properties — always use variables, never hardcode colours:
```css
--red: #dc2626          /* primary action, active state */
--green: #16a34a        /* success, save actions */
--orange: #ea580c       /* warnings, expiring soon */
--blue: #2563eb         /* info */
--sidebar-bg: #0f172a   /* dark sidebar */
--bg: #f0f2f5           /* page background */
--border: #e2e8f0       /* all borders */
--text-primary: #0f172a
--text-secondary: #64748b
--text-muted: #94a3b8
```

---

## Deployment

The `deploy.js` script uses SSH2 to deploy to a remote server:
```
git clean -fd && git stash && git pull
pm2 restart dealnamaa-backend
cd frontend && npm run build && pm2 restart dealnamaa-frontend
```

**Important**: `deploy.js` contains a hardcoded server IP and credentials — **never commit this file** or update it to use environment variables before production use.

Production process names (pm2):
- `dealnamaa-backend` — Express server
- `dealnamaa-frontend` — Next.js server

---

## What NOT To Do

- **Never** use `express.static(__dirname)` — exposes `.env` and source files
- **Never** define `verifyAdmin` after the routes that use it
- **Never** export `metadata` from a `'use client'` component
- **Never** use `Promise.resolve(params)` — await params directly
- **Never** fetch all retailers without `?limit=N` on the homepage — DB grows over time
- **Never** show expired offers to users — always filter `validUntil >= new Date()`
- **Never** use `NEXT_PUBLIC_` env vars in server components for internal URLs
- **Never** hardcode `localhost:3000` in frontend code — use env vars
- **Never** skip `validateId()` on route params — prevents injection attacks
- **Never** touch `tmpsrc/` — it is dead code and should eventually be deleted
