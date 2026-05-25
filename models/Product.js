const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, enum: ['jewelry', 'decor', 'clothing', 'bags', 'other'], default: 'other' }
});
module.exports = mongoose.model('Product', productSchema);