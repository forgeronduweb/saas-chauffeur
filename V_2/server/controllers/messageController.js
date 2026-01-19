const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

/* ======================================================
   CRÉER OU RÉCUPÉRER UNE CONVERSATION
====================================================== */
exports.createOrGetConversation = async (req, res) => {
  try {
    const { participantId, targetUserId, context = {} } = req.body;
    const currentUserId = req.user.sub;
    const targetId = participantId || targetUserId;

    if (!targetId) {
      return res.status(400).json({ error: 'participantId requis' });
    }

    if (currentUserId === targetId) {
      return res.status(400).json({ error: 'Action non autorisée' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetId] },
      isActive: true
    }).populate('participants', 'firstName lastName email role profilePhotoUrl');

    let isNew = false;

    if (!conversation) {
      isNew = true;
      conversation = new Conversation({
        participants: [currentUserId, targetId],
        context,
        unreadCount: new Map([
          [currentUserId.toString(), 0],
          [targetId.toString(), 0]
        ])
      });
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName email role profilePhotoUrl');
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'firstName lastName profilePhotoUrl')
      .sort({ createdAt: 1 })
      .limit(50);

    res.json({ conversation, messages, isNew });
  } catch (err) {
    console.error('❌ Erreur création conversation:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ error: 'Erreur création conversation' });
  }
};

