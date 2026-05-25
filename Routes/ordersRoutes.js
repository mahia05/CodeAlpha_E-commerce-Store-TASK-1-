const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// POST /api/orders/place
router.post('/place', auth, async (req, res) => {
    const { fullname, address, payment_method } = req.body;
    try {
        const cartItems = await Cart.find({ user_id: req.user.id }).populate('product_id');
        if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty.' });

        const orderDocs = cartItems.map(item => ({
            user_id: req.user.id,
            product_id: item.product_id._id,
            quantity: item.quantity,
            fullname,
            address,
            payment_method
        }));
        await Order.insertMany(orderDocs);
        await Cart.deleteMany({ user_id: req.user.id });
        res.json({ message: 'Order placed successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/orders/history — user order history
router.get('/history', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id })
            .populate('product_id')
            .sort({ created_at: -1 })
            .limit(50);
        res.json(orders);
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/orders/receipt — last 10 orders as JSON for receipt page
router.get('/receipt', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email');
        const orders = await Order.find({ user_id: req.user.id })
            .populate('product_id')
            .sort({ created_at: -1 })
            .limit(10);
        res.json({ user, orders });
    } catch { res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/orders/receipt/pdf — download PDF receipt (replaces generate_pdf.php + fpdf)
router.get('/receipt/pdf', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email');
        const orders = await Order.find({ user_id: req.user.id })
            .populate('product_id')
            .sort({ created_at: -1 })
            .limit(10);

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Receipt.pdf');
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Order Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text(`Name: ${orders[0]?.fullname || user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.moveDown();

        // Table header
        const startX = 50;
        let y = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Product', startX, y, { width: 180 });
        doc.text('Price', startX + 185, y, { width: 70 });
        doc.text('Qty', startX + 260, y, { width: 50 });
        doc.text('Subtotal', startX + 315, y, { width: 80 });
        doc.text('Date', startX + 400, y, { width: 100 });
        doc.moveDown(0.5);
        doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);

        let total = 0;
        doc.font('Helvetica');
        orders.forEach(order => {
            const p = order.product_id;
            const subtotal = p.price * order.quantity;
            total += subtotal;
            y = doc.y;
            doc.text(p.name.substring(0, 22), startX, y, { width: 180 });
            doc.text(`${p.price} tk`, startX + 185, y, { width: 70 });
            doc.text(`${order.quantity}`, startX + 260, y, { width: 50 });
            doc.text(`${subtotal} tk`, startX + 315, y, { width: 80 });
            doc.text(new Date(order.created_at).toLocaleDateString(), startX + 400, y, { width: 100 });
            doc.moveDown(0.5);
        });

        doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold');
        doc.text(`Total: ${total} tk`, { align: 'right' });
        doc.end();
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;