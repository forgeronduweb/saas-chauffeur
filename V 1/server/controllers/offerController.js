const Offer = require('../models/Offer');
const Application = require('../models/Application');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// Récupérer toutes les offres actives
const getAllOffers = async (req, res) => {
  try {
    const { 
      type, 
      zone, 
      salaryMin, 
      salaryMax, 
      workType, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire les filtres
    const filters = { status: 'active' };
    
    // Filtrage des offres directes
    if (req.user && req.user.sub) {
      // Pour les chauffeurs, récupérer l'ID du profil Driver
      const user = await User.findById(req.user.sub);
      console.log('Utilisateur connecté:', { userId: req.user.sub, role: user?.role });
      
      if (user && user.role === 'driver') {
        const Driver = require('../models/Driver');
        const driver = await Driver.findOne({ userId: req.user.sub });
        console.log('Profil chauffeur trouvé:', { driverId: driver?._id, name: driver?.firstName + ' ' + driver?.lastName });
        
        if (driver) {
          // Chauffeur connecté : afficher les offres générales + ses offres directes
          filters.$or = [
            { targetDriverId: { $exists: false } }, // Offres générales
            { targetDriverId: null }, // Offres générales (null explicite)
            { targetDriverId: driver._id } // Offres directes pour ce chauffeur
          ];
          console.log('Filtres appliqués pour chauffeur:', JSON.stringify(filters, null, 2));
        } else {
          // Chauffeur sans profil : seulement les offres générales
          filters.$or = [
            { targetDriverId: { $exists: false } },
            { targetDriverId: null }
          ];
          console.log('Chauffeur sans profil - filtres généraux appliqués');
        }
      } else {
        // Utilisateur non-chauffeur : seulement les offres générales
        filters.$or = [
          { targetDriverId: { $exists: false } },
          { targetDriverId: null }
        ];
        console.log('Utilisateur non-chauffeur - filtres généraux appliqués');
      }
    } else {
      // Utilisateur non connecté : seulement les offres générales
      filters.$or = [
        { targetDriverId: { $exists: false } },
        { targetDriverId: null }
      ];
      console.log('Utilisateur non connecté - filtres généraux appliqués');
    }
    
    if (type) filters.type = type;
    if (zone) filters['requirements.zone'] = new RegExp(zone, 'i');
    if (workType) filters['conditions.workType'] = workType;
    
    if (salaryMin || salaryMax) {
      filters['conditions.salary'] = {};
      if (salaryMin) filters['conditions.salary'].$gte = parseFloat(salaryMin);
      if (salaryMax) filters['conditions.salary'].$lte = parseFloat(salaryMax);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const offers = await Offer.find(filters)
      .populate('employer', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`Offres trouvées: ${offers.length}, avec targetDriverId:`, offers.map(o => ({ id: o._id, targetDriverId: o.targetDriverId, title: o.title })));

    const total = await Offer.countDocuments(filters);

    res.json({
      offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des offres' 
    });
  }
};

// Récupérer les offres de l'utilisateur connecté
const getMyOffers = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const offers = await Offer.find({ employerId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Ajouter le nombre de candidatures pour chaque offre
    for (let offer of offers) {
      const applicationCount = await Application.countDocuments({ 
        offerId: offer._id 
      });
      offer.applicationCount = applicationCount;
    }

    res.json(offers);

  } catch (error) {
    console.error('Erreur lors de la récupération de vos offres:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de vos offres' 
    });
  }
};

// Créer une nouvelle offre
const createOffer = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un client/employeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Seuls les employeurs peuvent créer des offres' 
      });
    }

    const offerData = {
      ...req.body,
      employerId: userId
    };

    const offer = await Offer.create(offerData);
    
    // Populer les informations de l'employeur
    await offer.populate('employer', 'firstName lastName email');

    // Notifier tous les chauffeurs actifs de la nouvelle offre
    try {
      const drivers = await User.find({ 
        role: 'driver', 
        isActive: true 
      }).select('_id');
      
      const driverIds = drivers.map(d => d._id);
      
      if (driverIds.length > 0) {
        // Créer des notifications pour tous les chauffeurs
        const notificationType = offer.urgent ? 'urgent_offer' : 'new_offer';
        
        await Promise.all(
          driverIds.map(driverId => 
            createNotification(driverId, notificationType, {
              offerTitle: offer.title,
              offerId: offer._id,
              location: offer.location?.city || 'Non spécifié'
            })
          )
        );
        
        console.log(`✅ ${driverIds.length} chauffeurs notifiés de la nouvelle offre`);
      }
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi des notifications:', notifError);
      // Ne pas faire échouer la création de l'offre
    }

    res.status(201).json({
      message: 'Offre créée avec succès',
      offer
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'offre' 
    });
  }
};

