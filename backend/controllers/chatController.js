/**
 * Chat Controller
 * Handles real-time chat messaging between users and shopkeepers
 */

const asyncHandler = require('../utils/asyncHandler');
const Chat = require('../models/Chat');
const RepairRequest = require('../models/RepairRequest');
const Quotation = require('../models/Quotation');

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

/**
 * @route   GET /api/chat/rooms
 * @desc    Get all chat rooms (as user or shopkeeper)
 * @access  Private
 */
const getChatRooms = asyncHandler(async (req, res) => {
    let rooms = [];

    if (req.user.role === 'user') {
        const requests = await RepairRequest.find({ userId: req.user._id });
        const requestIds = requests.map(r => r._id);

        const quotations = await Quotation.find({ requestId: { $in: requestIds } })
            .populate('shopId', 'name rating locationLink area city');

        rooms = await Promise.all(quotations.map(async q => {
            const messages = await Chat.find({ requestId: q.requestId }).sort({ createdAt: 1 });
            const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

            if (!q.shopId) return null;

            return {
                id: q._id.toString(),
                requestId: q.requestId.toString(),
                shopId: q.shopId._id.toString(),
                shopName: q.shopId.name,
                shopAvatar: q.shopId.name.charAt(0).toUpperCase(),
                shopRating: q.shopId.rating || 0,
                shopLocation: `${q.shopId.area}, ${q.shopId.city}`,
                shopLocationUrl: q.shopId.locationLink,
                userId: req.user._id.toString(),
                userName: req.user.name,
                userAvatar: req.user.name.charAt(0).toUpperCase(),
                status: 'pending',
                messages: messages.map(m => ({
                    id: m._id.toString(),
                    text: m.message,
                    sender: m.senderId.toString() === req.user._id.toString() ? 'user' : 'shop',
                    time: new Date(m.createdAt).toLocaleTimeString()
                })),
                lastMessage: lastMsg ? lastMsg.message : q.message,
                lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString() : new Date(q.createdAt).toLocaleTimeString(),
                quotation: q.price.toString()
            };
        }));
        rooms = rooms.filter(r => r !== null);
    } else {
        // Shopkeeper: find quotations sent by this shop
        const quotations = await Quotation.find({ shopId: req.user._id });

        rooms = await Promise.all(quotations.map(async q => {
            const request = await RepairRequest.findById(q.requestId).populate('userId', 'name');
            if (!request) return null;

            const messages = await Chat.find({ requestId: q.requestId }).sort({ createdAt: 1 });
            const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

            return {
                id: q._id.toString(),
                requestId: q.requestId.toString(),
                shopId: req.user._id.toString(),
                shopName: req.user.name,
                shopAvatar: req.user.name.charAt(0).toUpperCase(),
                shopRating: req.user.rating || 0,
                userId: request.userId._id.toString(),
                userName: request.userId.name,
                userAvatar: request.userId.name.charAt(0).toUpperCase(),
                status: 'accepted',
                messages: messages.map(m => ({
                    id: m._id.toString(),
                    text: m.message,
                    sender: m.senderId.toString() === req.user._id.toString() ? 'shop' : 'user',
                    time: new Date(m.createdAt).toLocaleTimeString()
                })),
                lastMessage: lastMsg ? lastMsg.message : q.message,
                lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString() : new Date(q.createdAt).toLocaleTimeString(),
                quotation: q.price.toString()
            };
        }));
        rooms = rooms.filter(r => r !== null);
    }

    res.json({
        success: true,
        data: rooms
    });
});

/**
 * @route   GET /api/chat/messages/:requestId
 * @desc    Get all messages for a request
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const messages = await Chat.find({ requestId }).sort({ createdAt: 1 });

    res.json({
        success: true,
        data: messages.map(m => ({
            id: m._id,
            text: m.message,
            sender: m.senderId.toString() === req.user._id.toString() ? (req.user.role === 'user' ? 'user' : 'shop') : (req.user.role === 'user' ? 'shop' : 'user'),
            time: new Date(m.createdAt).toLocaleTimeString(),
            timestamp: new Date(m.createdAt).getTime()
        }))
    });
});

module.exports = {
    getChatMessages,
    sendMessage,
    getChatRooms,
    getMessages
};
