const Application = require('../models/Application');
const User = require('../models/User');
const Offer = require('../models/Offer');
const { createNotification } = require('../services/notificationService');

// Récupérer les candidatures du chauffeur connecté
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un chauffeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ 
        error: 'Seuls les chauffeurs peuvent voir leurs candidatures' 
      });
    }

    const applications = await Application.find({ driverId: userId })
      .populate({
        path: 'offer',
        select: 'title type status conditions location requirements employerId',
        populate: {
          path: 'employerId',
          select: 'firstName lastName email',
          model: 'User'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);

  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des candidatures' 
    });
  }
};

// Mettre à jour le statut d'une candidature (accepter/refuser)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.sub;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Statut invalide. Doit être "accepted" ou "rejected"' 
      });
    }

    const application = await Application.findById(applicationId)
      .populate('offer');

    if (!application) {
      return res.status(404).json({ 
        error: 'Candidature non trouvée' 
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'offre
    if (application.offer.employerId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à modifier cette candidature' 
      });
    }

    // Mettre à jour la candidature
    if (status === 'accepted') {
      await application.accept(userId, notes);
    } else {
      await application.reject(userId, notes);
    }

    await application.populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'offer', select: 'title type' }
    ]);

    // Envoyer une notification au chauffeur
    try {
      const notificationType = status === 'accepted' ? 'application_accepted' : 'application_rejected';
      await createNotification(application.driverId, notificationType, {
        offerTitle: application.offer.title,
        applicationId: application._id,
        offerId: application.offer._id
      });
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification:', notifError);
      // Ne pas faire échouer la requête si la notification échoue
    }

    res.json({
      message: `Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès`,
      application
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la candidature:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la candidature' 
    });
  }
};

// Retirer une candidature (chauffeur)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.sub;

    const application = await Application.findOne({ 
      _id: applicationId, 
      driverId: userId 
    });

    if (!application) {
      return res.status(404).json({ 
        error: 'Candidature non trouvée' 
      });
    }

    if (!application.canBeModified()) {
      return res.status(400).json({ 
        error: 'Cette candidature ne peut plus être modifiée' 
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      message: 'Candidature retirée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du retrait de la candidature:', error);
    res.status(500).json({ 
      error: 'Erreur lors du retrait de la candidature' 
    });
  }
};

// Récupérer les candidatures reçues par l'employeur
const getReceivedApplications = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un employeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Seuls les employeurs peuvent voir les candidatures reçues' 
      });
    }

    // Récupérer toutes les offres de l'employeur
    const employerOffers = await Offer.find({ employerId: userId }).select('_id');
    const offerIds = employerOffers.map(offer => offer._id);

    // Récupérer toutes les candidatures pour ces offres
    const applications = await Application.find({ offerId: { $in: offerIds } })
      .populate('driver', 'firstName lastName email phone')
      .populate('offer', 'title type status location.city requirements.zone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);

  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures reçues:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des candidatures reçues' 
    });
  }
};

module.exports = {
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
  withdrawApplication
};
