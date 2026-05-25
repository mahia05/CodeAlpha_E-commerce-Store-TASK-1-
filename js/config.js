// When running locally: http://localhost:5000/api
// When deployed on Render: replace with your actual Render backend URL
// Example: https://your-app-name.onrender.com/api

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://codealpha-e-commerce-store-task-1.onrender.com';