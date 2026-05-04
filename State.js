const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    name_ar: { type: String, trim: true },
    name_ur: { type: String, trim: true },
    name_hi: { type: String, trim: true },
    image: { type: String, required: true },
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    countryId: { type: String, required: true, lowercase: true, trim: true } // Relationship to Country
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
