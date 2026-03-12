/**
 * Shopkeeper Routes
 * Routes for shopkeeper-specific operations
 */

const express = require('express');
const router = express.Router();
const {
    getRequestsByCity,
    sendQuotation,
    markShopComplete,
    getQuotationsForRequest
} = require('../controllers/shopController');
const { protect } = require('../middleware/auth');
const { isShopkeeper, isVerifiedShopkeeper } = require('../middleware/roleAuth');
const { validateQuotation } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// @route   GET /api/request/city/:city
// Get requests by city (verified shopkeeper only)
router.get('/request/city/:city', isVerifiedShopkeeper, getRequestsByCity);

// @route   POST /api/quotation
// Send quotation (verified shopkeeper only)
router.post('/quotation', isVerifiedShopkeeper, validateQuotation, sendQuotation);

// @route   PUT /api/request/shop-complete/:id
// Mark repair as completed (shopkeeper only)
router.put('/request/shop-complete/:id', isShopkeeper, markShopComplete);

// @route   GET /api/quotation/request/:requestId
// Get all quotations for a request
router.get('/quotation/request/:requestId', getQuotationsForRequest);

module.exports = router;
