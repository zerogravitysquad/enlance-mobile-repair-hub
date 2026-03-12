/**
 * Chat Routes
 * Routes for real-time messaging
 */

const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// @route   GET /api/chat/:requestId
// Get all messages for a repair request
router.get('/:requestId', getChatMessages);

// @route   POST /api/chat
// Send a chat message
router.post('/', validateChatMessage, sendMessage);

module.exports = router;
