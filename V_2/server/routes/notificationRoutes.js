const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Récupérer les notifications
router.get('/', notificationController.getNotifications);

// Compter les non lues
router.get('/unread-count', notificationController.getUnreadCount);

// Marquer toutes comme lues
router.put('/mark-all-read', notificationController.markAllAsRead);

// Marquer une notification comme lue
router.put('/:id/read', notificationController.markAsRead);

// Supprimer une notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
