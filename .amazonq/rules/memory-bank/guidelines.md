# Development Guidelines

## Code Quality Standards

### Formatting and Structure
- **Indentation**: 4 spaces for backend JavaScript, 2 spaces for frontend TypeScript/TSX
- **Line Endings**: CRLF (Windows-style) used throughout the codebase
- **Semicolons**: Required in backend code, optional in frontend (follows Next.js conventions)
- **Quotes**: Single quotes for backend JavaScript, single quotes for frontend TypeScript/JSX
- **Trailing Commas**: Not used in backend, optional in frontend

### File Organization
- **Backend Models**: One model per file, named after the entity (e.g., `Retailer.js`, `Offer.js`)
- **Frontend Components**: Capitalized filenames for React components (e.g., `SearchBar.tsx`, `Breadcrumbs.tsx`)
- **Frontend Pages**: Lowercase `page.tsx` for route pages following Next.js App Router conventions
- **Configuration Files**: Root-level for backend, `frontend/` subdirectory for frontend configs

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `validateId`, `getCountries`, `retailerSchema`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`)
- **React Components**: PascalCase (e.g., `SearchBar`, `HomePage`, `RootLayout`)
- **Database IDs**: lowercase with hyphens or underscores (e.g., `id: { lowercase: true, trim: true }`)
- **API Routes**: kebab-case with resource-based naming (e.g., `/api/offer/:id/like`)

### Documentation Standards
- **Inline Comments**: Section headers with emoji for visual organization in backend
  ```javascript
  // ==========================================
  // 🛡️ SECURITY MIDDLEWARES
  // ==========================================
  ```
- **Code Comments**: Minimal, used only for clarification or important notes
- **Schema Comments**: Inline comments for field purposes in Mongoose models
- **TypeScript**: Type annotations for function parameters and return values

## Architectural Patterns

### Backend (Express/Node.js)

#### API Route Structure
```javascript
// Pattern: Validate input → Query database → Return JSON
app.get('/api/resource/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const resource = await Model.findOne({ id: id.toLowerCase() });
        if (!resource) return res.status(404).json({ error: 'Not found' });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});
```

#### Input Validation Pattern
- Always validate user input before database operations
- Use regex validation for IDs: `/^[a-z0-9_-]+$/`
- Limit string lengths to prevent abuse (e.g., `query.substring(0, 100)`)
- Lowercase and trim all ID fields for consistency

#### Error Handling Pattern
- Try-catch blocks for all async operations
- Consistent error response format: `{ error: 'message' }`
- HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- Generic error messages to avoid information leakage

#### Authentication Pattern
```javascript
// JWT-based authentication with middleware
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

#### Database Query Patterns
- Use `.lean()` for read-only queries to improve performance
- Use `.findOneAndUpdate()` with `{ new: true }` for atomic updates
- Use `$inc` operator for counter increments (clicks, likes, visits)
- Use `$max` operator for tracking maximum values
- Sort by date descending for time-sensitive data: `.sort({ validUntil: -1 })`

### Frontend (Next.js/React)

#### Server Component Pattern
```typescript
// Async server components for data fetching
async function getData() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/endpoint', { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function Page() {
  const data = await getData();
  
  // Handle null/empty states
  if (data === null) {
    return <ErrorDisplay />;
  }
  
  return <DataDisplay data={data} />;
}
```

#### Component Structure Pattern
- Server components by default (no 'use client' directive)
- Client components only when needed for interactivity
- Async/await for data fetching in server components
- Error boundaries with user-friendly messages

#### Styling Pattern
- Tailwind CSS utility classes for all styling
- Responsive design with mobile-first approach: `sm:`, `md:`, `lg:` breakpoints
- Hover states for interactive elements: `hover:shadow-2xl`, `hover:-translate-y-1`
- Transition classes for smooth animations: `transition-all duration-300`
- Color scheme: Red primary (`red-600`), yellow accent (`yellow-400`), gray neutrals

#### Link Navigation Pattern
```typescript
import Link from 'next/link';

// Use Next.js Link for internal navigation
<Link href={`/resource/${item.id || item._id}`}>
  <div className="cursor-pointer hover:shadow-lg transition">
    {/* Content */}
  </div>
</Link>
```

### Database (Mongoose/MongoDB)

