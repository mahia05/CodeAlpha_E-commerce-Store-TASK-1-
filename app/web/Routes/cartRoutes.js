const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../Middleware/auth');

// GET /api/cart
router.get('/', auth, async (req, res) => {
    try {
        const items = await Cart.find({ user_id: req.user.id }).populate('product_id');
        res.json(items);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/cart/add
router.post('/add', auth, async (req, res) => {
    const { product_id } = req.body;
    try {
        // Validate product exists
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        const existing = await Cart.findOne({ user_id: req.user.id, product_id });
        if (existing) {
            existing.quantity += 1;
            await existing.save();
            return res.json(existing);
        }
        const item = await Cart.create({ user_id: req.user.id, product_id, quantity: 1 });
        res.status(201).json(item);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/cart/update — update quantity
router.post('/update', auth, async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        if (quantity < 1) {
            await Cart.findOneAndDelete({ user_id: req.user.id, product_id });
            return res.json({ message: 'Item removed.' });
        }
        const item = await Cart.findOneAndUpdate(
            { user_id: req.user.id, product_id },
            { quantity },
            { new: true }
        );
        res.json(item);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/cart/remove
router.post('/remove', auth, async (req, res) => {
    const { product_id } = req.body;
    try {
        await Cart.findOneAndDelete({ user_id: req.user.id, product_id });
        res.json({ message: 'Removed from cart.' });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/cart/clear
router.post('/clear', auth, async (req, res) => {
    try {
        await Cart.deleteMany({ user_id: req.user.id });
        res.json({ message: 'Cart cleared.' });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;