const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    title_ar: { type: String, trim: true },
    title_ur: { type: String, trim: true },
    title_hi: { type: String, trim: true },
    excerpt: { type: String, required: true, trim: true },
    excerpt_ar: { type: String, trim: true },
    excerpt_ur: { type: String, trim: true },
    excerpt_hi: { type: String, trim: true },
    content: { type: String, required: true },
    content_ar: { type: String },
    content_ur: { type: String },
    content_hi: { type: String },
    image: { type: String, required: true },
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
