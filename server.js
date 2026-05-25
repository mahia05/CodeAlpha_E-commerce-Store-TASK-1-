require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
connectDB();

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/admin', require('./Routes/adminRoutes'));
app.use('/api/products', require('./Routes/productsRoutes'));
app.use('/api/cart', require('./Routes/cartRoutes'));
app.use('/api/orders', require('./Routes/ordersRoutes'));

app.get('/', (req, res) => res.json({ status: '✅ Handmade Marketplace API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));