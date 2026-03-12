/**
 * Admin Routes
 * Routes for admin operations
 */

const express = require('express');
const router = express.Router();
const {
    getAllShopkeepers,
    verifyShopkeeper,
    deleteUser,
    getPlatformStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleAuth');

// All routes are protected and admin-only
router.use(protect);
router.use(isAdmin);

// @route   GET /api/admin/shopkeepers
// Get all shopkeepers
router.get('/shopkeepers', getAllShopkeepers);

// @route   PUT /api/admin/verify/:id
// Verify a shopkeeper
router.put('/verify/:id', verifyShopkeeper);

// @route   DELETE /api/admin/delete-user/:id
// Delete a user
router.delete('/delete-user/:id', deleteUser);

// @route   GET /api/admin/stats
// Get platform statistics
router.get('/stats', getPlatformStats);

module.exports = router;
