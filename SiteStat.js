const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    id: { type: String, default: 'global' },
    visits: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SiteStat', statSchema);