/**
 * Authentication Controller
 * Handles user registration and login
 */

const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user/shopkeeper/admin
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, city, address, mobile, locationLink } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password, // Will be hashed by pre-save middleware
        role: role || 'user',
        city: city, // Saving city for all if provided from UI
        address: address,
        mobile: mobile,
        locationLink: role === 'shopkeeper' ? locationLink : undefined,
        verified: role === 'shopkeeper' ? false : true // Shopkeepers need verification
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                address: user.address,
                mobile: user.mobile,
                verified: user.verified,
                locationLink: user.locationLink,
                token: generateToken(user._id, user.role)
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists
    if (user) {
        // For shopkeepers, bypass password check since they register via Google Forms without a password
        const isShopkeeper = user.role === 'shopkeeper';
        const isPasswordMatch = await user.matchPassword(password);

        if (isShopkeeper || isPasswordMatch) {
            return res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    city: user.city,
                    rating: user.rating,
                    ratingCount: user.ratingCount,
                    verified: user.verified,
                    locationLink: user.locationLink,
                    token: generateToken(user._id, user.role)
                }
            });
        }
    }

    // If not found, or password doesn't match for non-shopkeeper
    res.status(401);
    throw new Error('Invalid email or password');
});

module.exports = {
    register,
    login
};