#### Schema Definition Pattern
```javascript
const schema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    name: { type: String, required: true, trim: true },
    clicks: { type: Number, default: 0 },
    // Relationship fields use lowercase IDs
    parentId: { type: String, required: true, lowercase: true, trim: true }
}, { timestamps: true });
```

#### Schema Best Practices
- Always include `id` field as string (not ObjectId) for URL-friendly identifiers
- Use `lowercase: true` and `trim: true` for all ID fields
- Include `timestamps: true` for automatic createdAt/updatedAt
- Default values for optional fields (e.g., `default: 0` for counters)
- Relationship fields named with suffix `Id` (e.g., `cityId`, `retailerId`)

## Security Practices

### Middleware Stack
```javascript
// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));

// CORS for cross-origin requests
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body size limits
app.use(express.json({ limit: '10kb' }));
```

### Environment Variables
- Store sensitive data in `.env` file (never commit to version control)
- Use `dotenv` package: `require('dotenv').config()`
- Provide defaults for non-sensitive values: `process.env.PORT || 3000`
- Required variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`

### Input Sanitization
- Escape regex special characters in search queries
- Validate ID format before database queries
- Limit query string lengths
- Use parameterized queries (Mongoose handles this automatically)

## Common Code Idioms

### Async/Await Error Handling
```javascript
// Backend pattern
try {
    const result = await Model.findOne({ id });
    res.json(result);
} catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
}

// Frontend pattern
try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json();
} catch (error) {
    return null;
}
```

### Conditional Rendering (Frontend)
```typescript
{data === null ? (
  <ErrorState />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <DataDisplay data={data} />
)}
```

### Array Mapping with Type Safety
```typescript
{items.map((item: any) => (
  <Component key={item.id || item._id} data={item} />
))}
```

### URL Construction with UTM Parameters
```javascript
try {
    const urlObj = new URL(dest);
    urlObj.searchParams.set('utm_source', 'DealNamaa');
    urlObj.searchParams.set('utm_medium', 'coupon_link');
    urlObj.searchParams.set('utm_campaign', 'retailer_traffic');
    dest = urlObj.toString();
} catch(e) {
    // Invalid URL format, use raw
}
```

## API Usage Patterns

### Fetch with Error Handling
```typescript
async function fetchData() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/endpoint', { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    return null;
  }
}
```

### Protected Route Pattern
```javascript
// Apply verifyAdmin middleware to protected routes
app.post('/api/admin/resource', verifyAdmin, async (req, res) => {
    // Admin-only logic
});
```

### File Upload Pattern
```javascript
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', verifyAdmin, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: '/uploads/' + req.file.filename });
});
```

## Testing and Deployment

### Development Workflow
1. Backend runs on port 3000: `npm start` (runs `node server.js`)
2. Frontend runs on port 3001: `cd frontend && npm run dev`
3. MongoDB must be running and accessible via `MONGO_URI`

### Deployment Pattern
- SSH-based deployment using `ssh2` package
- Git-based workflow: clean, stash, pull, restart
- PM2 process manager for backend: `pm2 restart dealnamaa-backend`
- Deployment script: `node deploy.js`

### Error Logging
- Console logging for development: `console.log()`, `console.error()`
- Structured error messages with context
- Global error handler middleware for Express

## Performance Optimizations

### Database Queries
- Use `.lean()` for read-only queries (prevents Mongoose overhead)
- Index frequently queried fields (id, cityId, retailerId)
- Limit result sets with `.limit()` for top performers
- Use projection to fetch only needed fields

### Frontend Optimizations
- Server-side rendering for initial page load
- `cache: 'no-store'` for dynamic data
- Image optimization with Next.js Image component (when used)
- Font optimization with `next/font/google`

### Caching Strategy
- No caching for dynamic data (`cache: 'no-store'`)
- Static assets served from `/public` directory
- CDN for Font Awesome icons

## Accessibility and UX

### Icon Usage
- Font Awesome 6.4.0 for all icons
- Semantic icon usage: `fa-home`, `fa-magnifying-glass`, `fa-triangle-exclamation`
- Icons paired with text for clarity

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Grid layouts: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- Flexible containers: `max-w-6xl mx-auto`
- Overflow handling: `overflow-x-auto whitespace-nowrap`

### User Feedback
- Loading states for async operations
- Error states with helpful messages
- Empty states with actionable guidance
- Success confirmations for user actions
