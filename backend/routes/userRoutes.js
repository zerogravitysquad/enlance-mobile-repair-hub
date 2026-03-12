/**
 * User Routes
 * Routes for user repair requests and ratings
 */

const express = require('express');
const router = express.Router();
const {
    createRepairRequest,
    getUserRequests,
    acceptQuotation,
    rejectQuotation,
    completeRepair,
    rateShopkeeper,
    upload
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { isUser } = require('../middleware/roleAuth');
const { validateRepairRequest, validateRating } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// @route   POST /api/request
// Create repair request with image upload
router.post('/request', upload.single('image'), validateRepairRequest, createRepairRequest);

// @route   GET /api/request/user/:id
// Get user's repair requests
router.get('/request/user/:id', getUserRequests);

// @route   PUT /api/request/accept/:id
// Accept quotation (user only)
router.put('/request/accept/:id', isUser, acceptQuotation);

// @route   PUT /api/request/reject/:id
// Reject quotation (user only)
router.put('/request/reject/:id', isUser, rejectQuotation);

// @route   PUT /api/request/complete/:id
// Mark repair as completed (user only)
router.put('/request/complete/:id', isUser, completeRepair);

// @route   POST /api/request/rate/:id
// Rate shopkeeper (user only, after completion)
router.post('/request/rate/:id', isUser, validateRating, rateShopkeeper);

module.exports = router;
