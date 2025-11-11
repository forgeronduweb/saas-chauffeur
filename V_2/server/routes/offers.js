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
router.get('/', cacheMiddleware(180), getAllOffers); // Cache 3 min

// Routes authentifiées
router.use(requireAuth);

// Gestion des offres
router.get('/my', getMyOffers); // Mes offres
router.post('/', autoClearCache('/api/offers'), createOffer); // Créer une offre
router.get('/:offerId', cacheMiddleware(300), getOfferById); // Cache 5 min
router.put('/:offerId', autoClearCache('/api/offers'), updateOffer); // Mettre à jour une offre
router.delete('/:offerId', autoClearCache('/api/offers'), deleteOffer); // Supprimer une offre

// Gestion des candidatures
router.post('/:offerId/apply', autoClearCache('/api/offers'), applyToOffer); // Postuler à une offre
router.get('/:offerId/applications', getOfferApplications); // Candidatures pour une offre

module.exports = router;
