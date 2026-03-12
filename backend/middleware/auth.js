/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 * Adds user object to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token (exclude password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }

        next();
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

module.exports = { protect };
