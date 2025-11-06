const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Conversations
router.post('/conversations', messageController.createOrGetConversation);
router.get('/conversations', messageController.getConversations);
router.put('/conversations/:conversationId/read', messageController.markConversationAsRead);
router.delete('/conversations/:conversationId', messageController.deleteConversation);

// Messages
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);

// Compteur de non lus
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;
