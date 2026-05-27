const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../Middleware/adminAuth');
const Product = require('../models/Product');
const { upload, cloudinary } = require('../cloudinary');

// POST /api/admin/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME) {
        return res.status(401).json({ error: 'Admin user not found.' });
    }
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
    // Fallback: plain compare for setup convenience (use hash in production)
    const plainMatch = password === process.env.ADMIN_PASSWORD;
    if (!isMatch && !plainMatch) {
        return res.status(401).json({ error: 'Incorrect password.' });
    }
    const token = jwt.sign(
        { username, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    res.json({ token, username });
});

// GET /api/admin/products — all products
router.get('/products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/admin/products — add product
router.post('/products', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Image required.' });
        const product = await Product.create({
            name, price: parseFloat(price),
            image: req.file.path,
            category: category || 'other'
        });
        res.status(201).json({ message: 'Product added successfully!', product });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/admin/products/:id — edit product
router.put('/products/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const update = { name, price: parseFloat(price), category };
        if (req.file) update.image = req.file.path;
        await Product.findByIdAndUpdate(req.params.id, update);
        res.json({ message: 'Product updated successfully!' });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE /api/admin/products/:id — delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        // Delete image from Cloudinary
        if (product.image) {
            const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully!' });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;