/* ======================================================
   LISTE DES CONVERSATIONS
====================================================== */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20 } = req.query;

    console.log('📋 getConversations appelé pour userId:', userId);

    // 1. Récupérer les conversations persistantes
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'firstName lastName email role profilePhotoUrl')
      .populate('lastMessage.senderId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // 2. Récupérer les conversations temporaires (messages avec conversationId commençant par temp-)
    // IMPORTANT: Trier par date DÉCROISSANTE AVANT de grouper pour que $first récupère le message le plus récent
    const tempConversations = await Message.aggregate([
      {
        $match: {
          conversationId: { $regex: '^temp-' },
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }  // Trier par date décroissante AVANT le group
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },  // Maintenant $first = le plus récent
          messageCount: { $sum: 1 },
          lastMessageAt: { $max: '$createdAt' }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    console.log('📬 Conversations temporaires brutes trouvées:', tempConversations.length);

    // 3. Filtrer et formater les conversations temporaires pour cet utilisateur
    const filteredTempConversations = [];
    const conversationMap = new Map(); // Pour fusionner les conversations avec mêmes participants
    
    for (const tempConv of tempConversations) {
      const parts = tempConv._id.split('-');
      console.log('🔧 Analyse conversation temporaire:', { conversationId: tempConv._id, parts });
      
      if (parts.length >= 3) {
        const userA = parts[1];
        const userB = parts[2];
        
        console.log('👤 Utilisateurs dans conversation:', { userA, userB, currentUserId: userId });
        
        // Vérifier que l'utilisateur actuel fait partie de cette conversation
        if (userA === userId || userB === userId) {
          const otherUserId = userA === userId ? userB : userA;
          
          console.log('Recherche infos pour autre utilisateur:', otherUserId);
          
          // Récupérer les infos de l'autre utilisateur
          const otherUser = await User.findById(otherUserId).select('firstName lastName email role profilePhotoUrl companyName');
          
          if (otherUser) {
            console.log('✅ Autre utilisateur trouvé:', otherUser.firstName);
            console.log('📝 Dernier message:', tempConv.lastMessage.content);
            
            // Créer une clé unique pour cette paire d'utilisateurs (ordre normalisé)
            const userPairKey = [userId, otherUserId].sort().join('-');
            
            // Vérifier si on a déjà une conversation pour cette paire
            if (conversationMap.has(userPairKey)) {
              // Fusionner : garder la conversation avec le message le plus récent
              const existingConv = conversationMap.get(userPairKey);
              if (new Date(tempConv.lastMessageAt) > new Date(existingConv.lastMessageAt)) {
                console.log('🔄 Fusion : conversation plus récente trouvée');
                conversationMap.set(userPairKey, {
                  _id: tempConv._id,
                  isTemporary: true,
                  participants: [
                    { _id: userId, role: 'user' },
                    { 
                      _id: otherUser._id, 
                      firstName: otherUser.firstName, 
                      lastName: otherUser.lastName,
                      email: otherUser.email,
                      role: otherUser.role,
                      profilePhotoUrl: otherUser.profilePhotoUrl,
                      companyName: otherUser.companyName
                    }
                  ],
                  otherParticipant: otherUser,
                  lastMessage: {
                    content: tempConv.lastMessage.content,
                    senderId: tempConv.lastMessage.senderId,
                    createdAt: tempConv.lastMessage.createdAt,
                    type: tempConv.lastMessage.type
                  },
                  unreadCount: 0,
                  updatedAt: tempConv.lastMessageAt,
                  messageCount: tempConv.messageCount
                });
              }
            } else {
              // Première conversation pour cette paire
              console.log('➕ Première conversation pour cette paire');
              conversationMap.set(userPairKey, {
                _id: tempConv._id,
                isTemporary: true,
                participants: [
                  { _id: userId, role: 'user' },
                  { 
                    _id: otherUser._id, 
                    firstName: otherUser.firstName, 
                    lastName: otherUser.lastName,
                    email: otherUser.email,
                    role: otherUser.role,
                    profilePhotoUrl: otherUser.profilePhotoUrl,
                    companyName: otherUser.companyName
                  }
                ],
                otherParticipant: otherUser,
                lastMessage: {
                  content: tempConv.lastMessage.content,
                  senderId: tempConv.lastMessage.senderId,
                  createdAt: tempConv.lastMessage.createdAt,
                  type: tempConv.lastMessage.type
                },
                unreadCount: 0,
                updatedAt: tempConv.lastMessageAt,
                messageCount: tempConv.messageCount
              });
            }
            
            console.log('💬 Conversation traitée:', {
              userPairKey,
              lastMessageContent: tempConv.lastMessage.content,
              lastMessageTime: tempConv.lastMessage.createdAt
            });
          } else {
            console.log('❌ Autre utilisateur non trouvé:', otherUserId);
          }
        } else {
          console.log('❌ Utilisateur ne fait pas partie de cette conversation');
        }
      } else {
        console.log('❌ Format ID conversation temporaire invalide:', parts);
      }
    }

    // Convertir la Map en tableau
    const mergedTempConversations = Array.from(conversationMap.values());
    console.log('📬 Conversations temporaires après fusion:', mergedTempConversations.length);

    // 4. Combiner et formater toutes les conversations
    const allConversations = [...conversations, ...mergedTempConversations];
    
    // Trier par date de dernière activité
    allConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // 5. Appliquer la pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedConversations = allConversations.slice(startIndex, endIndex);

    const data = paginatedConversations.map(c => {
      const other = c.participants.find(p => p._id.toString() !== userId);
      return {
        ...c,
        otherParticipant: other,
        unreadCount: c.unreadCount?.[userId] || 0
      };
    });

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    }) + mergedTempConversations.length;

    console.log('📊 Total conversations (persistantes + temporaires):', total);

    res.json({
      conversations: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération conversations' });
  }
};

/* ======================================================
   RÉCUPÉRER LES MESSAGES
====================================================== */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;
    const { page = 1, limit = 50 } = req.query;

    console.log('🔍 getMessages appelé:', { conversationId, userId });

    // Gérer les conversations temporaires
    if (conversationId.startsWith('temp-')) {
      console.log('📋 Conversation temporaire détectée');
      
      try {
        // Pour les conversations temporaires, vérifier que l'utilisateur est autorisé
        // Format: temp-{userId1}-{userId2}
        const parts = conversationId.split('-');
        console.log('🔧 Parts parsing:', { parts, length: parts.length });
        
        if (parts.length < 3) {
          console.log('❌ Format invalide - parts length < 3');
          return res.status(400).json({ error: 'Format d\'ID de conversation temporaire invalide' });
        }
        
        const userA = parts[1];
        const userB = parts[2];
        console.log('👤 User IDs:', { 
          requestUserId: userId, 
          userA, 
          userB,
          match1: userA === userId,
          match2: userB === userId
        });
        
        // Vérifier que l'utilisateur actuel est autorisé (soit userA soit userB)
        if (userA !== userId && userB !== userId) {
          console.log('❌ Accès non autorisé pour la conversation temporaire:', { 
            userId, 
            userA, 
            userB 
          });
          return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Créer un ID de conversation normalisé (toujours le même ordre)
        const normalizedConversationId = [userA, userB].sort().join('-');
        const searchConversationId = `temp-${normalizedConversationId}`;
        
        console.log('🔍 ID normalisé pour recherche:', searchConversationId);

        console.log('✅ Utilisateur autorisé, recherche des messages...');
        const messages = await Message.find({
          conversationId: searchConversationId,
          isDeleted: false
        })
          .populate('senderId', 'firstName lastName profilePhotoUrl')
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);

        console.log('📬 Messages trouvés:', messages.length);
        console.log('📬 Détails messages:', messages.map(m => ({ id: m._id, content: m.content.substring(0, 30), sender: m.senderId?.firstName })));

        const total = await Message.countDocuments({
          conversationId: searchConversationId,
          isDeleted: false
        });

        console.log('📊 Total messages:', total);

        return res.json({
          messages: messages.reverse(),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total,
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        });
      } catch (error) {
        console.error('❌ Erreur dans conversation temporaire:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des messages temporaires' });
      }
    }

    // Vérifier que l'utilisateur est participant (pour les conversations persistantes)
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Convertir en ObjectId pour la recherche (le conversationId peut être stocké comme ObjectId ou string)
    const searchId = mongoose.Types.ObjectId.isValid(conversationId) 
      ? new mongoose.Types.ObjectId(conversationId) 
      : conversationId;

    const messages = await Message.find({
      $or: [
        { conversationId: searchId },
        { conversationId: conversationId }
      ],
      isDeleted: false
    })
      .populate('senderId', 'firstName lastName profilePhotoUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      $or: [
        { conversationId: searchId },
        { conversationId: conversationId }
      ],
      isDeleted: false
    });

    // Marquer les messages comme lus (en arrière-plan)
    Message.updateMany(
      {
        $or: [
          { conversationId: searchId },
          { conversationId: conversationId }
        ],
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: { readBy: { userId, readAt: new Date() } }
      }
    ).catch(err => console.error('Erreur marquage lu:', err));

    // Réinitialiser le compteur de non lus (en arrière-plan)
    conversation.resetUnread(userId).catch(err => console.error('Erreur reset unread:', err));

    // Renvoyer les messages en ordre chronologique (anciens en haut, nouveaux en bas)
    res.json({
      messages: messages.reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('❌ Erreur récupération messages:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ error: 'Erreur récupération messages' });
  }
};

/* ======================================================
   ENVOYER UN MESSAGE
====================================================== */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', metadata = {} } = req.body;
    const senderId = req.user.sub;

    if (conversationId.startsWith('temp-')) {
      console.log('📋 Envoi message dans conversation temporaire');
      
      // Pour les conversations temporaires, créer et sauvegarder le message directement
      const parts = conversationId.split('-');
      if (parts.length < 3) {
        return res.status(400).json({ error: 'Format ID temporaire invalide' });
      }
      
      const userA = parts[1];
      const userB = parts[2];
      if (![userA, userB].includes(senderId)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      // Créer un ID de conversation normalisé (toujours le même ordre)
      const normalizedConversationId = [userA, userB].sort().join('-');
      const searchConversationId = `temp-${normalizedConversationId}`;
      
      console.log('🔍 ID normalisé pour sauvegarde:', searchConversationId);

      const message = new Message({
        conversationId: searchConversationId, // Utiliser l'ID normalisé
        senderId,
        content,
        type,
        metadata,
        readBy: [{ userId: senderId, readAt: new Date() }]
      });

      await message.save();
      console.log('💬 Message temporaire sauvegardé:', message._id);
      await message.populate('senderId', 'firstName lastName profilePhotoUrl');
      console.log('💬 Message avec populate:', message);

      return res.status(201).json({ message });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(senderId)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

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

    const otherUserId = conversation.getOtherParticipant(senderId);
    if (otherUserId) {
      await conversation.incrementUnread(otherUserId);
    }

    conversation.lastMessage = {
      content,
      senderId,
      createdAt: message.createdAt,
      type
    };

    await conversation.save();

    res.status(201).json({ message });
  } catch (err) {
    console.error('❌ Erreur envoi message:', err);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ error: 'Erreur envoi message' });
  }
};

/* ======================================================
   MARQUER COMME LU
====================================================== */
exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    if (conversationId.startsWith('temp-')) {
      return res.json({ success: true });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    await conversation.resetUnread(userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur marquage lecture' });
  }
};

/* ======================================================
   TOTAL NON LUS
====================================================== */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.sub;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    }).lean();

    const unread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount?.[userId] || 0),
      0
    );

    res.json({ unreadCount: unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur calcul non lus' });
  }
};

/* ======================================================
   SUPPRIMER CONVERSATION
====================================================== */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.sub;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression' });
  }
};
