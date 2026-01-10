const Offer = require('../models/Offer');
const User = require('../models/User');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');

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
    
    // Gestion du type d'offre
    if (type) {
      // Si un type est spécifié (ex: 'Autre' pour marketing), l'utiliser
      filters.type = type;
    } else {
      // Sinon, exclure les offres marketing (pour la page offres d'emploi)
      filters.type = { $nin: ['product', 'Autre'] };
    }
    
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

    // Requête optimisée avec projection et filtrage des employeurs suspendus
    const rawOffers = await Offer.find(filters)
      .populate('employerId', 'firstName lastName companyName isActive')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit) * 2)
      .lean();

    // Filtrer les offres dont l'employeur est suspendu
    const activeOffers = rawOffers
      .filter(offer => {
        if (!offer.employerId) return true;
        return offer.employerId.isActive !== false;
      })
      .slice(0, parseInt(limit));

    // Compter le total (sans pagination)
    const allOffersForCount = await Offer.find(filters)
      .populate('employerId', 'isActive')
      .select('employerId')
      .lean();
    
    const total = allOffersForCount.filter(o => {
      if (!o.employerId) return true;
      return o.employerId.isActive !== false;
    }).length;

    res.json({
      offers: activeOffers,
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
    
    console.log('📋 Récupération des offres pour userId:', userId);
    
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
      // Récupérer les informations du chauffeur ciblé pour les offres directes
      {
        $lookup: {
          from: 'drivers',
          localField: 'targetDriverId',
          foreignField: '_id',
          as: 'targetDriver'
        }
      },
      {
        $unwind: {
          path: '$targetDriver',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          applications: 0, // Exclure le tableau des applications
          __v: 0,
          // Ne garder que les infos nécessaires sur le chauffeur ciblé
          'targetDriver.email': 0,
          'targetDriver.phone': 0,
          'targetDriver.documents': 0,
          'targetDriver.currentLocation': 0
        }
      }
    ]);

    console.log('📋 Nombre d\'offres trouvées:', offers.length);

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
    
    console.log('🆕 Création d\'offre - userId:', userId);
    console.log('🆕 Type d\'offre:', type);
    console.log('📋 Caractéristiques reçues:', req.body.requirementsList?.length || 0);
    console.log('⭐ Avantages reçus:', req.body.benefits?.length || 0);
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    console.log('👤 Utilisateur trouvé:', !!user);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé avec ID:', userId);
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

    // Traiter les caractéristiques structurées (provenant des menus déroulants)
    if (req.body.characteristics && typeof req.body.characteristics === 'object') {
      console.log('📋 Caractéristiques structurées reçues:', Object.keys(req.body.characteristics).length, 'champs');
      offerData.characteristics = new Map(Object.entries(req.body.characteristics));
    }

    console.log('📸 Images à créer:', {
      mainImage: offerData.mainImage ? 'Oui' : 'Non',
      additionalImages: offerData.additionalImages?.length || 0
    });

    const offer = await Offer.create(offerData);
    
    console.log('✅ Offre créée avec images:', {
      mainImage: offer.mainImage ? 'Oui' : 'Non',
      additionalImages: offer.additionalImages?.length || 0
    });

    // Logger l'activité de création d'offre
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'offer_created',
      description: `Offre créée: ${offer.title}`,
      details: { 
        offerId: offer._id, 
        offerType: type || 'job',
        title: offer.title 
      },
      relatedResource: {
        resourceType: 'offer',
        resourceId: offer._id
      }
    });
    
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
    
    // Récupérer l'offre sans lean() pour pouvoir utiliser les méthodes du modèle
    const offer = await Offer.findById(offerId)
      .populate('employerId', 'firstName lastName email phone isActive');

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée' 
      });
    }

    // Vérifier si l'employeur est suspendu
    if (offer.employerId && offer.employerId.isActive === false) {
      return res.status(404).json({ 
        error: 'Cette offre n\'est plus disponible' 
      });
    }

    // Incrémenter le compteur de vues (de manière asynchrone sans bloquer la réponse)
    offer.incrementViews().catch(err => 
      console.error('Erreur lors de l\'incrémentation des vues:', err)
    );

    // Ajouter le nombre de candidatures
    const applicationCount = await Application.countDocuments({ 
      offerId: offer._id 
    });

    // Convertir en objet simple pour la réponse
    const offerData = offer.toObject();
    offerData.applicationCount = applicationCount;

    res.json(offerData);

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
    
    console.log('📝 Mise à jour offre:', offerId);
    console.log('👤 Utilisateur:', userId);
    console.log('💰 Prix reçu du client:', req.body.price, 'Type:', typeof req.body.price);
    console.log('📋 Caractéristiques reçues:', req.body.requirementsList?.length || 0);
    console.log('⭐ Avantages reçus:', req.body.benefits?.length || 0);
    
    const offer = await Offer.findOne({ 
      _id: offerId, 
      employerId: userId 
    });

    if (!offer) {
      return res.status(404).json({ 
        error: 'Offre non trouvée ou vous n\'êtes pas autorisé à la modifier' 
      });
    }

    console.log('💰 Prix avant mise à jour:', offer.price);

    // Log des images avant mise à jour
    console.log('📸 Images avant:', {
      mainImage: offer.mainImage ? 'Oui' : 'Non',
      additionalImages: offer.additionalImages?.length || 0
    });

    // Traiter les caractéristiques structurées avant la mise à jour
    const updateData = { ...req.body };
    if (req.body.characteristics && typeof req.body.characteristics === 'object') {
      console.log('📋 Caractéristiques structurées reçues pour mise à jour:', Object.keys(req.body.characteristics).length, 'champs');
      updateData.characteristics = new Map(Object.entries(req.body.characteristics));
    }

    // Mettre à jour toutes les propriétés
    Object.assign(offer, updateData);
    
    console.log('💰 Prix après Object.assign:', offer.price);
    
    // Log des images après mise à jour
    console.log('📸 Images après:', {
      mainImage: offer.mainImage ? 'Oui' : 'Non',
      additionalImages: offer.additionalImages?.length || 0
    });

    await offer.save();
    
    console.log('💰 Prix après save:', offer.price);

    // Logger l'activité de mise à jour
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'offer_updated',
      description: `Offre modifiée: ${offer.title}`,
      details: { offerId: offer._id, title: offer.title },
      relatedResource: { resourceType: 'offer', resourceId: offer._id }
    });

    await offer.populate('employer', 'firstName lastName email');

    console.log('✅ Offre mise à jour avec succès');

    res.json({
      message: 'Offre mise à jour avec succès',
      offer
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'offre:', error);
    
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

    const offerTitle = offer.title;
    
    // Supprimer aussi toutes les candidatures associées
    await Application.deleteMany({ offerId: offer._id });
    
    await Offer.findByIdAndDelete(offerId);

    // Logger l'activité de suppression
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'offer_deleted',
      description: `Offre supprimée: ${offerTitle}`,
      details: { offerId: offerId, title: offerTitle }
    });

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

    // Logger l'activité de candidature pour le chauffeur
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'application_sent',
      description: `Candidature envoyée pour: ${offer.title}`,
      details: { applicationId: application._id, offerId: offerId, offerTitle: offer.title },
      relatedResource: { resourceType: 'application', resourceId: application._id }
    });

    // Logger l'activité pour l'employeur (candidature reçue)
    await ActivityLog.logActivity({
      userId: offer.employerId,
      activityType: 'application_received',
      description: `Nouvelle candidature reçue pour: ${offer.title}`,
      details: { applicationId: application._id, offerId: offerId, driverName: `${user.firstName} ${user.lastName}` },
      relatedResource: { resourceType: 'application', resourceId: application._id }
    });

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
