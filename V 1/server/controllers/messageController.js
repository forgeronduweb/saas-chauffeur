const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { createNotification } = require('../services/notificationService');

// Envoyer un message
exports.sendMessage = async (req, res) => {
  console.log('='.repeat(50));
  console.log('📨 DÉBUT sendMessage');
  console.log('='.repeat(50));
  
  try {
    console.log('Body reçu:', JSON.stringify(req.body, null, 2));
    console.log('User authentifié:', JSON.stringify(req.user, null, 2));
    
    const { recipientId, message, applicationId } = req.body;
    const senderId = req.user?.sub || req.user?.id || req.user?._id;
    
    console.log('SenderId extrait:', senderId);

    // Validation
    if (!recipientId || !message) {
      console.log('❌ Validation échouée - recipientId ou message manquant');
      return res.status(400).json({ 
        success: false, 
        message: 'Destinataire et message requis' 
      });
    }
    
    console.log('✅ Validation OK - recipientId:', recipientId, 'senderId:', senderId);

    // Récupérer les informations de l'expéditeur
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expéditeur non trouvé' 
      });
    }

    // Récupérer les informations du destinataire
    // Le recipientId peut être soit un User ID, soit un Driver ID
    let recipient = await User.findById(recipientId);
    
    // Si pas trouvé, c'est peut-être un Driver ID, cherchons le User associé
    if (!recipient) {
      const driverProfile = await Driver.findById(recipientId);
      if (driverProfile && driverProfile.userId) {
        recipient = await User.findById(driverProfile.userId);
      }
    }
    
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Destinataire non trouvé' 
      });
    }

    // Créer ou récupérer la conversation
    const participant1 = {
      userId: sender._id,
      role: sender.role,
      name: `${sender.firstName} ${sender.lastName}`,
      avatar: sender.profilePhotoUrl
    };

    const participant2 = {
      userId: recipient._id,
      role: recipient.role,
      name: `${recipient.firstName} ${recipient.lastName}`,
      avatar: recipient.profilePhotoUrl
    };

    const context = applicationId ? {
      type: 'offer_application',
      relatedId: applicationId,
      title: 'Candidature'
    } : {
      type: 'general',
      title: 'Conversation'
    };

    const conversation = await Conversation.findOrCreate(participant1, participant2, context);

    // Créer le message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: sender._id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderRole: sender.role,
      content: message,
      type: 'text'
    });

    await newMessage.save();

    // Créer une notification pour le destinataire
    try {
      await createNotification(recipient._id, 'new_message', {
        senderName: `${sender.firstName} ${sender.lastName}`,
        conversationId: conversation._id,
        messageId: newMessage._id
      });
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification:', notifError);
      // Ne pas faire échouer la requête si la notification échoue
    }

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: {
        message: newMessage,
        conversationId: conversation._id
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Récupérer les conversations d'un utilisateur
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.sub;

    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    })
    .sort({ 'lastMessage.timestamp': -1 })
    .lean();

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// Récupérer les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }

    // Récupérer les messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .sort({ createdAt: 1 })
    .lean();

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

    // Marquer la conversation comme lue
    conversation.markAsRead(userId);
    await conversation.save();

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Marquer une conversation comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    conversation.markAsRead(userId);
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation marquée comme lue'
    });

  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage comme lu',
      error: error.message
    });
  }
};
