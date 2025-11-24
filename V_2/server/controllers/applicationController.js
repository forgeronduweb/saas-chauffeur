const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Contrôleur pour la gestion intelligente des candidatures
 */

/**
 * Créer une candidature avec analyse automatique du message
 */
exports.createApplication = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { message, messageAnalysis, hasConversation } = req.body;
    const userId = req.user.sub;

    console.log('📝 Création candidature:', {
      offerId,
      userId,
      hasConversation,
      messageAnalysis: messageAnalysis?.needsConversation
    });

    // Vérifier que l'utilisateur est un chauffeur
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Seuls les chauffeurs peuvent postuler aux offres'
      });
    }

    // Récupérer le profil Driver
    const driverProfile = await Driver.findOne({ userId });
    if (!driverProfile) {
      return res.status(404).json({
        error: 'Profil chauffeur non trouvé'
      });
    }

    // Vérifier que l'offre existe
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        error: 'Offre non trouvée'
      });
    }

    // Vérifier que le chauffeur n'a pas déjà postulé
    const existingApplication = await Application.findOne({
      offerId,
      driverId: driverProfile._id
    });

    if (existingApplication) {
      return res.status(409).json({
        error: 'Vous avez déjà postulé à cette offre'
      });
    }

    // Créer la candidature avec analyse
    const applicationData = {
      offerId,
      driverId: driverProfile._id,
      employerId: offer.employerId,
      message: message || "Je suis intéressé(e) par cette offre.",
      messageAnalysis: messageAnalysis || {
        needsConversation: false,
        confidence: 0,
        detectedKeywords: [],
        reason: 'Analyse non fournie'
      },
      hasConversation: hasConversation || false,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedBy: userId,
        changedAt: new Date(),
        reason: 'Candidature initiale'
      }]
    };

    const application = new Application(applicationData);
    await application.save();

    console.log('✅ Candidature créée:', application._id);

    // Populer les données pour la réponse
    await application.populate([
      {
        path: 'offerId',
        select: 'title company location salary type'
      },
      {
        path: 'driverId',
        select: 'firstName lastName email'
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Candidature créée avec succès',
      _id: application._id,
      application: application,
      needsConversation: messageAnalysis?.needsConversation || false
    });

  } catch (error) {
    console.error('❌ Erreur création candidature:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la candidature',
      details: error.message
    });
  }
};

/**
 * Mettre à jour l'ID de conversation d'une candidature
 */
exports.updateConversation = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { conversationId } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        error: 'Candidature non trouvée'
      });
    }

    // Vérifier que l'utilisateur est autorisé
    const userId = req.user.sub;
    const driverProfile = await Driver.findOne({ userId });
    
    if (!driverProfile || application.driverId.toString() !== driverProfile._id.toString()) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    application.conversationId = conversationId;
    application.hasConversation = true;
    await application.save();

    console.log('💬 Conversation liée à la candidature:', applicationId);

    res.json({
      success: true,
      message: 'Conversation liée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur liaison conversation:', error);
    res.status(500).json({
      error: 'Erreur lors de la liaison de la conversation',
      details: error.message
    });
  }
};

/**
 * Changer le statut d'une candidature avec validation du workflow
 */
exports.updateStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.sub;

    console.log('🔄 Changement statut candidature:', {
      applicationId,
      newStatus: status,
      userId
    });

    const application = await Application.findById(applicationId)
      .populate('offerId')
      .populate('driverId');

    if (!application) {
      return res.status(404).json({
        error: 'Candidature non trouvée'
      });
    }

    // Valider la transition de statut
    const isValidTransition = validateStatusTransition(
      application.status,
      status,
      req.user.role,
      userId,
      application
    );

    if (!isValidTransition.valid) {
      return res.status(400).json({
        error: 'Transition de statut invalide',
        details: isValidTransition.reason
      });
    }

    // Mettre à jour le statut
    const oldStatus = application.status;
    application.status = status;

    // Ajouter à l'historique
    application.statusHistory.push({
      status,
      changedBy: userId,
      changedAt: new Date(),
      reason: reason || `Changement de ${oldStatus} à ${status}`
    });

    // Mettre à jour les dates selon le statut
    if (status === 'accepted' || status === 'rejected') {
      application.finalDecisionAt = new Date();
    }

    if (status === 'in_negotiation' && !application.respondedAt) {
      application.respondedAt = new Date();
    }

    await application.save();

    console.log('✅ Statut mis à jour:', `${oldStatus} → ${status}`);

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      application: application,
      oldStatus,
      newStatus: status
    });

  } catch (error) {
    console.error('❌ Erreur changement statut:', error);
    res.status(500).json({
      error: 'Erreur lors du changement de statut',
      details: error.message
    });
  }
};

/**
 * Envoyer une proposition finale (employeur)
 */
