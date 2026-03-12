/**
 * Chat Controller
 * Handles real-time chat messaging between users and shopkeepers
 */

const asyncHandler = require('../utils/asyncHandler');
const Chat = require('../models/Chat');
const RepairRequest = require('../models/RepairRequest');

/**
 * @route   GET /api/chat/:requestId
 * @desc    Get all chat messages for a repair request
 * @access  Private
 */
const getChatMessages = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    // Verify request exists
    const request = await RepairRequest.findById(requestId);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Get all messages for this request
    const messages = await Chat.find({ requestId })
        .populate('senderId', 'name email role')
        .populate('receiverId', 'name email role')
        .sort({ createdAt: 1 }); // Oldest first

    res.json({
        success: true,
        count: messages.length,
        data: messages
    });
});

/**
 * @route   POST /api/chat
 * @desc    Send a chat message
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { requestId, receiverId, message } = req.body;

    // Verify request exists
    const request = await RepairRequest.findById(requestId);

    if (!request) {
        res.status(404);
        throw new Error('Repair request not found');
    }

    // Create chat message
    const chatMessage = await Chat.create({
        requestId,
        senderId: req.user._id,
        receiverId,
        message
    });

    // Populate sender and receiver details
    await chatMessage.populate('senderId', 'name email role');
    await chatMessage.populate('receiverId', 'name email role');

    res.status(201).json({
        success: true,
        data: chatMessage
    });
});

module.exports = {
    getChatMessages,
    sendMessage
};
