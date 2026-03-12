/**
 * JWT Token Generator Utility
 * Generates JSON Web Tokens for authentication
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @param {String} role - User role (user/shopkeeper/admin)
 * @returns {String} - JWT token
 */
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: process.env.JWT_EXPIRE || '30d' } // Options
    );
};

module.exports = generateToken;
