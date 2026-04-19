require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const app = express();

// ==========================================
// 🛡️ SECURITY MIDDLEWARES
// ==========================================
// 1. Helmet: Secures HTTP headers from known web vulnerabilities
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));

// 2. CORS: Controls Cross-Origin Resource Sharing (Allows your frontend to talk to your backend safely)
app.use(cors());

// 3. Rate Limiting: Prevents brute-force and DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// 4. Body Parser with limit: Prevents attackers from sending huge payloads to crash the server
app.use(express.json({ limit: '10kb' }));

// ==========================================
// 💾 DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Securely connected to MongoDB (DealNamaa Database)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// 🌐 ROUTES & STATIC FILES
// ==========================================
// Serve our front-end HTML, CSS, and JS files securely
app.use(express.static(__dirname));

// Import Database Models
const Country = require('./Country');
const City = require('./City');
const Retailer = require('./Retailer');
const Offer = require('./Offer');
const SiteStat = require('./SiteStat');

app.get('/api/health', (req, res) => {
    res.json({ status: 'secure', message: 'DealNamaa API is running safely!' });
});

app.post('/api/track/offer-stats/:id', async (req, res) => {
    try {
        const { duration, maxPage } = req.body;
        await Offer.findOneAndUpdate(
            { id: req.params.id }, 
            { 
                $inc: { totalTimeSeconds: duration },
                $max: { maxPagesViewed: maxPage } // Only updates if the new page is higher
            }
        );
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

// ==========================================
// 🚀 API ENDPOINTS (READ OPERATIONS)
// ==========================================

// 1. Get all countries
app.get('/api/countries', async (req, res) => {
    try {
        const countries = await Country.find();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// 2. Get cities by country ID
app.get('/api/cities/:countryId', async (req, res) => {
    try {
        const cities = await City.find({ countryId: req.params.countryId.toLowerCase() });
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// 3. Get retailers by city ID
app.get('/api/retailers/:cityId', async (req, res) => {
    try {
        const retailers = await Retailer.find({ cityId: req.params.cityId.toLowerCase() });
        res.json(retailers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});

// Get Single Retailer Detail (For Website Link)
app.get('/api/retailer/:id', async (req, res) => {
    try {
        const retailer = await Retailer.findOne({ id: req.params.id.toLowerCase() });
        res.json(retailer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailer details' });
    }
});

// Get Single Offer Detail
app.get('/api/offer/:id', async (req, res) => {
    try {
        const offer = await Offer.findOne({ id: req.params.id.toLowerCase() });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        res.json(offer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offer details' });
    }
});

// Tracking Redirect for outbound traffic
app.get('/api/redirect/offer/:id', async (req, res) => {
    try {
        const offer = await Offer.findOne({ id: req.params.id.toLowerCase() });
        if (!offer) return res.status(404).send('Offer not found');
        
        // Track the click
        offer.clicks += 1;
        await offer.save();

        // Determine destination
        let dest = offer.couponUrl || offer.externalAdLink || offer.pdfUrl;
        if (!dest || dest === '#') {
            return res.status(400).send('No valid destination link for this offer');
        }
        
        // Append UTM tags so end retailers know the traffic came from DealNamaa
        try {
            const urlObj = new URL(dest);
            urlObj.searchParams.set('utm_source', 'DealNamaa');
            urlObj.searchParams.set('utm_medium', 'coupon_link');
            urlObj.searchParams.set('utm_campaign', 'retailer_traffic');
            dest = urlObj.toString();
        } catch(e) {
            // Invalid URL format, just use raw
        }
        
        res.redirect(dest);
    } catch (err) {
        res.status(500).send('Error processing redirect');
    }
});

// 4. Get offers by retailer ID
app.get('/api/offers/:retailerId', async (req, res) => {
    try {
        // Fetch offers and automatically sort them from newest to oldest based on the date
        const offers = await Offer.find({ retailerId: req.params.retailerId.toLowerCase() }).sort({ date: -1 });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// 5. Admin: Get all cities for the dashboard
app.get('/api/cities', async (req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Admin: Get all retailers
app.get('/api/retailers', async (req, res) => {
    try {
        const retailers = await Retailer.find();
        res.json(retailers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});

// Admin: Get all offers
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find().sort({ date: -1 });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// Admin: Get Global Stats
app.get('/api/stats', async (req, res) => {
    try {
        const globalStat = await SiteStat.findOne({ id: 'global' });
        const topRetailers = await Retailer.find().sort({ clicks: -1 }).limit(5);
        const topOffers = await Offer.find().sort({ clicks: -1 }).limit(5);
        
        res.json({
            visits: globalStat ? globalStat.visits : 0,
            topRetailers,
            topOffers
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ==========================================
// 📊 API ENDPOINTS (TRACKING / ANALYTICS)
// ==========================================
app.post('/api/track/visit', async (req, res) => {
    try {
        await SiteStat.findOneAndUpdate({ id: 'global' }, { $inc: { visits: 1 } }, { upsert: true });
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

app.post('/api/track/retailer/:id', async (req, res) => {
    try {
        await Retailer.findOneAndUpdate({ id: req.params.id }, { $inc: { clicks: 1 } });
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

app.post('/api/track/offer/:id', async (req, res) => {
    try {
        await Offer.findOneAndUpdate({ id: req.params.id }, { $inc: { clicks: 1 } });
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

// ==========================================
// 🔒 ADMIN AUTHENTICATION
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'dealnamaa_secure_token_123!';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

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

// ==========================================
// 📝 API ENDPOINTS (WRITE OPERATIONS & UPLOADS)
// ==========================================

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer for physical file uploads
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

// Admin: Upload physical file (Image/PDF)
app.post('/api/upload', verifyAdmin, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: '/uploads/' + req.file.filename });
});

// Admin: Create new Country securely
app.post('/api/countries', verifyAdmin, async (req, res) => {
    try {
        const newCountry = new Country(req.body);
        await newCountry.save(); // Permanently saves to MongoDB!
        res.status(201).json(newCountry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new City securely
app.post('/api/cities', verifyAdmin, async (req, res) => {
    try {
        const newCity = new City(req.body);
        await newCity.save();
        res.status(201).json(newCity);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new Retailer securely
app.post('/api/retailers', verifyAdmin, async (req, res) => {
    try {
        const newRetailer = new Retailer(req.body);
        await newRetailer.save();
        res.status(201).json(newRetailer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new Offer securely
app.post('/api/offers', verifyAdmin, async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Secure Server running on http://localhost:${PORT}`);
});