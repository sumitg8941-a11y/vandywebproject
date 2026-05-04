const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    name_ar: { type: String, trim: true },
    name_ur: { type: String, trim: true },
    name_hi: { type: String, trim: true },
    icon: { type: String, default: 'fa-tag' }, // FontAwesome icon class
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
