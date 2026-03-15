/**
 * Role-Based Authorization Middleware
 * Restricts access based on user roles
 */

/**
 * Check if user is a shopkeeper
 */
const isShopkeeper = (req, res, next) => {
    if (req.user && (req.user.role === 'shopkeeper' || req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. Shopkeeper role required.');
    }
};

/**
 * Check if shopkeeper is verified by admin
 */
const isVerifiedShopkeeper = (req, res, next) => {
    if (req.user && (req.user.role === 'shopkeeper' || req.user.role === 'user') && req.user.verified) {
        next();
    } else if (req.user && req.user.role === 'shopkeeper' && !req.user.verified) {
        res.status(403);
        throw new Error('Access denied. Please wait for admin verification.');
    } else {
        res.status(403);
        throw new Error('Access denied. Verified shopkeeper role required.');
    }
};

/**
 * Check if user is an admin
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. Admin role required.');
    }
};

/**
 * Check if user is a regular user (not shopkeeper or admin)
 */
const isUser = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'shopkeeper' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Access denied. User role required.');
    }
};

module.exports = {
    isShopkeeper,
    isVerifiedShopkeeper,
    isAdmin,
    isUser
};
