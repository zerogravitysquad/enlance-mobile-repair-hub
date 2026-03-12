/**
 * Chat Model
 * Represents chat messages between users and shopkeepers
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RepairRequest',
        required: [true, 'Request ID is required']
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender ID is required']
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Receiver ID is required']
    },
    message: {
        type: String,
        required: [true, 'Message cannot be empty'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster chat queries
chatSchema.index({ requestId: 1, createdAt: 1 });

module.exports = mongoose.model('Chat', chatSchema);
