const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    websiteUrl: { type: String, default: '' },
    clicks: { type: Number, default: 0 },
    totalTimeSeconds: { type: Number, default: 0 }, // Time spent viewing retailer pages
    image: { type: String, required: true },
    category: { type: String, default: 'Supermarket' }, // e.g., Electronics, Fashion, Hypermarket
    cityId: { type: String, required: true, lowercase: true, trim: true } // Creates the relationship to City
}, { timestamps: true });

module.exports = mongoose.model('Retailer', retailerSchema);