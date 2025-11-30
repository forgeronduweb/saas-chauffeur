const Promotion = require('../models/Promotion');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

// Tarifs des différents types de boost
const BOOST_PRICING = {
  featured: {
    name: 'Mise en avant',
    description: 'Votre offre apparaît en tête de liste',
    pricePerDay: 500, // FCFA par jour
    maxDuration: 7,
    color: 'blue'
  },
  premium: {
    name: 'Premium',
    description: 'Badge premium + position privilégiée + mise en avant',
    pricePerDay: 1000, // FCFA par jour
    maxDuration: 15,
    color: 'gold'
  },
  urgent: {
    name: 'Urgent',
    description: 'Badge urgent rouge + top position',
    pricePerDay: 750, // FCFA par jour
    maxDuration: 3,
    color: 'red'
  }
};

// Obtenir les tarifs de boost
const getBoostPricing = async (req, res) => {
  try {
    res.json({
      success: true,
      data: BOOST_PRICING
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tarifs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Créer un nouveau boost
const createBoost = async (req, res) => {
  try {
    console.log('🚀 Création de boost - Données reçues:', {
      body: req.body,
      file: req.file ? 'Image présente' : 'Pas d\'image',
      userId: req.user?.sub
    });

    const { offerId, duration, price, boostText } = req.body;
    const userId = req.user.sub;
    const boostImage = req.file; // Si une image est uploadée

    // Vérifications
    if (!offerId || !duration || !price) {
      console.log('❌ Champs manquants:', { offerId, duration, price });
      return res.status(400).json({
        success: false,
        message: 'Les champs offerId, duration et price sont requis'
      });
    }

    // Vérifier que l'offre existe et appartient à l'utilisateur
    console.log('🔍 Recherche de l\'offre:', offerId);
    const offer = await Offer.findById(offerId);
    if (!offer) {
      console.log('❌ Offre non trouvée');
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }

    console.log('✅ Offre trouvée:', {
      id: offer._id,
      userId: offer.userId,
      createdBy: offer.createdBy,
      currentUserId: userId
    });

    // Vérifier la propriété de l'offre (peut être userId ou createdBy selon le modèle)
    const offerOwnerId = offer.userId || offer.createdBy;
    if (offerOwnerId && offerOwnerId.toString() !== userId) {
      console.log('❌ Offre n\'appartient pas à l\'utilisateur');
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez booster que vos propres offres'
      });
    }

    // Vérifier la durée (1 à 45 jours maximum)
    if (duration < 1 || duration > 45) {
      return res.status(400).json({
        success: false,
        message: 'Durée invalide. Maximum 45 jours'
      });
    }

    // Vérifier qu'il n'y a pas déjà un boost actif pour cette offre
    const existingBoost = await Promotion.findOne({
      offerId,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existingBoost) {
      return res.status(400).json({
        success: false,
        message: 'Cette offre a déjà un boost actif'
      });
    }

    // Calculer la date de fin
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000));

    // Créer le boost
    const promotionData = {
      offerId,
      userId,
      type: 'custom', // Type personnalisé pour nos nouvelles formules
      duration,
      price: parseInt(price),
      startDate,
      endDate,
      status: 'active'
    };

    // Ajouter le texte publicitaire si fourni
    if (boostText) {
      promotionData.boostText = boostText;
    }

    // Ajouter l'image si fournie
    if (boostImage) {
      promotionData.boostImageUrl = boostImage.path || boostImage.filename;
    }

    const promotion = new Promotion(promotionData);

    await promotion.save();

    // Populer les données pour la réponse
    await promotion.populate('offerId', 'title mainImage');

    res.status(201).json({
      success: true,
      message: 'Boost créé avec succès',
      data: {
        promotion
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du boost:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du boost',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir les boosts de l'utilisateur
const getUserBoosts = async (req, res) => {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const promotions = await Promotion.find({ userId })
      .populate('offerId', 'title mainImage price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPromotions = await Promotion.countDocuments({ userId });

    // Ajouter les informations de boost config à chaque promotion
    const promotionsWithConfig = promotions.map(promotion => ({
      ...promotion.toObject(),
      boostConfig: BOOST_PRICING[promotion.type],
      remainingDays: promotion.getRemainingTime(),
      isActive: promotion.isActive()
    }));

    res.json({
      success: true,
      data: {
        promotions: promotionsWithConfig,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPromotions / limit),
          totalPromotions,
          hasNextPage: page < Math.ceil(totalPromotions / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des boosts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les offres boostées (pour affichage public)
const getBoostedOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    // Construire la requête pour les promotions actives
    const promotionQuery = {
      status: 'active',
      endDate: { $gt: new Date() },
      'payment.status': 'completed'
    };

    // Récupérer les promotions actives
    let promotions = await Promotion.find(promotionQuery)
      .populate({
        path: 'offerId',
        match: category ? { category } : {},
        select: 'title description mainImage additionalImages price category location userId createdAt'
      })
      .sort({ 
        type: 1, // Premium d'abord, puis featured, puis urgent
        createdAt: -1 
      })
      .skip(skip)
      .limit(limit);

    // Filtrer les promotions dont l'offre existe encore
    promotions = promotions.filter(promotion => promotion.offerId);

    // Ajouter les informations de boost
    const boostedOffers = promotions.map(promotion => ({
      ...promotion.offerId.toObject(),
      boost: {
        type: promotion.type,
        config: BOOST_PRICING[promotion.type],
        remainingDays: promotion.getRemainingTime(),
        stats: promotion.stats
      }
    }));

    const totalBoosted = await Promotion.countDocuments(promotionQuery);

    res.json({
      success: true,
      data: {
        offers: boostedOffers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBoosted / limit),
          totalOffers: totalBoosted,
          hasNextPage: page < Math.ceil(totalBoosted / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des offres boostées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Annuler un boost
const cancelBoost = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const userId = req.user.sub;

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Boost non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (promotion.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez annuler que vos propres boosts'
      });
    }

    // Vérifier que le boost est actif
    if (promotion.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ce boost ne peut pas être annulé'
      });
    }

    // Annuler le boost
    promotion.status = 'cancelled';
    await promotion.save();

    res.json({
      success: true,
      message: 'Boost annulé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation du boost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour les statistiques d'un boost
const updateBoostStats = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const { type } = req.body; // 'view', 'click', 'contact'

    if (!['view', 'click', 'contact'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de statistique invalide'
      });
    }

    const promotion = await Promotion.findById(promotionId);
    if (!promotion || !promotion.isActive()) {
      return res.status(404).json({
        success: false,
        message: 'Boost non trouvé ou inactif'
      });
    }

    // Incrémenter la statistique appropriée
    const statField = type === 'view' ? 'views' : type === 'click' ? 'clicks' : 'contacts';
    promotion.stats[statField] += 1;
    await promotion.save();

    res.json({
      success: true,
      data: promotion.stats
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getBoostPricing,
  createBoost,
  getUserBoosts,
  getBoostedOffers,
  cancelBoost,
  updateBoostStats
};
