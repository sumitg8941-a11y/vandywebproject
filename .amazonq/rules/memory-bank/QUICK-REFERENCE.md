# DealNamaa Project Quick Reference

## 🚀 Quick Start

### Backend (Port 3000)
```bash
npm install
npm start
```
**Access**: http://localhost:3000

### Frontend (Port 3001)
```bash
cd frontend
npm install
npm run dev
```
**Access**: http://localhost:3001

### Admin Interface
**Access**: http://localhost:3000/admin.html  
**Credentials**: Set in `.env` file

## 📁 Project Structure

```
DealNamaa/
├── 🎨 Frontend (Next.js)
│   └── frontend/
│       ├── app/          # Pages & components
│       └── public/       # Static assets
│
├── ⚙️ Backend (Express)
│   ├── server.js         # Main API server
│   ├── *.js              # Mongoose models
│   └── admin.html/js     # Admin interface
│
├── 📦 Data
│   ├── uploads/          # User uploads
│   └── MongoDB           # Database
│
└── 📚 Documentation
    └── .amazonq/rules/memory-bank/
```

## 🔑 Key Files

| File | Purpose | Port |
|------|---------|------|
| `server.js` | Express API + Static files | 3000 |
| `frontend/app/page.tsx` | Homepage | 3001 |
| `admin.html` | Admin dashboard | 3000 |
| `Country.js` | Country model | - |
| `Retailer.js` | Retailer model | - |
| `Offer.js` | Offer model | - |

## 🌐 API Endpoints

### Public
- `GET /api/countries` - List countries
- `GET /api/cities/:countryId` - List cities
- `GET /api/retailers/:cityId` - List retailers
- `GET /api/offers/:retailerId` - List offers
- `GET /api/search?q=query` - Search

### Admin (JWT Required)
- `POST /api/admin/login` - Login
- `POST /api/upload` - Upload files
- `POST /api/countries` - Create country
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/*/:id` - Delete entity

## 🗄️ Database Schema

```
Country → State/Region → City → Retailer → Offer
```

### Models
- **Country**: id, name, image
- **State**: id, name, countryId, image
- **City**: id, name, countryId, image
- **Retailer**: id, name, cityId, websiteUrl, image, clicks
- **Offer**: id, title, retailerId, pdfUrl, image, badge, validFrom, validUntil, clicks, likes, dislikes

## 🔐 Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/dealnamaa
JWT_SECRET=your_secret_key
ADMIN_USER=admin
ADMIN_PASS=secure_password
PORT=3000
```

## 🛠️ Common Commands

### Development
```bash
# Start backend
npm start

# Start frontend
cd frontend && npm run dev

# Seed database
node seed.js
```

### Database
```bash
# Start MongoDB
mongod

# Connect to MongoDB
mongosh

# Use DealNamaa database
use dealnamaa
```

### Deployment
```bash
# Deploy to server
node deploy.js
```

## 📊 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- Helmet (security)

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

### Admin
- Vanilla JavaScript
- Fetch API
- JWT tokens

## 🎯 Key Features

### User Features
- Geographic navigation (Country → City → Retailer)
- Search retailers and offers
- View PDF flyers
- Like/dislike offers
- Tracked redirect links

### Admin Features
- CRUD for all entities
- File upload (PDFs, images)
- Analytics dashboard
- Feedback management
- Top performers tracking

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| `guidelines.md` | Coding standards |
| `product.md` | Product overview |
| `structure.md` | Project structure |
| `tech.md` | Technology stack |
| `admin-guide.md` | Admin interface guide |
| `cleanup-2025.md` | Cleanup record |

## 🚨 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists
- Check port 3000 is available

### Frontend won't start
- Run `npm install` in frontend/
- Check port 3001 is available
- Verify Node.js version (16+)

### Admin login fails
- Check `ADMIN_USER` and `ADMIN_PASS` in `.env`
- Clear browser localStorage
- Check JWT_SECRET is set

### Database connection fails
- Start MongoDB: `mongod`
- Check MONGO_URI in `.env`
- Verify MongoDB is accessible

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000/api |
| Admin Dashboard | http://localhost:3000/admin.html |
| MongoDB | mongodb://localhost:27017 |

## 📞 Quick Help

### Need to...
- **Add a country?** → Admin → Manage Countries → + Add
- **Upload an offer?** → Admin → Manage Offers → + Add
- **View statistics?** → Admin → Statistics
- **Check feedback?** → Admin → Feedback
- **Search code?** → Use VS Code search (Ctrl+Shift+F)

## 🎓 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### MongoDB
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

### Express
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Express API](https://expressjs.com/en/4x/api.html)

## ✅ Project Status

- ✅ Backend: Fully functional
- ✅ Frontend: Fully functional
- ✅ Admin: Fully functional
- ✅ Database: MongoDB connected
- ✅ Documentation: Up to date
- ✅ Legacy files: Cleaned up

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready
