const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
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

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========== DEBUGGING MIDDLEWARE ==========
// Log all requests
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'PATCH' || req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', req.body);
  }
  next();
});

// Swagger documentation
try {
  const swaggerSpec = require('./swagger/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger documentation loaded');
} catch (error) {
  console.log('⚠️ Swagger documentation not available:', error.message);
}

// ========== ROUTES ==========
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

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Vehicle Management API',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      customers: '/api/customers',
      agents: '/api/agents',
      sales: '/api/sales',
      emis: '/api/emis'
    }
  });
});

// Test endpoint for agents
app.get('/api/agents-test', (req, res) => {
  res.json({ success: true, message: 'Agents API is reachable' });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin,
    method: req.method
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

// 404 handler - This will catch any unmatched routes including OPTIONS
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
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🧪 Test CORS: http://localhost:${PORT}/api/test-cors`);
  console.log(`🔄 Agent toggle test: http://localhost:${PORT}/api/agents/YOUR_ID/toggle-status`);
  console.log(`\n💡 Make sure to use a valid agent ID from your database`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});