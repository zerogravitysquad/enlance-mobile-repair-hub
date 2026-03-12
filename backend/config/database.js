/**
 * Database Configuration
 * MongoDB connection setup using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise} - MongoDB connection promise
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ no longer requires these options
            // useNewUrlParser and useUnifiedTopology are now defaults
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
