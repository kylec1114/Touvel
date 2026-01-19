const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/ai', require('./routes/ai'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/trips', require('./routes/trips'));
app.use('/api/destinations', require('./routes/destinations'));
// app.use('/api/itinerary', require('./routes/itinerary'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Touvel Travel Booking API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/me': 'Get current user'
      },
      products: {
        'GET /api/products': 'Search products',
        'GET /api/products/:id': 'Get product details',
        'GET /api/products/:id/availability': 'Get product availability'
      },
      suppliers: {
        'POST /api/suppliers/products': 'Create product (supplier)',
        'GET /api/suppliers/products': 'List supplier products',
        'PUT /api/suppliers/products/:id': 'Update product',
        'GET /api/suppliers/inventory/:productId/calendar': 'Get inventory calendar',
        'PUT /api/suppliers/inventory/:productId': 'Update inventory'
      },
      bookings: {
        'POST /api/bookings/quote': 'Create quote',
        'POST /api/bookings': 'Create booking',
        'POST /api/bookings/:id/confirm': 'Confirm booking',
        'POST /api/bookings/:id/cancel': 'Cancel booking',
        'GET /api/bookings/user/me': 'Get user bookings',
        'GET /api/bookings/:id': 'Get booking details'
      },
      ai: {
        'POST /api/ai/itineraries/generate': 'Generate AI itinerary',
        'GET /api/ai/itineraries': 'List user itineraries',
        'GET /api/ai/itineraries/:id': 'Get itinerary details',
        'POST /api/ai/itineraries/:id/attach-products': 'Attach products to itinerary'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;
