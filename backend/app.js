/**
 * Express Application Configuration
 * Main app setup with middleware and routes
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Helmet - Set security headers
app.use(helmet());

// CORS - Allow cross-origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Set specific origin in production
    credentials: true
}));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// ========================================
// LOGGING MIDDLEWARE
// ========================================

// Morgan - HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ========================================
// BODY PARSING MIDDLEWARE
// ========================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ========================================
// STATIC FILES
// ========================================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================================
// API ROUTES
// ========================================

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'ENLANCE API - Real Time Mobile Repair Tracker',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: '/api/auth',
            user: '/api',
            shop: '/api',
            chat: '/api/chat',
            admin: '/api/admin'
        }
    });
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/shopRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler - Must be after all routes
app.use(notFound);

// Global error handler - Must be last
app.use(errorHandler);

module.exports = app;
