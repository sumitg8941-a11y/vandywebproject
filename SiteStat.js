const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    id: { type: String, default: 'global' },
    visits: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SiteStat', statSchema);