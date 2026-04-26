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
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/:type/:id', async (req, res) => {
    const { type } = req.params;
    const id = req.params.id;
    if (!(0, validation_1.validateId)(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    try {
        const result = {};
        if (type === 'city') {
            const city = await City_1.default.findOne({ id: id.toLowerCase() }).lean();
            if (!city) {
                res.status(404).json({ error: 'City not found' });
                return;
            }
            result.city = { id: city.id, name: city.name };
            if (city.stateId) {
                const state = await State_1.default.findOne({ id: city.stateId }).lean();
                if (state)
                    result.state = { id: state.id, name: state.name };
            }
            const country = await Country_1.default.findOne({ id: city.countryId }).lean();
            if (country)
                result.country = { id: country.id, name: country.name };
        }
        else if (type === 'state') {
            const state = await State_1.default.findOne({ id: id.toLowerCase() }).lean();
            if (!state) {
                res.status(404).json({ error: 'State not found' });
                return;
            }
            result.state = { id: state.id, name: state.name };
            const country = await Country_1.default.findOne({ id: state.countryId }).lean();
            if (country)
                result.country = { id: country.id, name: country.name };
        }
        else if (type === 'retailer') {
            const retailer = await Retailer_1.default.findOne({ id: id.toLowerCase() }).lean();
            if (!retailer) {
                res.status(404).json({ error: 'Retailer not found' });
                return;
            }
            result.retailer = { id: retailer.id, name: retailer.name };
            const city = await City_1.default.findOne({ id: retailer.cityId }).lean();
            if (city) {
                result.city = { id: city.id, name: city.name };
                if (city.stateId) {
                    const state = await State_1.default.findOne({ id: city.stateId }).lean();
                    if (state)
                        result.state = { id: state.id, name: state.name };
                }
                const country = await Country_1.default.findOne({ id: city.countryId }).lean();
                if (country)
                    result.country = { id: country.id, name: country.name };
            }
        }
        else if (type === 'offer') {
            const offer = await Offer_1.default.findOne({ id: id.toLowerCase() }).lean();
            if (!offer) {
                res.status(404).json({ error: 'Offer not found' });
                return;
            }
            result.offer = { id: offer.id, name: offer.title };
            const retailer = await Retailer_1.default.findOne({ id: offer.retailerId }).lean();
            if (retailer) {
                result.retailer = { id: retailer.id, name: retailer.name };
                const city = await City_1.default.findOne({ id: retailer.cityId }).lean();
                if (city) {
                    result.city = { id: city.id, name: city.name };
                    if (city.stateId) {
                        const state = await State_1.default.findOne({ id: city.stateId }).lean();
                        if (state)
                            result.state = { id: state.id, name: state.name };
                    }
                    const country = await Country_1.default.findOne({ id: city.countryId }).lean();
                    if (country)
                        result.country = { id: country.id, name: country.name };
                }
            }
        }
        else {
            res.status(400).json({ error: 'Invalid type. Use: city, state, retailer, or offer' });
            return;
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to build breadcrumb' });
    }
});
exports.default = router;
