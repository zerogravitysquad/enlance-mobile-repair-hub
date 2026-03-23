/**
 * Request Validation Middleware
 * Uses express-validator to validate incoming requests
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return res.status(400).json({
            success: false,
            message: firstError || 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['user', 'shopkeeper', 'admin'])
        .withMessage('Invalid role'),
    body('city')
        .if(body('role').equals('shopkeeper'))
        .notEmpty()
        .withMessage('City is required for shopkeepers'),
    body('mobile')
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^\d{10}$/)
        .withMessage('Please provide a valid 10-digit mobile number'),
    handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Validation rules for repair request
 */
const validateRepairRequest = [
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('brand')
        .trim()
        .notEmpty()
        .withMessage('Brand is required'),
    body('model')
        .trim()
        .notEmpty()
        .withMessage('Model is required'),
    body('city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    handleValidationErrors
];

/**
 * Validation rules for quotation
 */
const validateQuotation = [
    body('requestId')
        .notEmpty()
        .withMessage('Request ID is required')
        .isMongoId()
        .withMessage('Invalid request ID'),
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required'),
    handleValidationErrors
];

/**
 * Validation rules for rating
 */
const validateRating = [
    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    handleValidationErrors
];

/**
 * Validation rules for chat message
 */
const validateChatMessage = [
    body('requestId')
        .notEmpty()
        .withMessage('Request ID is required')
        .isMongoId()
        .withMessage('Invalid request ID'),
    body('receiverId')
        .notEmpty()
        .withMessage('Receiver ID is required')
        .isMongoId()
        .withMessage('Invalid receiver ID'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message cannot be empty'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateRepairRequest,
    validateQuotation,
    validateRating,
    validateChatMessage
};
