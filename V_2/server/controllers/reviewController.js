const Review = require('../models/Review');
const Offer = require('../models/Offer');
const User = require('../models/User');
const mongoose = require('mongoose');

// Créer un nouvel avis
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.sub;

    // Vérifications
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (productId, rating, comment)'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être entre 1 et 5'
      });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Le commentaire doit contenir au moins 10 caractères'
      });
    }

    // Vérifier que le produit existe
    const product = await Offer.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour ce produit'
      });
    }

    // Créer l'avis
    const review = new Review({
      productId,
      userId,
      rating: parseInt(rating),
      comment: comment.trim()
    });

    await review.save();

    // Populer les données utilisateur pour la réponse
    await review.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès',
      data: review
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    
    // Gestion de l'erreur de duplication (au cas où l'index unique ne fonctionnerait pas)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour ce produit'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'avis'
    });
  }
};

// Récupérer tous les avis d'un produit
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Vérifier que le produit existe
    const product = await Offer.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Récupérer les avis avec pagination
    const reviews = await Review.find({ 
      productId, 
      status: 'approved' 
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Compter le total des avis
    const totalReviews = await Review.countDocuments({ 
      productId, 
      status: 'approved' 
    });

    // Calculer la note moyenne
    const avgRatingResult = await Review.aggregate([
      { 
        $match: { 
          productId: new mongoose.Types.ObjectId(productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const averageRating = avgRatingResult.length > 0 ? 
      Math.round(avgRatingResult[0].averageRating * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNextPage: page < Math.ceil(totalReviews / limit),
          hasPrevPage: page > 1
        },
        stats: {
          averageRating,
          totalRatings: avgRatingResult.length > 0 ? avgRatingResult[0].totalRatings : 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des avis'
    });
  }
};

// Mettre à jour un avis (seulement par son auteur)
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.sub;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres avis'
      });
    }

    // Mettre à jour les champs fournis
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'La note doit être entre 1 et 5'
        });
      }
      review.rating = parseInt(rating);
    }

    if (comment !== undefined) {
      if (comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Le commentaire doit contenir au moins 10 caractères'
        });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Avis mis à jour avec succès',
      data: review
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'avis'
    });
  }
};

// Supprimer un avis (seulement par son auteur)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.sub;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres avis'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Avis supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'avis'
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
};
