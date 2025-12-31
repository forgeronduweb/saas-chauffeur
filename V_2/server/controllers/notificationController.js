const Notification = require('../models/Notification');

// Récupérer les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20, unread } = req.query;

    const filter = { userId };
    if (unread === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      notifications: notifications.map(n => ({
        _id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority || 'normal',
        unread: !n.isRead,
        actionText: n.actionText,
        actionUrl: n.actionUrl,
        data: n.data,
        createdAt: n.createdAt
      })),
      unreadCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    console.log(`✅ Notification ${id} marquée comme lue pour user ${userId}`);

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    console.log(`✅ ${result.modifiedCount} notifications marquées comme lues pour user ${userId}`);

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Erreur marquage toutes notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Compter les notifications non lues
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub;
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
