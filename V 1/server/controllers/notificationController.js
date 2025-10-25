const Notification = require('../models/Notification');

// Récupérer les notifications de l'utilisateur connecté
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Construire le filtre
    const filter = { userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      unreadCount
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des notifications' 
    });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.sub;

    const notification = await Notification.findOne({ 
      _id: notificationId, 
      userId 
    });

    if (!notification) {
      return res.status(404).json({ 
        error: 'Notification non trouvée' 
      });
    }

    await notification.markAsRead();

    res.json({
      message: 'Notification marquée comme lue',
      notification
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la notification' 
    });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await Notification.updateMany(
      { userId, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({
      message: 'Toutes les notifications ont été marquées comme lues',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour des notifications' 
    });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.sub;

    const notification = await Notification.findOneAndDelete({ 
      _id: notificationId, 
      userId 
    });

    if (!notification) {
      return res.status(404).json({ 
        error: 'Notification non trouvée' 
      });
    }

    res.json({
      message: 'Notification supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la notification' 
    });
  }
};

// Créer une notification (pour les admins/système)
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, actionUrl, actionText } = req.body;

    // Validation des champs requis
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Les champs userId, type, title et message sont requis' 
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
      actionUrl,
      actionText
    });

    res.status(201).json({
      message: 'Notification créée avec succès',
      notification
    });

  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la notification' 
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
