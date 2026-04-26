# Technology Stack

## Programming Languages
- **JavaScript (Node.js)**: Backend server and API (CommonJS modules)
- **TypeScript**: Frontend application with strict type checking
- **CSS**: Styling via Tailwind CSS v4

## Backend Technologies

### Core Framework
- **Express.js 5.2.1**: Web application framework
- **Node.js**: Runtime environment (CommonJS module system)

### Database
- **MongoDB 7.1.1**: NoSQL database
- **Mongoose 9.4.1**: ODM (Object Data Modeling) library
- **BSON 7.2.0**: Binary JSON for MongoDB

### Security
- **Helmet 8.1.0**: Security headers middleware
- **CORS 2.8.6**: Cross-Origin Resource Sharing
- **express-rate-limit 8.3.2**: Rate limiting middleware
- **jsonwebtoken 9.0.3**: JWT authentication
- **dotenv 17.4.2**: Environment variable management

### File Handling
- **Multer 2.1.1**: Multipart/form-data file uploads
- **fs (built-in)**: File system operations

### Utilities
- **body-parser 2.2.2**: Request body parsing
- **cookie-parser**: Cookie handling (via cookie 0.7.2)
- **ssh2 1.17.0**: SSH2 protocol support

## Frontend Technologies

### Core Framework
- **Next.js 16.2.4**: React framework with App Router
- **React 19.2.4**: UI library
- **React DOM 19.2.4**: React rendering

### Styling
- **Tailwind CSS 4.x**: Utility-first CSS framework
- **@tailwindcss/postcss 4.x**: PostCSS integration
- **PostCSS**: CSS transformation

### TypeScript
- **TypeScript 5.x**: Type-safe JavaScript
- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions
- **@types/react-dom**: React DOM type definitions

### Third-Party Integrations
- **@next/third-parties 16.2.4**: Third-party script optimization

### Development Tools
- **ESLint 9.x**: Code linting
- **eslint-config-next 16.2.4**: Next.js ESLint configuration

## Development Commands

### Backend
```bash
# Install dependencies
npm install

# Start production server
npm start
# Runs: node server.js
# Server listens on PORT (default: 3000)
# Serves admin interface at http://localhost:3000/admin.html

# Development (manual)
node server.js
```

### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
# Runs: next dev
# Opens on http://localhost:3000

# Production build
npm run build
# Runs: next build

# Start production server
npm start
# Runs: next start

# Lint code
npm run lint
# Runs: eslint
```

## Environment Variables

### Required (.env file)
```
MONGO_URI=mongodb://localhost:27017/dealnamaa
JWT_SECRET=your_secret_key
ADMIN_USER=admin
ADMIN_PASS=secure_password
PORT=3000
```

## Database Schema

### Collections
- **countries**: Country entities with id, name, flag
- **states**: State/region entities linked to countries
- **cities**: City entities linked to countries
- **retailers**: Retailer entities with category, location
- **offers**: Promotional offers with PDFs, coupons, links
- **sitestats**: Global analytics (visits, clicks)
- **feedbacks**: User feedback submissions

## API Endpoints

### Public Routes
- `GET /api/health` - Health check
- `GET /api/countries` - List countries
- `GET /api/regions/:countryId` - Get states or cities
- `GET /api/cities/:countryId` - Get cities by country
- `GET /api/retailers/:cityId` - Get retailers by city
- `GET /api/retailer/:id` - Get single retailer
- `GET /api/offers/:retailerId` - Get offers by retailer
- `GET /api/offer/:id` - Get single offer
- `GET /api/search?q=query` - Global search
- `POST /api/offer/:id/like` - Like offer
- `POST /api/offer/:id/dislike` - Dislike offer
- `GET /api/redirect/offer/:id` - Tracked redirect
- `POST /api/track/*` - Analytics tracking
- `POST /api/feedback` - Submit feedback

### Admin Routes (JWT Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/feedback` - Get all feedback
- `POST /api/upload` - Upload files
- `POST /api/countries` - Create country
- `POST /api/states` - Create state
- `POST /api/cities` - Create city
- `POST /api/retailers` - Create retailer
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/*/:id` - Delete entities
- `GET /api/stats` - Global statistics

## Build System
- **Backend**: No build step (Node.js CommonJS)
- **Frontend**: Next.js build system with Turbopack (dev) and Webpack (production)
- **Admin Interface**: Static HTML/JS served via Express static middleware

## Deployment
- Backend runs on port 3000 (configurable via PORT env var)
- Frontend can be deployed to Vercel or self-hosted
- Admin interface accessible at `/admin.html` when backend is running
- MongoDB connection required for both environments
- File uploads stored in /uploads directory (requires persistent storage)