exports.sendFinalOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { salary, startDate, conditions } = req.body;
    const userId = req.user.sub;

    console.log('📋 Envoi proposition finale:', applicationId);

    const application = await Application.findById(applicationId)
      .populate('offerId');

    if (!application) {
      return res.status(404).json({
        error: 'Candidature non trouvée'
      });
    }

    // Vérifier que l'utilisateur est l'employeur
    if (application.offerId.employerId.toString() !== userId) {
      return res.status(403).json({
        error: 'Seul l\'employeur peut envoyer une proposition finale'
      });
    }

    // Vérifier que le statut permet l'envoi d'une proposition finale
    if (application.status !== 'in_negotiation') {
      return res.status(400).json({
        error: 'Une proposition finale ne peut être envoyée qu\'en cours de négociation'
      });
    }

    // Mettre à jour avec la proposition finale
    application.finalOffer = {
      salary: salary || application.offerId.salary,
      startDate: startDate ? new Date(startDate) : null,
      conditions: conditions || '',
      sentAt: new Date()
    };

    application.status = 'awaiting_final_decision';
    application.statusHistory.push({
      status: 'awaiting_final_decision',
      changedBy: userId,
      changedAt: new Date(),
      reason: 'Proposition finale envoyée'
    });

    await application.save();

    console.log('✅ Proposition finale envoyée');

    res.json({
      success: true,
      message: 'Proposition finale envoyée avec succès',
      application: application
    });

  } catch (error) {
    console.error('❌ Erreur envoi proposition finale:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la proposition finale',
      details: error.message
    });
  }
};

/**
 * Récupérer les candidatures du chauffeur
 */
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const driverProfile = await Driver.findOne({ userId });
    if (!driverProfile) {
      return res.json([]);
    }

    const applications = await Application.find({ driverId: driverProfile._id })
      .populate({
        path: 'offerId',
        select: 'title company location salary type contractType workType',
        populate: {
          path: 'employerId',
          select: 'firstName lastName companyName'
        }
      })
      .populate({
        path: 'conversationId',
        select: '_id participants'
      })
      .sort({ createdAt: -1 });

    const formattedApplications = applications.map(app => ({
      _id: app._id,
      offerId: app.offerId?._id,
      offer: app.offerId,
      status: app.status,
      message: app.message,
      hasConversation: app.hasConversation,
      conversationId: app.conversationId?._id,
      messageAnalysis: app.messageAnalysis,
      finalOffer: app.finalOffer,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      finalDecisionAt: app.finalDecisionAt
    }));

    res.json(formattedApplications);

  } catch (error) {
    console.error('❌ Erreur récupération candidatures:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des candidatures',
      details: error.message
    });
  }
};

/**
 * Récupérer les candidatures reçues par l'employeur
 */
exports.getReceivedApplications = async (req, res) => {
  try {
    const userId = req.user.sub;

    // Trouver toutes les offres de l'employeur
    const offers = await Offer.find({ employerId: userId });
    const offerIds = offers.map(offer => offer._id);

    const applications = await Application.find({ offerId: { $in: offerIds } })
      .populate({
        path: 'driverId',
        select: 'firstName lastName email phone profilePhotoUrl'
      })
      .populate({
        path: 'offerId',
        select: 'title company location salary type'
      })
      .populate({
        path: 'conversationId',
        select: '_id participants'
      })
      .sort({ createdAt: -1 });

    // Enrichir avec les profils Driver
    const applicationsWithDriverProfile = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        
        if (appObj.driverId && appObj.driverId._id) {
          const driverProfile = await Driver.findOne({ userId: appObj.driverId._id });
          if (driverProfile) {
            appObj.driverProfileId = driverProfile._id;
            appObj.driver = {
              ...appObj.driverId,
              driverProfileId: driverProfile._id,
              experience: driverProfile.experience,
              licenseType: driverProfile.licenseType
            };
          }
        }
        
        return appObj;
      })
    );

    res.json(applicationsWithDriverProfile);

  } catch (error) {
    console.error('❌ Erreur récupération candidatures reçues:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des candidatures reçues',
      details: error.message
    });
  }
};

/**
 * Valider les transitions de statut selon le workflow
 */
function validateStatusTransition(currentStatus, newStatus, userRole, userId, application) {
  const allowedTransitions = {
    pending: {
      employer: ['in_negotiation', 'employer_rejected'],
      driver: ['withdrawn']
    },
    in_negotiation: {
      employer: ['awaiting_final_decision', 'employer_rejected'],
      driver: ['withdrawn']
    },
    awaiting_final_decision: {
      employer: ['employer_rejected'],
      driver: ['accepted', 'rejected', 'withdrawn']
    },
    accepted: {
      employer: [],
      driver: []
    },
    rejected: {
      employer: [],
      driver: []
    },
    withdrawn: {
      employer: [],
      driver: []
    },
    employer_rejected: {
      employer: [],
      driver: []
    }
  };

  // Vérifier l'autorisation selon le rôle
  const userCanChange = (userRole === 'employer' && application.employerId.toString() === userId) ||
                       (userRole === 'driver' && application.driverId.userId?.toString() === userId);

  if (!userCanChange) {
    return {
      valid: false,
      reason: 'Utilisateur non autorisé à modifier cette candidature'
    };
  }

  const allowedForRole = allowedTransitions[currentStatus]?.[userRole] || [];
  
  if (!allowedForRole.includes(newStatus)) {
    return {
      valid: false,
      reason: `Transition ${currentStatus} → ${newStatus} non autorisée pour le rôle ${userRole}`
    };
  }

  return { valid: true };
}

module.exports = exports;