// Récupérer une offre spécifique
const getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findById(offerId)
      .populate('employer', 'firstName lastName email phone')
      .lean();

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée' 
      });
    }

    // Ajouter le nombre de candidatures
    const applicationCount = await Application.countDocuments({ 
      offerId: offer._id 
    });
    offer.applicationCount = applicationCount;

    res.json(offer);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'offre' 
    });
  }
};

// Mettre à jour une offre
const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.sub;
    
    const offer = await Offer.findOne({ 
      _id: offerId, 
      employerId: userId 
    });

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée ou vous n\'êtes pas autorisé à la modifier' 
      });
    }

    Object.assign(offer, req.body);
    await offer.save();

    await offer.populate('employer', 'firstName lastName email');

    res.json({
      message: 'Offre mise à jour avec succès',
      offer
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de l\'offre' 
    });
  }
};

// Supprimer une offre
const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.sub;
    
    const offer = await Offer.findOne({ 
      _id: offerId, 
      employerId: userId 
    });

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée ou vous n\'êtes pas autorisé à la supprimer' 
      });
    }

    // Supprimer aussi toutes les candidatures associées
    await Application.deleteMany({ offerId: offer._id });
    
    await Offer.findByIdAndDelete(offerId);

    res.json({
      message: 'Offre supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de l\'offre' 
    });
  }
};

// Postuler à une offre
const applyToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un chauffeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ 
        error: 'Seuls les chauffeurs peuvent postuler aux offres' 
      });
    }

    // Vérifier que l'offre existe et peut recevoir des candidatures
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée' 
      });
    }

    if (!offer.canReceiveApplications()) {
      return res.status(400).json({ 
        error: 'Cette offre ne peut plus recevoir de candidatures' 
      });
    }

    // Vérifier que le chauffeur n'a pas déjà postulé
    const existingApplication = await Application.findOne({ 
      offerId, 
      driverId: userId 
    });

    if (existingApplication) {
      return res.status(409).json({ 
        error: 'Vous avez déjà postulé à cette offre' 
      });
    }

    const applicationData = {
      ...req.body,
      offerId,
      driverId: userId
    };

    const application = await Application.create(applicationData);
    
    // Incrémenter le compteur de candidatures
    await offer.incrementApplicationCount();

    await application.populate([
      { path: 'offer', select: 'title type' },
      { path: 'driver', select: 'firstName lastName email' }
    ]);

    // Envoyer une notification à l'employeur
    try {
      await createNotification(offer.employerId, 'new_application', {
        driverName: `${user.firstName} ${user.lastName}`,
        offerTitle: offer.title,
        applicationId: application._id,
        offerId: offer._id
      });
    } catch (notifError) {
      console.error('Erreur lors de l\'envoi de la notification:', notifError);
      // Ne pas faire échouer la requête si la notification échoue
    }

    res.status(201).json({
      message: 'Candidature envoyée avec succès',
      application
    });

  } catch (error) {
    console.error('Erreur lors de la candidature:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de la candidature' 
    });
  }
};

// Récupérer les candidatures pour une offre
const getOfferApplications = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.sub;
    
    // Vérifier que l'offre appartient à l'utilisateur connecté
    const offer = await Offer.findOne({ 
      _id: offerId, 
      employerId: userId 
    });

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée ou vous n\'êtes pas autorisé à voir les candidatures' 
      });
    }

    const applications = await Application.find({ offerId })
      .populate('driver', 'firstName lastName email phone')
      .populate('driverProfile')
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

module.exports = {
  getAllOffers,
  getMyOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
  applyToOffer,
  getOfferApplications
};
