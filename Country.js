const mongoose = require('mongoose');

// Strict schema definition blocks unauthorized fields from being injected
const countrySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields securely

module.exports = mongoose.model('Country', countrySchema);