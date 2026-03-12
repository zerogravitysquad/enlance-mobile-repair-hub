/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

// Load environment variables
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║     🚀 ENLANCE Backend Server                         ║');
    console.log('║     Real Time Mobile Repair Tracker                   ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n📡 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 Listening on port ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`\n⏰ Started at: ${new Date().toLocaleString()}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    console.error(err.stack);

    // Close server & exit process
    server.close(() => {
        console.log('🛑 Server closed due to unhandled rejection');
        process.exit(1);
    });
});

// Handle SIGTERM signal (graceful shutdown)
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received');
    console.log('🛑 Closing server gracefully...');

    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
