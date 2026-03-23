/**
 * Repair Request Model
 * Represents user's mobile repair requests
 */

const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    imagePath: {
        type: String,
        required: false, // MADE OPTIONAL for emergency resilience
        trim: true
    },description: {
        type: String,
        required: [true, 'Please provide a description of the issue'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please specify the device brand'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Please specify the device model'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'Please specify your city'],
        trim: true
    },
    area: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'quoted', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    selectedShop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Set when user accepts a quotation
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries by city and status
repairRequestSchema.index({ city: 1, status: 1 });
repairRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
