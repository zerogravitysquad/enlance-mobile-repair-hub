/**
 * User Controller
 * Handles user repair requests, quotations, ratings
 */

const asyncHandler = require('../utils/asyncHandler');
const RepairRequest = require('../models/RepairRequest');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Ensure uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'repair-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
    },
    fileFilter: fileFilter
});

/**
 * @route   POST /api/request
 * @desc    Create new repair request
 * @access  Private (User only)
 */
const createRepairRequest = asyncHandler(async (req, res) => {
    const { description, brand, model, city, area } = req.body;

    // Check if image was uploaded
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image of the device');
    }

    // Create repair request
    const repairRequest = await RepairRequest.create({
        userId: req.user._id,
        imagePath: req.file.path,
        description,
        brand,
        model,
        city,
        area
    });

    res.status(201).json({
        success: true,
        data: repairRequest
    });
});

/**
 * @route   GET /api/request/user/:id
 * @desc    Get all repair requests for a user
 * @access  Private
 */
const getUserRequests = asyncHandler(async (req, res) => {
    const requests = await RepairRequest.find({ userId: req.params.id })
        .populate('selectedShop', 'name email rating locationLink')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: requests.length,
        data: requests
    });
});

/**
 * @route   PUT /api/request/accept/:id
 * @desc    Accept a quotation for repair request
 * @access  Private (User only)
 */
const acceptQuotation = asyncHandler(async (req, res) => {
    const { shopId } = req.body;

    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Verify user owns this request
    if (request.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this request');
    }

    // Verify quotation exists from this shop
    const quotation = await Quotation.findOne({
        requestId: req.params.id,
        shopId: shopId
    });

    if (!quotation) {
        res.status(404);
        throw new Error('Quotation not found from this shop');
    }

    // Update request status
    request.status = 'accepted';
    request.selectedShop = shopId;

    await request.save();

    res.json({
        success: true,
        data: request
    });
});

/**
 * @route   PUT /api/request/reject/:id
 * @desc    Reject a quotation with reason
 * @access  Private (User only)
 */
const rejectQuotation = asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;

    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Verify user owns this request
    if (request.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this request');
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'No reason provided';

    await request.save();

    res.json({
        success: true,
        data: request
    });
});

/**
 * @route   PUT /api/request/complete/:id
 * @desc    Mark repair as completed by user
 * @access  Private (User only)
 */
const completeRepair = asyncHandler(async (req, res) => {
    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Verify user owns this request
    if (request.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this request');
    }

    request.status = 'completed';
    await request.save();

    res.json({
        success: true,
        data: request
    });
});

/**
 * @route   POST /api/request/rate/:id
 * @desc    Rate shopkeeper after completion
 * @access  Private (User only)
 */
const rateShopkeeper = asyncHandler(async (req, res) => {
    const { rating } = req.body;

    const request = await RepairRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Verify user owns this request
    if (request.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to rate this repair');
    }

    // Check if repair is completed
    if (request.status !== 'completed') {
        res.status(400);
        throw new Error('Can only rate completed repairs');
    }

    // Check if shop was selected
    if (!request.selectedShop) {
        res.status(400);
        throw new Error('No shop selected for this repair');
    }

    // Update shopkeeper rating
    const shopkeeper = await User.findById(request.selectedShop);

    if (!shopkeeper) {
        res.status(404);
        throw new Error('Shopkeeper not found');
    }

    shopkeeper.updateRating(rating);
    await shopkeeper.save();

    res.json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
            shopkeeper: {
                name: shopkeeper.name,
                rating: shopkeeper.rating,
                ratingCount: shopkeeper.ratingCount
            }
        }
    });
});

module.exports = {
    createRepairRequest,
    getUserRequests,
    acceptQuotation,
    rejectQuotation,
    completeRepair,
    rateShopkeeper,
    upload // Export upload middleware
};
