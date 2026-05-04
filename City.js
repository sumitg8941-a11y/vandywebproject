const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    name_ar: { type: String, trim: true },
    name_ur: { type: String, trim: true },
    name_hi: { type: String, trim: true },
    image: { type: String, required: true },
    countryId: { type: String, required: true, lowercase: true, trim: true }, // Creates the relationship to Country
    stateId: { type: String, default: '', lowercase: true, trim: true }, // Optional relationship to State
    visits: { type: Number, default: 0 }, // Track city page visits
    offerViews: { type: Number, default: 0 } // Track offers viewed from this city
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);