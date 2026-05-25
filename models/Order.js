const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    fullname: { type: String, required: true },
    address: { type: String, required: true },
    payment_method: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);