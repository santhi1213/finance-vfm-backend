const dotenv = require('dotenv');
dotenv.config();

// Now require other modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const agentRoutes = require('./routes/agentRoutes');
const saleRoutes = require('./routes/saleRoutes');
const emiRoutes = require('./routes/emiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoleRoutes = require('./routes/customerRoutes1');
const agentRoleRoutes = require('./routes/agentRoutes1');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const reminderService = require('./services/reminderService');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
console.log('\n📌 Registering Routes:');
app.use('/api/auth', authRoutes);
console.log('  ✅ /api/auth');
app.use('/api/auth/admin', adminRoutes);
console.log('  ✅ /api/auth/admin');
app.use('/api/vehicles', vehicleRoutes);
console.log('  ✅ /api/vehicles');
app.use('/api/customers', customerRoutes);
console.log('  ✅ /api/customers');
app.use('/api/agents', agentRoutes);
console.log('  ✅ /api/agents');
app.use('/api/sales', saleRoutes);
console.log('  ✅ /api/sales');
app.use('/api/emis', emiRoutes);
console.log('  ✅ /api/emis');
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customer', customerRoleRoutes);
console.log('  ✅ /api/customer');
app.use('/api/agent', agentRoleRoutes);
console.log('  ✅ /api/agent');
app.use('/api/notifications', notificationRoutes);
console.log('  ✅ /api/notifications');
app.use('/api/payments', paymentRoutes);
console.log('  ✅ /api/payments');

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  reminderService.startReminderScheduler();
  console.log('📧 Automated reminder scheduler started');
} else {
  console.log('⚠️ Email not configured - reminders disabled');
}

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Vehicle Management API',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      customers: '/api/customers',
      agents: '/api/agents',
      sales: '/api/sales',
      emis: '/api/emis',
      payments: '/api/payments'
    }
  });
});

// Test endpoint
app.get('/api/test-env', (req, res) => {
  res.json({
    razorpay_key_exists: !!process.env.RAZORPAY_KEY_ID,
    razorpay_secret_exists: !!process.env.RAZORPAY_KEY_SECRET,
    node_env: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🧪 Test Env: http://localhost:${PORT}/api/test-env`);
  console.log(`💳 Payment Config: http://localhost:${PORT}/api/payments/config-status`);
});