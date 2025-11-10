const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Créer ou récupérer une conversation
exports.createOrGetConversation = async (req, res) => {
  try {
    // Accepter à la fois participantId (nouveau) et targetUserId (ancien) pour compatibilité
    const { participantId, targetUserId, context = {} } = req.body;
    const targetId = participantId || targetUserId;
    const currentUserId = req.user.sub;
    
    console.log('🔵 createOrGetConversation appelé:', {
      currentUserId,
      targetId,
      participantId,
      targetUserId,
      context
    });

    if (!targetId) {
      return res.status(400).json({ error: 'participantId ou targetUserId requis' });
    }

    // Vérifier qu'un utilisateur ne se contacte pas lui-même
    if (currentUserId.toString() === targetId.toString()) {
      console.log('❌ Tentative de se contacter soi-même');
      return res.status(400).json({ error: 'Vous ne pouvez pas vous contacter vous-même' });
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetId] },
      isActive: true
    }).populate('participants', 'firstName lastName email role profilePhotoUrl');

    console.log('🔍 Conversation existante trouvée:', !!conversation);

    let isNewConversation = false;

    // Si pas de conversation, en créer une nouvelle
    if (!conversation) {
      isNewConversation = true;
      console.log('➕ Création d\'une nouvelle conversation');
      conversation = new Conversation({
        participants: [currentUserId, targetId],
        context,
        unreadCount: new Map([
          [currentUserId.toString(), 0],
          [targetId.toString(), 1] // 1 message non lu pour le destinataire
        ])
      });
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName email role profilePhotoUrl');

      // Si c'est une demande concernant une offre marketing, créer un message personnalisé
      if (context.type === 'product_inquiry' && context.offerId && isNewConversation) {
        console.log('📤 Création du message automatique pour l\'offre:', context.offerId);
        const Offer = require('../models/Offer');
        const offer = await Offer.findById(context.offerId);
        const currentUser = await User.findById(currentUserId);
        
        if (offer && currentUser) {
          const productUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/produit/${offer._id}`;
          const messageContent = `Bonjour,\n\nJe suis intéressé(e) par votre offre "${offer.title}".\n\nPourriez-vous me donner plus d'informations ?\n\nLien de l'offre : ${productUrl}`;
          
          console.log('💬 Contenu du message:', messageContent);
          
          // Message texte avec les infos
          const metadata = new Map();
          metadata.set('productId', offer._id.toString());
          metadata.set('productTitle', offer.title);
          metadata.set('productPrice', offer.price);
          metadata.set('productImage', offer.images && offer.images.length > 0 ? offer.images[0] : null);
          metadata.set('productUrl', productUrl);
          
          const initialMessage = new Message({
            conversationId: conversation._id,
            senderId: currentUserId,
            content: messageContent,
            type: 'text',
            metadata: metadata
          });
          await initialMessage.save();
          
          console.log('✅ Message automatique sauvegardé:', initialMessage._id);
          
          // Mettre à jour le dernier message de la conversation
          conversation.lastMessage = {
            content: messageContent,
            senderId: currentUserId,
            createdAt: new Date()
          };
          await conversation.save();
        } else {
          console.log('❌ Offre ou utilisateur non trouvé:', { offer: !!offer, currentUser: !!currentUser });
        }
      } else if (isNewConversation) {
        // Message système de bienvenue par défaut pour les nouvelles conversations
        const systemMessage = new Message({
          conversationId: conversation._id,
          senderId: currentUserId,
          content: 'Conversation démarrée',
          type: 'system'
        });
        await systemMessage.save();
      }
    }
    
    // Si c'est une conversation existante mais vide, et que c'est une demande d'offre, créer le message
    if (!isNewConversation && context.type === 'product_inquiry' && context.offerId) {
      const existingMessages = await Message.countDocuments({ conversationId: conversation._id });
      console.log('📊 Messages existants dans la conversation:', existingMessages);
      
      if (existingMessages === 0) {
        console.log('📤 Création du message automatique pour conversation existante vide');
        const Offer = require('../models/Offer');
        const offer = await Offer.findById(context.offerId);
        const currentUser = await User.findById(currentUserId);
        
        if (offer && currentUser) {
          const productUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/produit/${offer._id}`;
          const messageContent = `Bonjour,\n\nJe suis intéressé(e) par votre offre "${offer.title}".\n\nPourriez-vous me donner plus d'informations ?\n\nLien de l'offre : ${productUrl}`;
          
          const metadata = new Map();
          metadata.set('productId', offer._id.toString());
          metadata.set('productTitle', offer.title);
          metadata.set('productPrice', offer.price);
          metadata.set('productImage', offer.images && offer.images.length > 0 ? offer.images[0] : null);
          metadata.set('productUrl', productUrl);
          
          const initialMessage = new Message({
            conversationId: conversation._id,
            senderId: currentUserId,
            content: messageContent,
            type: 'text',
            metadata: metadata
          });
          await initialMessage.save();
          
          console.log('✅ Message automatique créé pour conversation existante');
          
          // Mettre à jour le dernier message et le compteur
          conversation.lastMessage = {
            content: messageContent,
            senderId: currentUserId,
            createdAt: new Date()
          };
          conversation.unreadCount.set(targetUserId.toString(), 1);
          await conversation.save();
        }
      }
    }
    
    console.log('📊 Conversation finale:', {
      id: conversation._id,
      isNew: isNewConversation,
      contextType: context.type
    });

    // Récupérer les messages de la conversation pour les retourner
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'firstName lastName profilePhotoUrl')
      .sort({ createdAt: 1 })
      .limit(50);

    console.log('📬 Messages à retourner:', messages.length);

    res.json({ 
      conversation,
      messages // Inclure les messages dans la réponse
    });
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
