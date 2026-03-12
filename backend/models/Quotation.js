/**
 * Quotation Model
 * Represents shopkeeper quotations for repair requests
 */

const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RepairRequest',
        required: [true, 'Request ID is required']
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Shop ID is required']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index to prevent duplicate quotations from same shop for same request
quotationSchema.index({ requestId: 1, shopId: 1 }, { unique: true });

// Index for faster queries
quotationSchema.index({ requestId: 1, createdAt: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);
