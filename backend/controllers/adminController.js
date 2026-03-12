/**
 * Admin Controller
 * Handles admin-specific operations like shopkeeper verification
 */

const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * @route   GET /api/admin/shopkeepers
 * @desc    Get all shopkeepers with verification status
 * @access  Private (Admin only)
 */
const getAllShopkeepers = asyncHandler(async (req, res) => {
    const shopkeepers = await User.find({ role: 'shopkeeper' })
        .select('-password')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: shopkeepers.length,
        data: shopkeepers
    });
});

/**
 * @route   PUT /api/admin/verify/:id
 * @desc    Verify a shopkeeper
 * @access  Private (Admin only)
 */
const verifyShopkeeper = asyncHandler(async (req, res) => {
    const shopkeeper = await User.findById(req.params.id);

    if (!shopkeeper) {
        res.status(404);
        throw new Error('Shopkeeper not found');
    }

    if (shopkeeper.role !== 'shopkeeper') {
        res.status(400);
        throw new Error('This user is not a shopkeeper');
    }

    shopkeeper.verified = true;
    await shopkeeper.save();

    res.json({
        success: true,
        message: 'Shopkeeper verified successfully',
        data: shopkeeper
    });
});

/**
 * @route   DELETE /api/admin/delete-user/:id
 * @desc    Delete a user account
 * @access  Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot delete your own account');
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin only)
 */
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalShopkeepers = await User.countDocuments({ role: 'shopkeeper' });
    const verifiedShopkeepers = await User.countDocuments({ role: 'shopkeeper', verified: true });
    const pendingShopkeepers = await User.countDocuments({ role: 'shopkeeper', verified: false });

    const RepairRequest = require('../models/RepairRequest');
    const totalRequests = await RepairRequest.countDocuments();
    const completedRequests = await RepairRequest.countDocuments({ status: 'completed' });

    res.json({
        success: true,
        data: {
            users: {
                total: totalUsers
            },
            shopkeepers: {
                total: totalShopkeepers,
                verified: verifiedShopkeepers,
                pending: pendingShopkeepers
            },
            requests: {
                total: totalRequests,
                completed: completedRequests
            }
        }
    });
});

module.exports = {
    getAllShopkeepers,
    verifyShopkeeper,
    deleteUser,
    getPlatformStats
};
