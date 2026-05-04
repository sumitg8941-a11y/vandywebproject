const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    name_ar: { type: String, trim: true },
    name_ur: { type: String, trim: true },
    name_hi: { type: String, trim: true },
    websiteUrl: { type: String, default: '' },
    clicks: { type: Number, default: 0 },
    totalTimeSeconds: { type: Number, default: 0 }, // Time spent viewing retailer pages
    image: { type: String, required: true },
    category: { type: String, default: 'Supermarket' }, // e.g., Electronics, Fashion, Hypermarket
    cityId: { type: String, required: true, lowercase: true, trim: true }, // Primary city
    cityIds: [{ type: String, lowercase: true, trim: true }], // Additional cities this retailer operates in
    affiliateType: { type: String, enum: ['direct', 'prefix', 'suffix', 'template'], default: 'direct' },
    affiliateValue: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Retailer', retailerSchema);