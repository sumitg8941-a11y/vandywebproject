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
const Feedback_1 = __importDefault(require("../models/Feedback"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = (0, auth_1.generateToken)({ role: 'admin' });
        res.json({ token });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
router.get('/feedback', auth_1.verifyAdmin, async (req, res) => {
    try {
        const feedback = await Feedback_1.default.find().sort({ date: -1 });
        res.json(feedback);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});
router.post('/upload', auth_1.verifyAdmin, upload_1.upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    res.json({ url: '/uploads/' + req.file.filename });
});
router.post('/countries', auth_1.verifyAdmin, async (req, res) => {
    try {
        const newCountry = new Country_1.default(req.body);
        await newCountry.save();
        res.status(201).json(newCountry);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/states', auth_1.verifyAdmin, async (req, res) => {
    try {
        const newState = new State_1.default(req.body);
        await newState.save();
        res.status(201).json(newState);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/cities', auth_1.verifyAdmin, async (req, res) => {
    try {
        const newCity = new City_1.default(req.body);
        await newCity.save();
        res.status(201).json(newCity);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/retailers', auth_1.verifyAdmin, async (req, res) => {
    try {
        const newRetailer = new Retailer_1.default(req.body);
        await newRetailer.save();
        res.status(201).json(newRetailer);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/offers', auth_1.verifyAdmin, async (req, res) => {
    try {
        const newOffer = new Offer_1.default(req.body);
        await newOffer.save();
        res.status(201).json(newOffer);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/offers/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    console.log('PUT /offers/:id - Received ID:', id);
    console.log('PUT /offers/:id - Request body:', req.body);
    if (!(0, validation_1.validateId)(id)) {
        console.error('Invalid ID format:', id);
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const offerId = id || req.body.id;
        const updateData = { ...req.body };
        delete updateData.id;
        console.log('Searching for offer with ID:', offerId);
        // Check if it's a MongoDB ObjectId (24 hex characters) or custom ID
        const isObjectId = /^[a-f0-9]{24}$/i.test(offerId);
        const query = isObjectId
            ? { $or: [{ id: offerId.toLowerCase() }, { _id: offerId }] }
            : { id: offerId.toLowerCase() };
        const updatedOffer = await Offer_1.default.findOneAndUpdate(query, updateData, { new: true, runValidators: false });
        if (!updatedOffer) {
            console.error('Offer not found with ID:', offerId);
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        console.log('Offer updated successfully:', updatedOffer.id);
        res.json(updatedOffer);
    }
    catch (err) {
        console.error('Offer update error:', err);
        res.status(400).json({ error: err.message || 'Failed to update offer' });
    }
});
router.put('/countries/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const updatedCountry = await Country_1.default.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updatedCountry) {
            res.status(404).json({ error: 'Country not found' });
            return;
        }
        res.json(updatedCountry);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/cities/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const updatedCity = await City_1.default.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updatedCity) {
            res.status(404).json({ error: 'City not found' });
            return;
        }
        res.json(updatedCity);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put('/retailers/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const updatedRetailer = await Retailer_1.default.findOneAndUpdate({ id: id.toLowerCase() }, req.body, { new: true });
        if (!updatedRetailer) {
            res.status(404).json({ error: 'Retailer not found' });
            return;
        }
        res.json(updatedRetailer);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.delete('/countries/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await Country_1.default.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Country deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/states/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await State_1.default.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'State deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/cities/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await City_1.default.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'City deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/retailers/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await Retailer_1.default.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Retailer deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/offers/:id', auth_1.verifyAdmin, async (req, res) => {
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        await Offer_1.default.findOneAndDelete({ id: id.toLowerCase() });
        res.json({ message: 'Offer deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
