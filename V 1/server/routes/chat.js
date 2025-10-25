const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  createOrGetConversation,
  markConversationAsRead
} = require('../controllers/chatController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les conversations
router.get('/conversations', getConversations);
router.post('/conversations', createOrGetConversation);
router.put('/conversations/:conversationId/read', markConversationAsRead);

// Routes pour les messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router;
