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

// Stricter rate limit for tracking endpoints — prevents stat inflation
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'Too many requests' });
app.use('/api/track', trackLimiter);

app.use(express.json({ limit: '10kb' }));

// ==========================================
// 🔒 ADMIN AUTHENTICATION (defined early — used by routes below)
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'dealnamaa_secure_token_123!';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

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
// 💾 DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Securely connected to MongoDB (DealNamaa Database)'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================
// 🌐 ROUTES & STATIC FILES
// ==========================================
// Serve ONLY the uploads directory and admin interface files — never the project root
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin.html', express.static(path.join(__dirname, 'admin.html')));
app.use('/admin.js', express.static(path.join(__dirname, 'admin.js')));
app.use('/data.js', express.static(path.join(__dirname, 'data.js')));

// Import Database Models
const Country = require('./Country');
const State = require('./State');
const City = require('./City');
const Retailer = require('./Retailer');
const Offer = require('./Offer');
const SiteStat = require('./SiteStat');
const Feedback = require('./Feedback');
const SiteSettings = require('./SiteSettings');
const { isR2Configured: checkR2Config } = require('./r2-storage');

// Check R2 configuration on startup
if (checkR2Config()) {
    console.log('☁️ Cloudflare R2 storage is configured and will be used for uploads');
} else {
    console.log('📁 R2 not configured, using local storage for uploads');
}

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

