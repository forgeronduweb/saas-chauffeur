const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// Routes publiques
// GET /api/reviews/product/:productId - Récupérer tous les avis d'un produit
router.get('/product/:productId', getProductReviews);

// Routes protégées (nécessitent une authentification)
// POST /api/reviews - Créer un nouvel avis
router.post('/', requireAuth, createReview);

// PUT /api/reviews/:reviewId - Mettre à jour un avis
router.put('/:reviewId', requireAuth, updateReview);

// DELETE /api/reviews/:reviewId - Supprimer un avis
router.delete('/:reviewId', requireAuth, deleteReview);

module.exports = router;
