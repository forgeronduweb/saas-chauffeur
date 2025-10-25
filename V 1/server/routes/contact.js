const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Driver = require('../models/Driver');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// POST /api/contact/employer - Contacter un employeur (pour les chauffeurs)
router.post('/employer', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un chauffeur
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès réservé aux chauffeurs' 
      });
    }

    const { employerId, subject, message, phone, availability } = req.body;

    // Validation des données
    if (!employerId || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employeur, sujet et message sont requis' 
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le message ne peut pas dépasser 1000 caractères' 
      });
    }

    // Vérifier que l'employeur existe
    const employer = await User.findById(employerId);
    if (!employer || employer.role !== 'employer') {
      return res.status(404).json({ 
        success: false, 
        message: 'Employeur introuvable' 
      });
    }

    // Récupérer les informations du chauffeur
    const driver = await Driver.findOne({ userId: req.user.sub });
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profil chauffeur introuvable' 
      });
    }

    const driverUser = await User.findById(req.user.sub);
    if (!driverUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur chauffeur introuvable' 
      });
    }

    // Créer ou récupérer la conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.sub, employerId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.sub, employerId],
        context: 'employer_contact',
        metadata: {
          initiatedBy: req.user.sub,
          contactReason: subject
        }
      });
      await conversation.save();
    }

    // Construire le message de contact
    const availabilityText = {
      'immediate': 'immédiate',
      '1-week': 'dans la semaine',
      '2-weeks': 'dans 2 semaines',
      '1-month': 'dans le mois',
      'flexible': 'flexible'
    };

    const subjectText = {
      'candidature-spontanee': 'Candidature spontanée',
      'demande-information': 'Demande d\'information',
      'collaboration': 'Proposition de collaboration',
      'autre': 'Autre demande'
    };

    let fullMessage = `**${subjectText[subject] || subject}**\n\n`;
    fullMessage += `${message}\n\n`;
    fullMessage += `**Informations du chauffeur :**\n`;
    fullMessage += `• Nom : ${driverUser.firstName} ${driverUser.lastName}\n`;
    fullMessage += `• Email : ${driverUser.email}\n`;
    if (phone) {
      fullMessage += `• Téléphone : ${phone}\n`;
    }
    if (driver.experience) {
      fullMessage += `• Expérience : ${driver.experience}\n`;
    }
    if (driver.vehicleType) {
      fullMessage += `• Type de véhicule : ${driver.vehicleType}\n`;
    }
    if (driver.workZone) {
      fullMessage += `• Zone de travail : ${driver.workZone}\n`;
    }
    fullMessage += `• Disponibilité : ${availabilityText[availability] || availability}\n`;

    // Créer le message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: req.user.sub,
      content: fullMessage,
      messageType: 'text',
      metadata: {
        contactType: 'employer_contact',
        subject: subject,
        originalMessage: message,
        driverInfo: {
          experience: driver.experience,
          vehicleType: driver.vehicleType,
          workZone: driver.workZone,
          availability: availability,
          phone: phone
        }
      }
    });

    await newMessage.save();

    // Mettre à jour la conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    conversation.unreadBy = [employerId]; // L'employeur a un message non lu
    await conversation.save();

    // Créer une notification pour l'employeur
    const notification = new Notification({
      userId: employerId,
      type: 'driver_contact',
      title: 'Nouveau contact de chauffeur',
      message: `${driverUser.firstName} ${driverUser.lastName} vous a contacté concernant : ${subjectText[subject] || subject}`,
      data: {
        driverId: driver._id,
        driverName: `${driverUser.firstName} ${driverUser.lastName}`,
        conversationId: conversation._id,
        subject: subject,
        contactTime: new Date()
      },
      isRead: false
    });

    await notification.save();

    // Réponse de succès
    res.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: {
        conversationId: conversation._id,
        messageId: newMessage._id,
        employerName: employer.companyName || `${employer.firstName} ${employer.lastName}`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message à l\'employeur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'envoi du message' 
    });
  }
});

// GET /api/contact/history - Historique des contacts avec les employeurs
router.get('/history', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un chauffeur
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès réservé aux chauffeurs' 
      });
    }

    // Récupérer les conversations du chauffeur avec des employeurs
    const conversations = await Conversation.find({
      participants: req.user.sub,
      context: 'employer_contact'
    })
    .populate('participants', 'firstName lastName companyName email')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .limit(20);

    const contactHistory = conversations.map(conv => {
      const employer = conv.participants.find(p => p._id.toString() !== req.user.sub);
      return {
        conversationId: conv._id,
        employer: {
          id: employer._id,
          name: employer.companyName || `${employer.firstName} ${employer.lastName}`,
          email: employer.email
        },
        lastMessage: conv.lastMessage ? {
          content: conv.lastMessage.content.substring(0, 100) + '...',
          createdAt: conv.lastMessage.createdAt
        } : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadBy.includes(req.user.sub) ? 1 : 0,
        contactReason: conv.metadata?.contactReason || 'Contact'
      };
    });

    res.json({
      success: true,
      data: contactHistory,
      count: contactHistory.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération de l\'historique' 
    });
  }
});

module.exports = router;
