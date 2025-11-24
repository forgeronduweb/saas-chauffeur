const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { cacheMiddleware, autoClearCache } = require('../middleware/cache');
const {
  getAllOffers,
  getMyOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferById,
  applyToOffer,
  getOfferApplications
} = require('../controllers/offerController');

const router = express.Router();

// Routes publiques avec cache
router.get('/', cacheMiddleware(180), getAllOffers); // Cache 3 min - liste des offres

// Routes authentifiées pour les opérations sensibles
router.get('/my', requireAuth, getMyOffers); // Mes offres
router.post('/', requireAuth, autoClearCache('/api/offers'), createOffer); // Créer une offre
router.put('/:offerId', requireAuth, autoClearCache('/api/offers'), updateOffer); // Mettre à jour une offre
router.delete('/:offerId', requireAuth, autoClearCache('/api/offers'), deleteOffer); // Supprimer une offre

// Gestion des candidatures (authentifiées)
router.post('/:offerId/apply', requireAuth, autoClearCache('/api/offers'), applyToOffer); // Postuler à une offre
router.get('/:offerId/applications', requireAuth, getOfferApplications); // Candidatures pour une offre

// Route publique pour le détail d'une offre (lecture seule)
router.get('/:offerId', cacheMiddleware(300), getOfferById); // Cache 5 min - détail d'offre public

module.exports = router;
