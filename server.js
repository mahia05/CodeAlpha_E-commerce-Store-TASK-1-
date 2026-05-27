require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./database/db');

const app = express();
connectDB();

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', require('./web/js/routes/authRoutes'));
app.use('/api/admin', require('./web/js/routes/adminRoutes'));
app.use('/api/products', require('./web/js/routes/productsRoutes'));
app.use('/api/cart', require('./web/js/routes/cartRoutes'));
app.use('/api/orders', require('./web/js/routes/ordersRoutes'));
app.get('/', (req, res) => {
    res.json({ status: 'Handmade Marketplace API is running', time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));