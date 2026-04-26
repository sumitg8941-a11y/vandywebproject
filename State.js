const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    countryId: { type: String, required: true, lowercase: true, trim: true } // Relationship to Country
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
