const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Créer ou récupérer une conversation
exports.createOrGetConversation = async (req, res) => {
  try {
    const { targetUserId, context = {} } = req.body;
    const currentUserId = req.user.sub;

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
      isActive: true
    }).populate('participants', 'firstName lastName email role profilePhotoUrl');

    // Si pas de conversation, en créer une nouvelle
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUserId],
        context,
        unreadCount: new Map([
          [currentUserId.toString(), 0],
          [targetUserId.toString(), 0]
        ])
      });
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName email role profilePhotoUrl');

      // Message système de bienvenue
      const systemMessage = new Message({
        conversationId: conversation._id,
        senderId: currentUserId,
        content: 'Conversation démarrée',
        type: 'system'
      });
      await systemMessage.save();
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Erreur création conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
};

// Récupérer toutes les conversations de l'utilisateur
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'firstName lastName email role profilePhotoUrl companyName')
      .populate('lastMessage.senderId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Ajouter les informations de l'autre participant
    const conversationsWithDetails = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      const unreadCount = conv.unreadCount?.[userId.toString()] || 0;

      return {
        ...conv,
        otherParticipant,
        unreadCount
      };
    });

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });

    res.json({
      conversations: conversationsWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};

// Récupérer les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier que l'utilisateur est participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
      .populate('senderId', 'firstName lastName profilePhotoUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    // Marquer les messages comme lus
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: { readBy: { userId, readAt: new Date() } }
      }
    );

    // Réinitialiser le compteur de non lus
    await conversation.resetUnread(userId);

    res.json({
      messages: messages.reverse(), // Ordre chronologique
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', metadata = {} } = req.body;
    const senderId = req.user.sub;

    // Vérifier la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    if (!conversation.isParticipant(senderId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Créer le message
    const message = new Message({
      conversationId,
      senderId,
      content,
      type,
      metadata,
      readBy: [{ userId: senderId, readAt: new Date() }]
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName profilePhotoUrl');

    // Mettre à jour la conversation
    conversation.lastMessage = {
      content,
      senderId,
      timestamp: message.createdAt,
      type
    };

    // Incrémenter le compteur pour l'autre participant
    const otherParticipantId = conversation.getOtherParticipant(senderId);
    if (otherParticipantId) {
      await conversation.incrementUnread(otherParticipantId);
    }

    await conversation.save();

    res.status(201).json({ message });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

// Marquer une conversation comme lue
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await conversation.resetUnread(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage lecture:', error);
    res.status(500).json({ error: 'Erreur lors du marquage comme lu' });
  }
};

// Obtenir le nombre total de messages non lus
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    }).lean();

    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount?.[userId.toString()] || 0);
    }, 0);

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Erreur comptage non lus:', error);
    res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
  }
};

// Supprimer une conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression conversation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
