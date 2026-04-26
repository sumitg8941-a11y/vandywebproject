﻿require('dotenv').config();
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
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

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
app.use(express.static(__dirname));

// Import Database Models
const Country = require('./Country');
const State = require('./State');
const City = require('./City');
const Retailer = require('./Retailer');
const Offer = require('./Offer');
const SiteStat = require('./SiteStat');
const Feedback = require('./Feedback');

// ==========================================
// 🔧 INPUT VALIDATION HELPER
// ==========================================
function validateId(id) {
    return /^[a-z0-9_-]+$/.test(id) && id.length <= 50;
}

// ==========================================
// 🚀 API ENDPOINTS
// ==========================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'secure', message: 'DealNamaa API is running safely!' });
});

// Track offer stats
app.post('/api/track/offer-stats/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const { duration, maxPage } = req.body;
        await Offer.findOneAndUpdate(
            { id: id.toLowerCase() }, 
            { 
                $inc: { totalTimeSeconds: duration },
                $max: { maxPagesViewed: maxPage }
            }
        );
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

// Get all countries
app.get('/api/countries', async (req, res) => {
    try {
        const countries = await Country.find();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

// Get regions (states or cities) by country ID
app.get('/api/regions/:countryId', async (req, res) => {
    const { countryId } = req.params;
    if (!validateId(countryId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const states = await State.find({ countryId: countryId.toLowerCase() });
        if (states.length > 0) {
            return res.json({ type: 'states', data: states });
        }
        const cities = await City.find({ countryId: countryId.toLowerCase() });
        res.json({ type: 'cities', data: cities });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

// Get cities by country ID
app.get('/api/cities/:countryId', async (req, res) => {
    const { countryId } = req.params;
    if (!validateId(countryId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const cities = await City.find({ countryId: countryId.toLowerCase() });
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Get retailers by city ID
app.get('/api/retailers/:cityId', async (req, res) => {
    const { cityId } = req.params;
    if (!validateId(cityId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const retailers = await Retailer.find({ cityId: cityId.toLowerCase() });
        res.json(retailers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});

// Get Single Retailer Detail
app.get('/api/retailer/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const retailer = await Retailer.findOne({ id: id.toLowerCase() });
        res.json(retailer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailer details' });
    }
});

// Get Single Offer Detail
app.get('/api/offer/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const offer = await Offer.findOne({ id: id.toLowerCase() });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        res.json(offer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offer details' });
    }
});

// Offer Feedback (Like)
app.post('/api/offer/:id/like', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const offer = await Offer.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { likes: 1 } }, { new: true });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        res.json({ likes: offer.likes, dislikes: offer.dislikes });
    } catch (err) { res.status(500).json({ error: 'Failed to update' }); }
});

// Offer Feedback (Dislike)
app.post('/api/offer/:id/dislike', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const offer = await Offer.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { dislikes: 1 } }, { new: true });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        res.json({ likes: offer.likes, dislikes: offer.dislikes });
    } catch (err) { res.status(500).json({ error: 'Failed to update' }); }
});

// Tracking Redirect for outbound traffic
app.get('/api/redirect/offer/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const offer = await Offer.findOne({ id: id.toLowerCase() });
        if (!offer) return res.status(404).send('Offer not found');
        
        offer.clicks += 1;
        await offer.save();

        let dest = offer.couponUrl || offer.externalAdLink || offer.pdfUrl;
        if (!dest || dest === '#') {
            return res.status(400).send('No valid destination link for this offer');
        }
        
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

// Get offer counts grouped by retailer ID
app.get('/api/offer-counts', async (req, res) => {
    try {
        const counts = await Offer.aggregate([
            { $group: { _id: '$retailerId', count: { $sum: 1 } } }
        ]);
        const map = {};
        counts.forEach(c => { map[c._id] = c.count; });
        res.json(map);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offer counts' });
    }
});

// Get offers by retailer ID
app.get('/api/offers/:retailerId', async (req, res) => {
    const { retailerId } = req.params;
    if (!validateId(retailerId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const offers = await Offer.find({ retailerId: retailerId.toLowerCase() }).sort({ validUntil: -1 });
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// Breadcrumb API - Build hierarchy path for navigation
app.get('/api/breadcrumbs/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const result = {};
        
        if (type === 'city') {
            const city = await City.findOne({ id: id.toLowerCase() }).lean();
            if (!city) return res.status(404).json({ error: 'City not found' });
            result.city = { id: city.id, name: city.name };
            
            if (city.stateId) {
                const state = await State.findOne({ id: city.stateId }).lean();
                if (state) result.state = { id: state.id, name: state.name };
            }
            
            const country = await Country.findOne({ id: city.countryId }).lean();
            if (country) result.country = { id: country.id, name: country.name };
        } 
        else if (type === 'state') {
            const state = await State.findOne({ id: id.toLowerCase() }).lean();
            if (!state) return res.status(404).json({ error: 'State not found' });
            result.state = { id: state.id, name: state.name };
            
            const country = await Country.findOne({ id: state.countryId }).lean();
            if (country) result.country = { id: country.id, name: country.name };
        } 
        else if (type === 'retailer') {
            const retailer = await Retailer.findOne({ id: id.toLowerCase() }).lean();
            if (!retailer) return res.status(404).json({ error: 'Retailer not found' });
            result.retailer = { id: retailer.id, name: retailer.name };
            
            const city = await City.findOne({ id: retailer.cityId }).lean();
            if (city) {
                result.city = { id: city.id, name: city.name };
                
                if (city.stateId) {
                    const state = await State.findOne({ id: city.stateId }).lean();
                    if (state) result.state = { id: state.id, name: state.name };
                }
                
                const country = await Country.findOne({ id: city.countryId }).lean();
                if (country) result.country = { id: country.id, name: country.name };
            }
        } 
        else if (type === 'offer') {
            const offer = await Offer.findOne({ id: id.toLowerCase() }).lean();
            if (!offer) return res.status(404).json({ error: 'Offer not found' });
            result.offer = { id: offer.id, name: offer.title };
            
            const retailer = await Retailer.findOne({ id: offer.retailerId }).lean();
            if (retailer) {
                result.retailer = { id: retailer.id, name: retailer.name };
                
                const city = await City.findOne({ id: retailer.cityId }).lean();
                if (city) {
                    result.city = { id: city.id, name: city.name };
                    
                    if (city.stateId) {
                        const state = await State.findOne({ id: city.stateId }).lean();
                        if (state) result.state = { id: state.id, name: state.name };
                    }
                    
                    const country = await Country.findOne({ id: city.countryId }).lean();
                    if (country) result.country = { id: country.id, name: country.name };
                }
            }
        } 
        else {
            return res.status(400).json({ error: 'Invalid type. Use: city, state, retailer, or offer' });
        }
        
        res.json(result);
    } catch (err) {
        console.error('Breadcrumb API Error:', err);
        res.status(500).json({ error: 'Failed to build breadcrumb' });
    }
});

// Global Search API with Advanced Filters
app.get('/api/search', async (req, res) => {
    try {
        const { q: query, category, cityId, retailerId } = req.query;
        
        // Build dynamic filter for retailers
        const retailerFilter = {};
        if (query) {
            const safeQuery = query.substring(0, 100);
            const escapedQuery = safeQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'i');
            retailerFilter.$or = [
                { name: regex },
                { category: regex }
            ];
        }
        if (category && category !== 'all') {
            retailerFilter.category = category;
        }
        if (cityId && cityId !== 'all') {
            if (!validateId(cityId)) {
                return res.status(400).json({ error: 'Invalid cityId format' });
            }
            retailerFilter.cityId = cityId.toLowerCase();
        }
        
        // Fetch retailers based on filters
        const retailers = await Retailer.find(retailerFilter).lean();
        const retailerIds = retailers.map(r => r.id || r._id);
        
        // Build dynamic filter for offers
        const offerFilter = {};
        if (query) {
            const safeQuery = query.substring(0, 100);
            const escapedQuery = safeQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'i');
            offerFilter.$or = [
                { title: regex }, 
                { badge: regex },
                { couponCode: regex },
                { category: regex }
            ];
        }
        if (category && category !== 'all') {
            offerFilter.category = category;
        }
        if (retailerId && retailerId !== 'all') {
            if (!validateId(retailerId)) {
                return res.status(400).json({ error: 'Invalid retailerId format' });
            }
            offerFilter.retailerId = retailerId.toLowerCase();
        } else if (retailerIds.length > 0) {
            // If no specific retailer filter but we have filtered retailers, include their offers
            if (!offerFilter.$or) {
                offerFilter.retailerId = { $in: retailerIds };
            } else {
                offerFilter.$or.push({ retailerId: { $in: retailerIds } });
            }
        }
        
        // Fetch offers based on filters
        const offers = await Offer.find(offerFilter).sort({ validUntil: -1 }).lean();
        
        res.json({ retailers, offers });
    } catch (err) {
        console.error('Search API Error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get unique categories from retailers and offers
app.get('/api/search/filters', async (req, res) => {
    try {
        const retailerCategories = await Retailer.distinct('category');
        const offerCategories = await Offer.distinct('category');
        const categories = [...new Set([...retailerCategories, ...offerCategories])].sort();
        
        const cities = await City.find().select('id name').lean();
        const retailers = await Retailer.find().select('id name').lean();
        
        res.json({ categories, cities, retailers });
    } catch (err) {
        console.error('Filter API Error:', err);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
});

// Admin: Get all states
app.get('/api/states', async (req, res) => {
    try {
        const states = await State.find();
        res.json(states);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch states' });
    }
});

// Admin: Get all cities
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
        const offers = await Offer.find().sort({ validUntil: -1 });
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
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await Retailer.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { clicks: 1 } });
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

app.post('/api/track/offer/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await Offer.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { clicks: 1 } });
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

// Admin: Get all feedback
app.get('/api/admin/feedback', verifyAdmin, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ date: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// ==========================================
// 📝 API ENDPOINTS (WRITE OPERATIONS & UPLOADS)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

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

// Admin: Upload physical file
app.post('/api/upload', verifyAdmin, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: '/uploads/' + req.file.filename });
});

// Admin: Create new Country
app.post('/api/countries', verifyAdmin, async (req, res) => {
    try {
        const newCountry = new Country(req.body);
        await newCountry.save();
        res.status(201).json(newCountry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new State
app.post('/api/states', verifyAdmin, async (req, res) => {
    try {
        const newState = new State(req.body);
        await newState.save();
        res.status(201).json(newState);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new City
app.post('/api/cities', verifyAdmin, async (req, res) => {
    try {
        const newCity = new City(req.body);
        await newCity.save();
        res.status(201).json(newCity);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new Retailer
app.post('/api/retailers', verifyAdmin, async (req, res) => {
    try {
        const newRetailer = new Retailer(req.body);
        await newRetailer.save();
        res.status(201).json(newRetailer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Create new Offer
app.post('/api/offers', verifyAdmin, async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Update existing Offer
app.put('/api/offers/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const updatedOffer = await Offer.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updatedOffer) return res.status(404).json({ error: 'Offer not found' });
        res.json(updatedOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: Delete Country
app.delete('/api/countries/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await Country.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Country deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete State
app.delete('/api/states/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await State.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'State deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete City
app.delete('/api/cities/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await City.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'City deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete Retailer
app.delete('/api/retailers/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await Retailer.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Retailer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete Offer
app.delete('/api/offers/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        await Offer.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public: Submit Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.use((err, req, res, next) => {
    console.error('Express Error:', err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Secure Server running on http://0.0.0.0:${PORT}`);
});

