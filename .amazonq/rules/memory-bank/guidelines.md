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

### CRITICAL: Editing server.js

`server.js` uses CRLF line endings + UTF-8 BOM. The only safe edit method is .NET `ReadAllText`/`WriteAllText`:

```powershell
$f = 'server.js'
$c = [System.IO.File]::ReadAllText($f)
$c2 = $c.Replace($oldString, $newString)
[System.IO.File]::WriteAllText($f, $c2)
```

**Never use**:
- PowerShell `Set-Content -NoNewline` — collapses entire file to one line
- PowerShell array slicing + `WriteAllLines` — produces empty file
- `fsReplace` tool — fails silently due to CRLF mismatch

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
if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
```

### Protected Routes — verifyAdmin Middleware
`verifyAdmin` is defined at the TOP of server.js (before any routes):

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

### Rate Limiting
Two limiters are applied:
```js
// General — all /api routes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use('/api', limiter);

// Strict — tracking routes only (prevents stat inflation)
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use('/api/track', trackLimiter);
```

### Expiry Filtering — Default Behaviour
All public offer endpoints filter expired offers by default:

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
Only these paths are served statically — never `express.static(__dirname)`:
```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin.html', express.static(path.join(__dirname, 'admin.html')));
app.use('/admin.js', express.static(path.join(__dirname, 'admin.js')));
app.use('/data.js', express.static(path.join(__dirname, 'data.js')));
```

### Mongoose Models
```js
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // ... fields with defaults
}, { timestamps: true });
module.exports = mongoose.model('ModelName', schema);
```
- Always `{ timestamps: true }` — gives `createdAt` and `updatedAt` for free
- String ID fields: always `lowercase: true, trim: true`
- String content fields: always `trim: true`
- Numeric counters: always `default: 0`

---

## Frontend Patterns (Next.js)

### Server vs Client Component Split
```
page.tsx (server)          OfferViewClient.tsx ('use client')
    │                              │
    ├── fetch data                 ├── useState / useEffect
    ├── generateMetadata           ├── event handlers
    ├── JSON-LD script tag         ├── like/dislike
    └── render <ClientComponent    └── flipbook / share / tracking
         offer={data} />
```

Never export `metadata` from a `'use client'` component — split the file instead.

### API URL Pattern — Server vs Client
```ts
// Server components (page.tsx, layout.tsx) — stays private, not in browser bundle
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// Client components ('use client') — must be NEXT_PUBLIC_
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
```

### Async Params — Next.js 15+ Pattern
```ts
// CORRECT
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

### Image Usage — Always SafeImage
Never use `next/image` directly. Always use `SafeImage` from `./SafeImage`:

```tsx
import SafeImage from '../SafeImage';

<div className="relative h-24 overflow-hidden">
    <SafeImage
        src={item.image}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 50vw, 20vw"
        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
    />
</div>
```

`SafeImage` catches `onError` and swaps to an inline SVG "No Image" placeholder. Use `priority` (not `loading="lazy"`) only for above-the-fold hero images.

### Tracking — Always Use Tracker Component
Never call tracking endpoints directly from page components. Use `<Tracker>`:

```tsx
import Tracker from '../Tracker';

// In JSX — renders null, fires once per session via sessionStorage dedup
<Tracker type="retailer" id={retailerId} />
```

Types: `'visit'` (no id needed) | `'country'` | `'city'` | `'retailer'` | `'offer'`

`visit` is already placed in `layout.tsx` — do not add it elsewhere.

### Language System — Always useLang()
Never use independent `useState` for language. Always consume from context:

```tsx
import { useLang } from './LangToggle';

export default function MyComponent() {
    const { t } = useLang();
    return <h1>{t.heroTitle}</h1>;
}
```

Adding new strings: add to both `en` and `ar` objects in `LangToggle.tsx` only.

### Tailwind Patterns
- Cards: `bg-white rounded-xl shadow-sm border border-gray-100`
- Hover lift: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- Hero gradient: `bg-gradient-to-br from-red-700 via-red-600 to-orange-500`
- Section max-width: `max-w-6xl mx-auto px-4`
- Scroll anchor offset: `scroll-mt-20`
- Responsive grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5`
- Brand red: `red-600` / `red-700` for hover
- Urgency orange: `orange-500`
- Success green: `green-500` / `green-600`

### Breadcrumbs
Always include `<Breadcrumbs type="..." id="..." />` on all deep pages:
- `type="country"` — on cities page
- `type="city"` — on retailers page
- `type="retailer"` — on offers page
- `type="offer"` — on offer view page

### WhatsApp Share Pattern
```tsx
const whatsappText = encodeURIComponent(`🔥 Check out this deal: ${title}\n${siteUrl}/view/${id}`);
<a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
    Share on WhatsApp
</a>
```

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

### Adding a New Tab
1. Add button in `admin.html` sidebar with `onclick="admin.showTab('tabname', event)"`
2. Add `case 'tabname':` in `showTab()` switch in `admin.js`
3. Create `renderTabname: async function()` in `admin.js`
4. Add corresponding API endpoints in `server.js`

### Stats Date Range
```js
// State
admin._statsSince = 0;   // 0 = all time, 7 = last 7 days, 30 = last 30 days
admin._statsFrom = null; // 'YYYY-MM-DD' for custom range
admin._statsTo = null;   // 'YYYY-MM-DD' for custom range

// Load
admin.loadStats(since, from, to);  // pass null for since when using custom range
admin.applyCustomStats();           // reads #stats-from and #stats-to inputs
```

### API Calls from Admin
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
const formData = new FormData();
formData.append('file', file);
const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
    body: formData  // NO Content-Type header — browser sets multipart boundary
});
const data = await res.json();
return data.url;  // '/uploads/timestamp-random.ext' or R2 URL
```

### Admin CSS Design System
Always use CSS variables — never hardcode colours:
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

## What NOT To Do

- **Never** use `express.static(__dirname)` — exposes `.env` and source files
- **Never** define `verifyAdmin` after the routes that use it
- **Never** export `metadata` from a `'use client'` component
- **Never** use `Promise.resolve(params)` — await params directly in Next.js 15+
- **Never** use `next/image` directly — always use `SafeImage` for fallback handling
- **Never** call tracking endpoints directly — always use `<Tracker>` component
- **Never** use independent `useState` for language — always use `useLang()` from context
- **Never** show expired offers to users — always filter `validUntil >= new Date()`
- **Never** use `NEXT_PUBLIC_` env vars in server components for internal URLs
- **Never** hardcode `localhost:3000` in frontend code — use env vars
- **Never** skip `validateId()` on route params — prevents injection attacks
- **Never** edit `server.js` with PowerShell `Set-Content` or array slicing — use .NET `ReadAllText`/`WriteAllText`
