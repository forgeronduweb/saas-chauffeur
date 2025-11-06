const Offer = require('../models/Offer');
const User = require('../models/User');
const Application = require('../models/Application');

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
    
    // Filtrage des offres directes (optimisé)
    if (req.user && req.user.sub) {
      // Pour les chauffeurs, récupérer l'ID du profil Driver
      const user = await User.findById(req.user.sub).select('role').lean();
      
      if (user && user.role === 'driver') {
        const Driver = require('../models/Driver');
        const driver = await Driver.findOne({ userId: req.user.sub }).select('_id').lean();
        
        if (driver) {
          // Chauffeur connecté : afficher les offres générales + ses offres directes
          filters.$or = [
            { targetDriverId: { $exists: false } },
            { targetDriverId: null },
            { targetDriverId: driver._id }
          ];
        } else {
          // Chauffeur sans profil : seulement les offres générales
          filters.$or = [
            { targetDriverId: { $exists: false } },
            { targetDriverId: null }
          ];
        }
      } else {
        // Utilisateur non-chauffeur : seulement les offres générales
        filters.$or = [
          { targetDriverId: { $exists: false } },
          { targetDriverId: null }
        ];
      }
    } else {
      // Utilisateur non connecté : seulement les offres générales
      filters.$or = [
        { targetDriverId: { $exists: false } },
        { targetDriverId: null }
      ];
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

    // Requête optimisée avec projection
    const [offers, total] = await Promise.all([
      Offer.find(filters)
        .populate('employer', 'firstName lastName companyName')
        .select('-__v') // Exclure les champs inutiles
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Offer.countDocuments(filters)
    ]);

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
    const mongoose = require('mongoose');
    
    // Convertir userId en ObjectId pour l'aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Utiliser aggregation pour compter les candidatures en une seule requête
    const offers = await Offer.aggregate([
      { $match: { employerId: userObjectId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'offerId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: '$applications' }
        }
      },
      {
        $project: {
          applications: 0, // Exclure le tableau des applications
          __v: 0
        }
      }
    ]);

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
    const { type } = req.body; // 'job' pour emploi, 'product' pour marketing
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Vérification des permissions selon le type d'offre
    if (type && !['Autre', 'product'].includes(type)) {
      // C'est une offre d'emploi (type spécifique comme 'Chauffeur personnel', etc.)
      if (user.role !== 'employer') {
        return res.status(403).json({ 
          error: 'Seuls les employeurs peuvent créer des offres d\'emploi' 
        });
      }
    }
    // Les offres marketing (type: 'Autre' ou 'product') sont accessibles à tous les utilisateurs connectés

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
      .populate('employerId', 'firstName lastName email phone')
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
      error: 'Erreur lors de la récupération de l\'offre',
      details: error.message 
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

    // Récupérer le profil Driver correspondant au User
    const Driver = require('../models/Driver');
    const driverProfile = await Driver.findOne({ userId: userId });
    if (!driverProfile) {
      return res.status(404).json({ 
        error: 'Profil chauffeur non trouvé. Veuillez compléter votre profil avant de postuler.' 
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

    // Vérifier que le chauffeur n'a pas déjà postulé (utiliser driverProfile._id)
    const existingApplication = await Application.findOne({ 
      offerId, 
      driverId: driverProfile._id 
    });

    if (existingApplication) {
      return res.status(409).json({ 
        error: 'Vous avez déjà postulé à cette offre' 
      });
    }

    const applicationData = {
      ...req.body,
      offerId,
      driverId: driverProfile._id, // Utiliser l'ID du profil Driver
      employerId: offer.employerId
    };

    const application = await Application.create(applicationData);
    
    // Incrémenter le compteur de candidatures
    await offer.incrementApplicationCount();

    await application.populate([
      { path: 'offerId', select: 'title type' },
      { path: 'driverId', select: 'firstName lastName email' }
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
