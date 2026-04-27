const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    pdfUrl: { type: String, default: '#' },
    clicks: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    totalTimeSeconds: { type: Number, default: 0 }, // Time spent on this offer
    maxPagesViewed: { type: Number, default: 0 }, // Farthest page reached
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    image: { type: String, default: '' },
    badge: { type: String, trim: true },
    isSponsored: { type: Boolean, default: false }, // Ad Integration: Highlights and pins to the top
    externalAdLink: { type: String, default: '' }, // If it's a 3rd party Ad, clicking it takes them here
    category: { type: String, default: 'General', trim: true }, // For grouping offers like D4D
    couponCode: { type: String, default: '', trim: true }, // The promo code to generate traffic for end retailers
    couponUrl: { type: String, default: '', trim: true }, // The link to apply the coupon, tracked to show traffic source
    retailerUrl: { type: String, default: '', trim: true }, // The target retailer website URL
    retailerId: { type: String, required: true, lowercase: true, trim: true } // Creates the relationship to Retailer
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);