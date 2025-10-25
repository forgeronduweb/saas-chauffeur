const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notificationController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les notifications
router.get('/', getMyNotifications); // Mes notifications
router.post('/', createNotification); // Créer une notification (admin)
router.put('/:notificationId/read', markAsRead); // Marquer comme lue
router.put('/read-all', markAllAsRead); // Marquer toutes comme lues
router.delete('/:notificationId', deleteNotification); // Supprimer

module.exports = router;
