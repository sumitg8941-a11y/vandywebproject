"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SiteStat_1 = __importDefault(require("../models/SiteStat"));
const Retailer_1 = __importDefault(require("../models/Retailer"));
const Offer_1 = __importDefault(require("../models/Offer"));
const State_1 = __importDefault(require("../models/State"));
const City_1 = __importDefault(require("../models/City"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const globalStat = await SiteStat_1.default.findOne({ id: 'global' });
        const topRetailers = await Retailer_1.default.find().sort({ clicks: -1 }).limit(5);
        const topOffers = await Offer_1.default.find().sort({ clicks: -1 }).limit(5);
        res.json({
            visits: globalStat ? globalStat.visits : 0,
            topRetailers,
            topOffers
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
router.get('/states', async (req, res) => {
    try {
        const states = await State_1.default.find();
        res.json(states);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch states' });
    }
});
router.get('/cities', async (req, res) => {
    try {
        const cities = await City_1.default.find();
        res.json(cities);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});
router.get('/retailers', async (req, res) => {
    try {
        const retailers = await Retailer_1.default.find();
        res.json(retailers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
    }
});
router.get('/offers', async (req, res) => {
    try {
        const offers = await Offer_1.default.find().sort({ validUntil: -1 });
        res.json(offers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});
exports.default = router;
