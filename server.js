// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log('⚠️  MongoDB URI not found, running without database...');
}

const app = express();

// CORS Configuration - FIX FOR YOUR ERROR
const corsOptions = {
  origin: [
    'http://localhost:3000',  // React development server
    'http://localhost:3001',  // Alternative React port
    'http://127.0.0.1:3000',  // Alternative localhost format
  ],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Garba Booking Backend is running!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    cors: 'enabled for ' + req.get('Origin')
  });
});

// Load routes
try {
  const paymentRoutes = require('./routes/payment');
  app.use('/api', paymentRoutes);
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.log('⚠️  Payment routes not found, skipping...');
}

try {
  const ticketRoutes = require('./routes/tickets');
  app.use('/api', ticketRoutes);
  console.log('✅ Ticket routes loaded');
} catch (error) {
  console.log('⚠️  Ticket routes not found, skipping...');
}

try {
  const emailRoutes = require('./routes/email');
  app.use('/api', emailRoutes);
  console.log('✅ Email routes loaded');
} catch (error) {
  console.log('⚠️  Email routes not found, skipping...');
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('/*catchAll', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

  
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
});
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'x-rtb-fingerprint-id');
    next();
  });