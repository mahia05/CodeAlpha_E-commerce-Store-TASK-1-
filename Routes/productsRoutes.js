const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const products = await Product.find(filter);
        res.json(products);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(product);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;