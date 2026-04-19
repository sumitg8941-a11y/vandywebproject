const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    countryId: { type: String, required: true, lowercase: true, trim: true } // Creates the relationship to Country
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);