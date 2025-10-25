const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Obtenir toutes les conversations d'un utilisateur
const getConversations = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    })
    .populate('participants.userId', 'firstName lastName email role')
    .sort({ updatedAt: -1 })
    .limit(50);

    // Transformer les données pour le frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId._id.toString() !== userId);
      const unreadCount = conv.unreadCount.get(userId) || 0;
      
      return {
        _id: conv._id,
        otherParticipant: {
          id: otherParticipant.userId._id,
          name: otherParticipant.name,
          role: otherParticipant.role,
          avatar: otherParticipant.avatar
        },
        lastMessage: conv.lastMessage,
        unreadCount,
        context: conv.context,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les messages d'une conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Récupérer les messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'firstName lastName role');

    // Marquer les messages comme lus
    const unreadMessages = messages.filter(msg => 
      msg.senderId._id.toString() !== userId && 
      !msg.readBy.some(read => read.userId.toString() === userId)
    );

    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg => {
        msg.markAsReadBy(userId);
        return msg.save();
      }));

      // Mettre à jour le compteur de la conversation
      conversation.markAsRead(userId);
      await conversation.save();
    }

    // Inverser l'ordre pour avoir les plus récents en bas
    const formattedMessages = messages.reverse().map(msg => ({
      _id: msg._id,
      content: msg.content,
      senderId: msg.senderId._id,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      type: msg.type,
      metadata: msg.metadata,
      createdAt: msg.createdAt,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      isReadBy: msg.readBy.map(read => ({
        userId: read.userId,
        readAt: read.readAt
      }))
    }));

    res.json({
      messages: formattedMessages,
      hasMore: messages.length === limit,
      page,
      total: await Message.countDocuments({ conversationId, isDeleted: false })
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Envoyer un message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', metadata = {} } = req.body;
    const userId = req.user.sub;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Récupérer les infos de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Créer le message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role === 'client' ? 'employer' : 'driver',
      content: content.trim(),
      type,
      metadata
    });

    await message.save();

    // Populer les données pour la réponse
    await message.populate('senderId', 'firstName lastName role');

    const formattedMessage = {
      _id: message._id,
      content: message.content,
      senderId: message.senderId._id,
      senderName: message.senderName,
      senderRole: message.senderRole,
      type: message.type,
      metadata: message.metadata,
      createdAt: message.createdAt,
      isEdited: message.isEdited,
      isReadBy: []
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer ou récupérer une conversation
const createOrGetConversation = async (req, res) => {
  try {
    const { targetUserId, context = {} } = req.body;
    const userId = req.user.sub;

    if (!targetUserId) {
      return res.status(400).json({ message: 'L\'ID de l\'utilisateur cible est requis' });
    }

    // Récupérer les infos des utilisateurs
    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer les infos supplémentaires pour les chauffeurs
    let targetUserInfo = {
      userId: targetUser._id,
      role: targetUser.role === 'client' ? 'employer' : 'driver',
      name: `${targetUser.firstName} ${targetUser.lastName}`
    };

    let currentUserInfo = {
      userId: currentUser._id,
      role: currentUser.role === 'client' ? 'employer' : 'driver',
      name: `${currentUser.firstName} ${currentUser.lastName}`
    };

    // Trouver ou créer la conversation
    const conversation = await Conversation.findOrCreate(
      currentUserInfo,
      targetUserInfo,
      context
    );

    await conversation.populate('participants.userId', 'firstName lastName email role');

    // Formater pour le frontend
    const otherParticipant = conversation.participants.find(p => 
      p.userId._id.toString() !== userId
    );

    const formattedConversation = {
      _id: conversation._id,
      otherParticipant: {
        id: otherParticipant.userId._id,
        name: otherParticipant.name,
        role: otherParticipant.role,
        avatar: otherParticipant.avatar
      },
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount.get(userId) || 0,
      context: conversation.context,
      updatedAt: conversation.updatedAt
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Erreur lors de la création/récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer une conversation comme lue
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    conversation.markAsRead(userId);
    await conversation.save();

    res.json({ message: 'Conversation marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  createOrGetConversation,
  markConversationAsRead
};
