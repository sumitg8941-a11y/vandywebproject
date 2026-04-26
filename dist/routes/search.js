"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Retailer_1 = __importDefault(require("../models/Retailer"));
const Offer_1 = __importDefault(require("../models/Offer"));
const City_1 = __importDefault(require("../models/City"));
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { q: query, category, cityId, retailerId } = req.query;
        const retailerFilter = {};
        if (query && typeof query === 'string') {
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
        if (cityId && cityId !== 'all' && typeof cityId === 'string') {
            if (!(0, validation_1.validateId)(cityId)) {
                res.status(400).json({ error: 'Invalid cityId format' });
                return;
            }
            retailerFilter.cityId = cityId.toLowerCase();
        }
        const retailers = await Retailer_1.default.find(retailerFilter).lean();
        const retailerIds = retailers.map(r => r.id);
        const offerFilter = {};
        if (query && typeof query === 'string') {
            const safeQuery = query.substring(0, 100);
            const escapedQuery = safeQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'i');
            offerFilter.$or = [
                { title: regex },
                { badge: regex }
            ];
        }
        if (category && category !== 'all') {
            offerFilter.category = category;
        }
        if (retailerId && retailerId !== 'all' && typeof retailerId === 'string') {
            if (!(0, validation_1.validateId)(retailerId)) {
                res.status(400).json({ error: 'Invalid retailerId format' });
                return;
            }
            offerFilter.retailerId = retailerId.toLowerCase();
        }
        else if (retailerIds.length > 0) {
            if (!offerFilter.$or) {
                offerFilter.retailerId = { $in: retailerIds };
            }
            else {
                offerFilter.$or.push({ retailerId: { $in: retailerIds } });
            }
        }
        const offers = await Offer_1.default.find(offerFilter).sort({ validUntil: -1 }).lean();
        res.json({ retailers, offers });
    }
    catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});
router.get('/filters', async (req, res) => {
    try {
        const cities = await City_1.default.find().select('id name').lean();
        const retailers = await Retailer_1.default.find().select('id name').lean();
        res.json({ categories: [], cities, retailers });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
});
exports.default = router;
