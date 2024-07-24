const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String }
});

module.exports = mongoose.model('Catalog', catalogSchema);
