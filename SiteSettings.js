const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'global', unique: true },
    gaId: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    feedbackUrl: { type: String, default: '/feedback' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    aboutUs: { type: String, default: '' },
    termsOfService: { type: String, default: '' },
    showStats: { type: Boolean, default: false },
    customLogoUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
