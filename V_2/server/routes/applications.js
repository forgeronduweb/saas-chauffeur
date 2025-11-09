const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const User = require('../models/User');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Récupérer les candidatures du chauffeur connecté
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log('Récupération des candidatures pour l\'utilisateur:', userId);
    
    // Récupérer le profil Driver correspondant au User
    const Driver = require('../models/Driver');
    const driverProfile = await Driver.findOne({ userId: userId });
    
    if (!driverProfile) {
      return res.json([]); // Retourner un tableau vide si pas de profil Driver
    }
    
    // Utiliser driverProfile._id pour chercher les candidatures
    const applications = await Application.find({ driverId: driverProfile._id })
      .populate({
        path: 'offerId',
        select: 'title company location salary type contractType workType',
        populate: {
          path: 'employerId',
          select: 'firstName lastName companyName'
        }
      })
      .sort({ createdAt: -1 });
    
    console.log(`${applications.length} candidatures trouvées`);
    
    // Renommer offerId en offer pour correspondre au format attendu par le frontend
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      offerId: app.offerId?._id,
      offer: app.offerId,
      status: app.status,
      message: app.message || app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));
    
    res.json(formattedApplications);
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des candidatures',
      details: error.message 
    });
  }
});

// Récupérer les candidatures reçues par l'employeur
router.get('/received', async (req, res) => {
  try {
    console.log('Récupération des candidatures reçues pour l\'employeur:', req.user.sub);
    
    // Trouver toutes les offres de l'employeur
    const offers = await Offer.find({ employerId: req.user.sub });
    const offerIds = offers.map(offer => offer._id);
    
    // Trouver toutes les candidatures pour ces offres
    const applications = await Application.find({ offerId: { $in: offerIds } })
      .populate({
        path: 'driverId',
        select: 'firstName lastName email phone profilePhotoUrl'
      })
      .populate({
        path: 'offerId',
        select: 'title company location salary type'
      })
      .sort({ createdAt: -1 });
    
    console.log(`${applications.length} candidatures reçues trouvées`);
    
    // Pour chaque candidature, récupérer le profil Driver correspondant
    const Driver = require('../models/Driver');
    const applicationsWithDriverProfile = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        
        // Trouver le profil Driver correspondant au userId
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
    console.error('Erreur lors de la récupération des candidatures reçues:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des candidatures reçues',
      details: error.message 
    });
  }
});

// Mettre à jour le statut d'une candidature (employeur uniquement)
router.patch('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    const application = await Application.findById(applicationId).populate('offerId');
    
    if (!application) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }
    
    // Vérifier que l'utilisateur est bien l'employeur de l'offre
    if (application.offerId.employerId.toString() !== req.user.sub) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut',
      details: error.message 
    });
  }
});

module.exports = router;
