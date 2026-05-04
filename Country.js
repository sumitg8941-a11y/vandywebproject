const mongoose = require('mongoose');

// Strict schema definition blocks unauthorized fields from being injected
const countrySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    name_ar: { type: String, trim: true },
    name_ur: { type: String, trim: true },
    name_hi: { type: String, trim: true },
    image: { type: String, required: true },
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    visits: { type: Number, default: 0 }, // Track country page visits
    offerViews: { type: Number, default: 0 } // Track offers viewed from this country
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields securely

module.exports = mongoose.model('Country', countrySchema);