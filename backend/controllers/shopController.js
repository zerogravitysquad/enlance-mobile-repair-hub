/**
 * Shopkeeper Controller
 * Handles shopkeeper-specific operations
 */

const asyncHandler = require('../utils/asyncHandler');
const RepairRequest = require('../models/RepairRequest');
const Quotation = require('../models/Quotation');
const User = require('../models/User');

/**
 * @route   GET /api/request/city/:city
 * @desc    Get repair requests filtered by city
 * @access  Private (Verified Shopkeeper only)
 */
const getRequestsByCity = asyncHandler(async (req, res) => {
    const { city } = req.params;

    // Get pending and quoted requests in shopkeeper's city
    const requests = await RepairRequest.find({
        city: city,
        status: { $in: ['pending', 'quoted'] }
    })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: requests.length,
        data: requests
    });
});

/**
 * @route   POST /api/quotation
 * @desc    Send quotation for repair request
 * @access  Private (Verified Shopkeeper only)
 */
const sendQuotation = asyncHandler(async (req, res) => {
    const { requestId, price, message } = req.body;

    // Check if request exists
    const request = await RepairRequest.findById(requestId);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Check if request is still pending or quoted
    if (!['pending', 'quoted'].includes(request.status)) {
        res.status(400);
        throw new Error('Cannot send quotation for this request - already accepted/rejected/completed');
    }

    // Check if shopkeeper already sent quotation for this request
    const existingQuotation = await Quotation.findOne({
        requestId,
        shopId: req.user._id
    });

    if (existingQuotation) {
        res.status(400);
        throw new Error('You have already sent a quotation for this request');
    }

    // Create quotation
    const quotation = await Quotation.create({
        requestId,
        shopId: req.user._id,
        price,
        message
    });

    // Update request status to 'quoted' if still pending
    if (request.status === 'pending') {
        request.status = 'quoted';
        await request.save();
    }

    // Populate quotation with shop details
    await quotation.populate('shopId', 'name email rating locationLink');

    res.status(201).json({
        success: true,
        data: quotation
    });
});

/**
 * @route   PUT /api/request/shop-complete/:id
 * @desc    Mark repair as completed by shopkeeper
 * @access  Private (Shopkeeper only)
 */
const markShopComplete = asyncHandler(async (req, res) => {
    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Verify shopkeeper is the selected shop
    if (!request.selectedShop || request.selectedShop.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to complete this repair');
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
        res.status(400);
        throw new Error('Can only complete accepted repairs');
    }

    request.status = 'completed';
    await request.save();

    res.json({
        success: true,
        data: request
    });
});

/**
 * @route   GET /api/quotation/request/:requestId
 * @desc    Get all quotations for a specific request (sorted by shop rating)
 * @access  Private
 */
const getQuotationsForRequest = asyncHandler(async (req, res) => {
    const quotations = await Quotation.find({ requestId: req.params.requestId })
        .populate('shopId', 'name email rating ratingCount locationLink city')
        .sort({ createdAt: -1 });

    // Sort by shop rating (highest first)
    quotations.sort((a, b) => b.shopId.rating - a.shopId.rating);

    res.json({
        success: true,
        count: quotations.length,
        data: quotations
    });
});

module.exports = {
    getRequestsByCity,
    sendQuotation,
    markShopComplete,
    getQuotationsForRequest
};
