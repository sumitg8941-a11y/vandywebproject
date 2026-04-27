const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'global', unique: true },
    gaId: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    feedbackUrl: { type: String, default: '/feedback' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
