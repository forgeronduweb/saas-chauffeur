const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Envoyer un message
router.post('/send', messageController.sendMessage);

// Récupérer les conversations
router.get('/conversations', messageController.getConversations);

// Récupérer les messages d'une conversation
router.get('/conversations/:conversationId/messages', messageController.getMessages);

// Marquer une conversation comme lue
router.patch('/conversations/:conversationId/read', messageController.markAsRead);

module.exports = router;
