"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Country_1 = __importDefault(require("../models/Country"));
const State_1 = __importDefault(require("../models/State"));
const City_1 = __importDefault(require("../models/City"));
const Retailer_1 = __importDefault(require("../models/Retailer"));
const Offer_1 = __importDefault(require("../models/Offer"));
const SiteStat_1 = __importDefault(require("../models/SiteStat"));
const Feedback_1 = __importDefault(require("../models/Feedback"));
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({ status: 'secure', message: 'DealNamaa API is running safely!' });
});
router.get('/countries', async (req, res) => {
    try {
        const countries = await Country_1.default.find();
        res.json(countries);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});
router.get('/regions/:countryId', async (req, res) => {
    const countryId = req.params.countryId;
    if (!(0, validation_1.validateId)(countryId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const states = await State_1.default.find({ countryId: countryId.toLowerCase() });
        if (states.length > 0) {
            res.json({ type: 'states', data: states });
            return;
        }
        const cities = await City_1.default.find({ countryId: countryId.toLowerCase() });
        res.json({ type: 'cities', data: cities });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});
router.get('/cities/:countryId', async (req, res) => {
    const countryId = req.params.countryId;
    if (!(0, validation_1.validateId)(countryId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const cities = await City_1.default.find({ countryId: countryId.toLowerCase() });
        res.json(cities);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch cities' });
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
router.get('/retailers/:cityId', async (req, res) => {
    const cityId = req.params.cityId;
    if (!(0, validation_1.validateId)(cityId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const retailers = await Retailer_1.default.find({ cityId: cityId.toLowerCase() });
        res.json(retailers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailers' });
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
router.get('/retailer/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const retailer = await Retailer_1.default.findOne({ id: id.toLowerCase() });
        res.json(retailer);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch retailer details' });
    }
});
router.get('/offers/:retailerId', async (req, res) => {
    const retailerId = req.params.retailerId;
    if (!(0, validation_1.validateId)(retailerId)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offers = await Offer_1.default.find({ retailerId: retailerId.toLowerCase() }).sort({ validUntil: -1 });
        res.json(offers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch offers' });
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
router.get('/offer/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offer = await Offer_1.default.findOne({ id: id.toLowerCase() });
        if (!offer) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        res.json(offer);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch offer details' });
    }
});
router.post('/offer/:id/like', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offer = await Offer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { likes: 1 } }, { new: true });
        if (!offer) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        res.json({ likes: offer.likes, dislikes: offer.dislikes });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
});
router.post('/offer/:id/dislike', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offer = await Offer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { dislikes: 1 } }, { new: true });
        if (!offer) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        res.json({ likes: offer.likes, dislikes: offer.dislikes });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
});
router.get('/redirect/offer/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offer = await Offer_1.default.findOne({ id: id.toLowerCase() });
        if (!offer) {
            res.status(404).send('Offer not found');
            return;
        }
        offer.clicks += 1;
        await offer.save();
        let dest = offer.pdfUrl || '#';
        try {
            const urlObj = new URL(dest);
            urlObj.searchParams.set('utm_source', 'DealNamaa');
            urlObj.searchParams.set('utm_medium', 'coupon_link');
            urlObj.searchParams.set('utm_campaign', 'retailer_traffic');
            dest = urlObj.toString();
        }
        catch (e) {
            // Invalid URL format, use raw
        }
        res.redirect(dest);
    }
    catch (err) {
        res.status(500).send('Error processing redirect');
    }
});
router.post('/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback_1.default(req.body);
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to submit feedback' });
    }
});
router.post('/track/visit', async (req, res) => {
    try {
        await SiteStat_1.default.findOneAndUpdate({ id: 'global' }, { $inc: { visits: 1 } }, { upsert: true });
        res.status(200).send('OK');
    }
    catch (e) {
        res.status(500).send('Error');
    }
});
router.post('/track/retailer/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await Retailer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { clicks: 1 } });
        res.status(200).send('OK');
    }
    catch (e) {
        res.status(500).send('Error');
    }
});
router.post('/track/offer/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await Offer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, { $inc: { clicks: 1 } });
        res.status(200).send('OK');
    }
    catch (e) {
        res.status(500).send('Error');
    }
});
router.post('/track/offer-stats/:id', async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const { duration, maxPage } = req.body;
        await Offer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, {
            $inc: { totalTimeSeconds: duration },
            $max: { maxPagesViewed: maxPage }
        });
        res.status(200).send('OK');
    }
    catch (e) {
        res.status(500).send('Error');
    }
});
exports.default = router;
