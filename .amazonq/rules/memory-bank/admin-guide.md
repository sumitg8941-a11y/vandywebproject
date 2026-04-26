# Admin Interface Quick Reference

## Access

**URL**: `http://localhost:3000/admin.html`  
**Authentication**: JWT-based login  
**Default Credentials**: Set in `.env` file (`ADMIN_USER` and `ADMIN_PASS`)

## Architecture

### Files
- **admin.html**: Main interface HTML structure
- **admin.js**: Client-side JavaScript logic
- **server.js**: Backend API endpoints

### Technology Stack
- Vanilla JavaScript (no framework)
- Fetch API for backend communication
- JWT tokens stored in localStorage
- Express static middleware for serving

## Features

### 1. Countries Management
- View all countries
- Add new country (ID, name, image)
- Upload country flag/image
- Delete countries

### 2. Cities Management
- View all cities
- Add new city (ID, name, country, image)
- Link cities to countries
- Delete cities

### 3. Retailers Management
- View all retailers
- Add new retailer (ID, name, website, city, logo)
- Upload retailer logos
- Delete retailers

### 4. Offers & PDFs Management
- View all offers
- Add new offer with:
  - Title and ID
  - Validity dates (from/until)
  - PDF flyer upload
  - Cover image upload
  - Badge text
  - Retailer association
- Edit existing offers
- Delete offers

### 5. Statistics Dashboard
- Total website visits
- Top clicked retailers
- Top clicked offers
- Real-time analytics from MongoDB

### 6. Feedback Viewer
- View user feedback submissions
- See user name, email, and message
- Date-sorted feedback list

## API Endpoints Used

### Authentication
- `POST /api/admin/login` - Admin login

### Public Endpoints
- `GET /api/countries` - List countries
- `GET /api/cities` - List all cities
- `GET /api/retailers` - List all retailers
- `GET /api/offers` - List all offers
- `GET /api/stats` - Get statistics

### Protected Endpoints (Require JWT)
- `POST /api/upload` - Upload files
- `POST /api/countries` - Create country
- `POST /api/cities` - Create city
- `POST /api/retailers` - Create retailer
- `POST /api/offers` - Create offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/countries/:id` - Delete country
- `DELETE /api/cities/:id` - Delete city
- `DELETE /api/retailers/:id` - Delete retailer
- `DELETE /api/offers/:id` - Delete offer
- `GET /api/admin/feedback` - Get all feedback

## File Upload System

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF

### Upload Process
1. User selects file in admin form
2. File sent to `/api/upload` endpoint
3. Multer middleware processes upload
4. File saved to `/uploads` directory
5. Server returns file URL
6. URL stored in MongoDB with entity

### File Storage
- **Location**: `/uploads` directory in project root
- **Naming**: `timestamp-randomnumber.extension`
- **Access**: Served via Express static middleware

## Security Features

### JWT Authentication
- Token generated on successful login
- Token stored in localStorage
- Token sent in Authorization header: `Bearer <token>`
- Token expires after 12 hours

### Input Validation
- ID format validation (lowercase, alphanumeric, hyphens)
- Required field checks
- File type validation
- Size limits on uploads (10kb for JSON, configurable for files)

### Rate Limiting
- 1000 requests per 15 minutes per IP
- Applied to all `/api` routes

## Common Tasks

### Adding a New Country
1. Click "Manage Countries"
2. Click "+ Add Country"
3. Enter country code (e.g., "kw")
4. Enter country name (e.g., "Kuwait")
5. Upload flag image or provide URL
6. Click "Save Country"

### Adding a New Offer
1. Click "Manage Offers & PDFs"
2. Click "+ Add New Offer"
3. Fill in offer details:
   - Offer ID (unique)
   - Title
   - Valid from/until dates
   - Select retailer
   - Upload PDF flyer (optional)
   - Upload cover image (optional)
   - Add badge text (optional)
4. Click "Save Offer"

### Editing an Offer
1. Click "Manage Offers & PDFs"
2. Find offer in table
3. Click "Edit" button
4. Modify fields as needed
5. Click "Update Offer"

### Viewing Statistics
1. Click "Statistics" in sidebar
2. View total visits
3. See top retailers by clicks
4. See top offers by clicks

## Troubleshooting

### Login Issues
- **Problem**: "Invalid credentials"
- **Solution**: Check `.env` file for correct `ADMIN_USER` and `ADMIN_PASS`

### File Upload Fails
- **Problem**: "Failed to upload file"
- **Solution**: 
  - Check `/uploads` directory exists
  - Verify file size is reasonable
  - Check file type is supported
  - Ensure JWT token is valid

### Data Not Loading
- **Problem**: "Loading data from MongoDB..."
- **Solution**:
  - Verify MongoDB is running
  - Check `MONGO_URI` in `.env`
  - Check server.js console for errors

### Token Expired
- **Problem**: "Invalid Token" or "Access Denied"
- **Solution**: Logout and login again (tokens expire after 12 hours)

## Development Notes

### Modifying Admin Interface
1. Edit `admin.html` for structure changes
2. Edit `admin.js` for functionality changes
3. No build step required - changes are immediate
4. Refresh browser to see updates

### Adding New Admin Features
1. Add new tab button in `admin.html` sidebar
2. Create render function in `admin.js` (e.g., `renderNewFeature()`)
3. Add case in `showTab()` switch statement
4. Create corresponding API endpoints in `server.js`

### Styling
- Uses inline styles and CSS classes from `styles.css` (if present)
- Can be enhanced with external CSS framework
- Current design is functional and responsive

## Best Practices

1. **Always backup database** before bulk deletions
2. **Test file uploads** with small files first
3. **Use descriptive IDs** (lowercase, hyphenated)
4. **Set realistic validity dates** for offers
5. **Optimize images** before uploading (reduce file size)
6. **Keep JWT token secure** (don't share localStorage)
7. **Logout when done** to invalidate token

## Future Enhancements

Potential improvements for the admin interface:

1. **Bulk Operations**: Upload multiple offers at once
2. **Image Optimization**: Automatic image compression
3. **Search/Filter**: Find entities quickly in large tables
4. **Sorting**: Sort tables by different columns
5. **Pagination**: Handle large datasets efficiently
6. **Preview**: Preview offers before publishing
7. **Scheduling**: Schedule offers to go live automatically
8. **Audit Log**: Track who changed what and when
9. **Role-Based Access**: Different permission levels
10. **Dark Mode**: Theme toggle for admin interface

## Support

For issues or questions:
1. Check server.js console logs
2. Check browser console for JavaScript errors
3. Verify MongoDB connection
4. Review API endpoint responses in Network tab
5. Consult project documentation in `.amazonq/rules/memory-bank/`