// Get regions (states + direct cities) by country ID
app.get('/api/regions/:countryId', async (req, res) => {
    const { countryId } = req.params;
    if (!validateId(countryId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const [states, allCities] = await Promise.all([
            State.find({ countryId: countryId.toLowerCase() }).lean(),
            City.find({ countryId: countryId.toLowerCase() }).lean(),
        ]);
        // Direct cities = cities with no stateId
        const directCities = allCities.filter(c => !c.stateId || c.stateId === '');
        res.json({ states, directCities });
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

// Public: Get site settings (GA ID, social links, feedback URL)
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await SiteSettings.findOne({ id: 'global' });
        res.json(settings || {});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Admin: Update site settings
app.put('/api/admin/settings', verifyAdmin, async (req, res) => {
    try {
        const allowed = ['gaId', 'facebookUrl', 'twitterUrl', 'instagramUrl', 'feedbackUrl', 'siteUrl'];
        const update = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
        const settings = await SiteSettings.findOneAndUpdate(
            { id: 'global' },
            { $set: update },
            { upsert: true, new: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get ACTIVE offer counts grouped by retailer ID
app.get('/api/offer-counts', async (req, res) => {
    try {
        const counts = await Offer.aggregate([
            { $match: { validUntil: { $gte: new Date() } } },
            { $group: { _id: '$retailerId', count: { $sum: 1 } } }
        ]);
        const map = {};
        counts.forEach(c => { map[c._id] = c.count; });
        res.json(map);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offer counts' });
    }
});

// Get offers expiring within 7 days (for homepage urgency section)
app.get('/api/offers/expiring-soon', async (req, res) => {
    try {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const offers = await Offer.find({
            validUntil: { $gte: now, $lte: in7Days }
        }).sort({ validUntil: 1 }).limit(8).lean();
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expiring offers' });
    }
});

// Get offers by retailer ID (active only by default)
app.get('/api/offers/:retailerId', async (req, res) => {
    const { retailerId } = req.params;
    if (!validateId(retailerId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const filter = { retailerId: retailerId.toLowerCase() };
        if (req.query.includeExpired !== 'true') {
            filter.validUntil = { $gte: new Date() };
        }
        const offers = await Offer.find(filter).sort({ validUntil: 1 });
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
        
        // Only return active (non-expired) offers in search results
        const now2 = new Date();
        const validity = req.query.validity;
        if (validity === 'today') {
            const endOfDay = new Date(now2); endOfDay.setHours(23, 59, 59, 999);
            offerFilter.validUntil = { $gte: now2, $lte: endOfDay };
        } else if (validity === 'week') {
            const in7 = new Date(now2.getTime() + 7 * 24 * 60 * 60 * 1000);
            offerFilter.validUntil = { $gte: now2, $lte: in7 };
        } else if (validity === 'month') {
            const in30 = new Date(now2.getTime() + 30 * 24 * 60 * 60 * 1000);
            offerFilter.validUntil = { $gte: now2, $lte: in30 };
        } else {
            offerFilter.validUntil = { $gte: now2 };
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

// Get cities by state ID
app.get('/api/cities/state/:stateId', async (req, res) => {
    const { stateId } = req.params;
    if (!validateId(stateId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    try {
        const cities = await City.find({ stateId: stateId.toLowerCase() });
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
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

// Get retailers — supports ?limit=N and ?sort=clicks
app.get('/api/retailers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const sort = req.query.sort === 'clicks' ? { clicks: -1 } : {};
        const retailers = await Retailer.find().sort(sort).limit(limit);
        res.json(retailers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});

// Admin: Get all offers (supports ?limit=N and ?includeExpired=true)
app.get('/api/offers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const filter = {};
        if (req.query.includeExpired !== 'true') {
            filter.validUntil = { $gte: new Date() };
        }
        const offers = await Offer.find(filter).sort({ validUntil: 1 }).limit(limit);
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// Admin: Get Global Stats (rich dashboard data with marketing insights)
app.get('/api/stats', async (req, res) => {
    try {
        const now = new Date();
        // Date range filter: ?since=7 or ?since=30, default all-time
        const sinceParam = parseInt(req.query.since) || 0;
        const fromParam = req.query.from ? new Date(req.query.from) : null;
        const toParam = req.query.to ? new Date(req.query.to + 'T23:59:59.999Z') : null;
        const sinceDate = fromParam ? fromParam : (sinceParam > 0 ? new Date(now.getTime() - sinceParam * 24 * 60 * 60 * 1000) : null);
        const untilDate = toParam || null;
        const rangeFilter = sinceDate ? (untilDate ? { createdAt: { $gte: sinceDate, $lte: untilDate } } : { createdAt: { $gte: sinceDate } }) : {};
        const offerRangeFilter = sinceDate ? (untilDate ? { validUntil: { $gte: now }, createdAt: { $gte: sinceDate, $lte: untilDate } } : { validUntil: { $gte: now }, createdAt: { $gte: sinceDate } }) : { validUntil: { $gte: now } };
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            globalStat,
            totalRetailers,
            totalOffers,
            totalCountries,
            totalCities,
            activeOffers,
            expiredOffers,
            feedbackCount,
            offersAddedLast30Days,
            offersAddedLast7Days,
            
            // Top performers
            topCountries,
            topCities,
            topRetailers,
            topOffers,
            mostLikedOffers,
            mostDislikedOffers,
            topEngagedOffers,
            
            // Expiring soon
            expiringSoon,
            expiringIn30,
            
            // Recent additions
            recentOffers,
            recentRetailers,
            
            // Engagement metrics
            offersWithHighEngagement,
            offersWithLowEngagement,
            
            // PDF Analytics
            offersWithPDFViews,
            avgPagesViewed,
            
            // Category performance
            offersByCategory,
            retailersByCategory,
            
            // Conversion metrics
            offersWithClicks,
            offersWithoutClicks,
            
        ] = await Promise.all([
            SiteStat.findOne({ id: 'global' }),
            Retailer.countDocuments(),
            Offer.countDocuments(),
            Country.countDocuments(),
            City.countDocuments(),
            Offer.countDocuments({ validUntil: { $gte: now } }),
            Offer.countDocuments({ validUntil: { $lt: now } }),
            Feedback.countDocuments(),
            Offer.countDocuments({ createdAt: { $gte: last30Days } }),
            Offer.countDocuments({ createdAt: { $gte: last7Days } }),
            
            // Top performers by visits/clicks
            Country.find().sort({ visits: -1 }).limit(10).lean(),
            City.find().sort({ visits: -1 }).limit(10).lean(),
            Retailer.find(rangeFilter).sort({ clicks: -1 }).limit(10).lean(),
            Offer.find(offerRangeFilter).sort({ clicks: -1 }).limit(10).lean(),
            Offer.find(offerRangeFilter).sort({ likes: -1 }).limit(10).lean(),
            Offer.find(offerRangeFilter).sort({ dislikes: -1 }).limit(5).lean(),
            Offer.find(offerRangeFilter).sort({ totalTimeSeconds: -1 }).limit(10).lean(),
            
            // Expiring offers
            Offer.find({ validUntil: { $gte: now, $lte: in7Days } }).sort({ validUntil: 1 }).lean(),
            Offer.countDocuments({ validUntil: { $gte: now, $lte: in30Days } }),
            
            // Recent additions
            Offer.find({ validUntil: { $gte: now } }).sort({ createdAt: -1 }).limit(5).lean(),
            Retailer.find().sort({ createdAt: -1 }).limit(5).lean(),
            
            // Engagement analysis
            Offer.find({ validUntil: { $gte: now }, totalTimeSeconds: { $gte: 60 } }).sort({ totalTimeSeconds: -1 }).limit(5).lean(),
            Offer.find({ validUntil: { $gte: now }, clicks: { $gte: 1 }, totalTimeSeconds: { $lt: 10 } }).sort({ clicks: -1 }).limit(5).lean(),
            
            // PDF Analytics
            Offer.find({ validUntil: { $gte: now }, maxPagesViewed: { $gte: 1 } }).sort({ maxPagesViewed: -1 }).limit(10).lean(),
            Offer.aggregate([
                { $match: { validUntil: { $gte: now }, maxPagesViewed: { $gte: 1 } } },
                { $group: { _id: null, avgPages: { $avg: '$maxPagesViewed' } } }
            ]),
            
            // Category breakdown
            Offer.aggregate([
                { $match: { validUntil: { $gte: now } } },
                { $group: { _id: '$category', count: { $sum: 1 }, totalClicks: { $sum: '$clicks' } } },
                { $sort: { totalClicks: -1 } }
            ]),
            Retailer.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 }, totalClicks: { $sum: '$clicks' } } },
                { $sort: { totalClicks: -1 } }
            ]),
            
            // Conversion metrics
            Offer.countDocuments({ validUntil: { $gte: now }, clicks: { $gte: 1 } }),
            Offer.countDocuments({ validUntil: { $gte: now }, clicks: 0 }),
        ]);

        // Calculate conversion rate
        const conversionRate = activeOffers > 0 ? ((offersWithClicks / activeOffers) * 100).toFixed(2) : 0;
        
        // Calculate average engagement time
        const totalEngagementTime = topEngagedOffers.reduce((sum, o) => sum + (o.totalTimeSeconds || 0), 0);
        const avgEngagementTime = topEngagedOffers.length > 0 ? Math.round(totalEngagementTime / topEngagedOffers.length) : 0;
        
        // Calculate average pages viewed
        const avgPages = avgPagesViewed.length > 0 ? avgPagesViewed[0].avgPages.toFixed(1) : 0;
        
        // Geographic insights
        const topCountryName = topCountries.length > 0 ? topCountries[0].name : 'N/A';
        const topCityName = topCities.length > 0 ? topCities[0].name : 'N/A';
        
        // Growth metrics
        const weeklyGrowthRate = offersAddedLast7Days;
        const monthlyGrowthRate = offersAddedLast30Days;

        res.json({
            // Overview metrics
            visits: globalStat ? globalStat.visits : 0,
            totals: {
                retailers: totalRetailers,
                offers: totalOffers,
                countries: totalCountries,
                cities: totalCities,
                activeOffers,
                expiredOffers,
                feedbackCount,
                offersAddedLast30Days,
                offersAddedLast7Days,
            },
            
            // Top performers
            topCountries,
            topCities,
            topRetailers,
            topOffers,
            mostLikedOffers,
            mostDislikedOffers,
            topEngagedOffers,
            
            // Expiring offers
            expiringSoon,
            expiringIn30,
            
            // Recent activity
            recentOffers,
            recentRetailers,
            
            // Engagement insights
            offersWithHighEngagement,
            offersWithLowEngagement,
            avgEngagementTime,
            
            // PDF Analytics
            offersWithPDFViews,
            avgPagesViewed: avgPages,
            
            // Category performance
            offersByCategory,
            retailersByCategory,
            
            // Conversion metrics
            conversionRate,
            offersWithClicks,
            offersWithoutClicks,
            
            // Geographic insights
            topCountryName,
            topCityName,
            
            // Growth metrics
            weeklyGrowthRate,
            monthlyGrowthRate,
        });
    } catch (err) {
        console.error('Stats API Error:', err);
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

app.post('/api/track/country/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        await Country.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { visits: 1 } });
        res.status(200).send('OK');
    } catch (e) { res.status(500).send('Error'); }
});

app.post('/api/track/city/:id', async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        await City.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { visits: 1 } });
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

// ==========================================
// 🔒 ADMIN LOGIN ENDPOINT
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Admin: Update site settings
app.put('/api/admin/settings', verifyAdmin, async (req, res) => {
    try {
        const allowed = ['gaId', 'facebookUrl', 'twitterUrl', 'instagramUrl', 'feedbackUrl', 'siteUrl'];
        const update = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
        const settings = await SiteSettings.findOneAndUpdate(
            { id: 'global' },
            { $set: update },
            { upsert: true, new: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Admin: Get all feedback
app.get('/api/admin/feedback', verifyAdmin, async (req, res) => {
    try {
        const sort = req.query.sort || 'newest';
        const sortOrder = sort === 'oldest' ? 1 : -1;
        const feedback = await Feedback.find().sort({ date: sortOrder });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// Admin: Delete feedback
app.delete('/api/admin/feedback/:id', verifyAdmin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// ==========================================
// 📝 API ENDPOINTS (WRITE OPERATIONS & UPLOADS)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Import R2 storage module
const { uploadToR2, isR2Configured } = require('./r2-storage');
const { addWatermarkToPDF, isPDF } = require('./pdf-watermark');

// Use memory storage for multer (files will be uploaded to R2 or saved locally)
const upload = multer({ storage: multer.memoryStorage() });

// Admin: Upload file (R2 with local fallback + PDF watermarking)
const handleUpload = [verifyAdmin, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    try {
        let fileBuffer = req.file.buffer;
        let originalName = req.file.originalname;
        
        // Add watermark to PDFs
        if (isPDF(req.file.mimetype)) {
            try {
                console.log('🔖 Adding watermark to PDF...');
                fileBuffer = await addWatermarkToPDF(fileBuffer);
                console.log('✅ Watermark added successfully');
            } catch (watermarkError) {
                console.error('⚠️ Failed to add watermark, uploading original PDF:', watermarkError.message);
                // Continue with original PDF if watermarking fails
            }
        }
        
        let fileUrl;
        
        // Try R2 upload if configured
        if (isR2Configured()) {
            try {
                fileUrl = await uploadToR2(fileBuffer, originalName, req.file.mimetype);
                console.log('☁️ File uploaded to Cloudflare R2:', fileUrl);
            } catch (r2Error) {
                console.error('⚠️ R2 upload failed, falling back to local storage:', r2Error.message);
                // Fallback to local storage
                fileUrl = await saveLocally({ buffer: fileBuffer, originalname: originalName });
            }
        } else {
            // R2 not configured, use local storage
            fileUrl = await saveLocally({ buffer: fileBuffer, originalname: originalName });
            console.log('📁 File saved locally:', fileUrl);
        }
        
        res.json({ url: fileUrl });
    } catch (err) {
        console.error('❌ Upload error:', err);
        res.status(500).json({ error: 'Upload failed: ' + err.message });
    }
}];

// Helper function to save file locally
async function saveLocally(file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    const filepath = path.join(uploadDir, filename);
    
    await fs.promises.writeFile(filepath, file.buffer);
    return '/uploads/' + filename;
}

app.post('/api/upload', ...handleUpload);
app.post('/api/admin/upload', ...handleUpload);

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

// Admin: Update existing Country
app.put('/api/admin/countries/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const updated = await Country.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Country not found' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Update existing State
app.put('/api/admin/states/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const updated = await State.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'State not found' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Update existing City
app.put('/api/admin/cities/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const updated = await City.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'City not found' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Update existing Retailer
app.put('/api/admin/retailers/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const updated = await Retailer.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Retailer not found' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Update existing Offer (alias)
app.put('/api/admin/offers/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID format' });
    try {
        const updated = await Offer.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Offer not found' });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Create new Country
app.post('/api/admin/countries', verifyAdmin, async (req, res) => {
    try {
        const newCountry = new Country(req.body);
        await newCountry.save();
        res.status(201).json(newCountry);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Create new City
app.post('/api/admin/cities', verifyAdmin, async (req, res) => {
    try {
        const newCity = new City(req.body);
        await newCity.save();
        res.status(201).json(newCity);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Create new Retailer
app.post('/api/admin/retailers', verifyAdmin, async (req, res) => {
    try {
        const newRetailer = new Retailer(req.body);
        await newRetailer.save();
        res.status(201).json(newRetailer);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin: Create new Offer
app.post('/api/admin/offers', verifyAdmin, async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) { res.status(400).json({ error: err.message }); }
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

