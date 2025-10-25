const express = require('express');
const { requireAuth } = require('../middleware/auth');
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

// Routes publiques
router.get('/', getAllOffers); // Récupérer toutes les offres actives

// Routes authentifiées
router.use(requireAuth);

// Gestion des offres
router.get('/my', getMyOffers); // Mes offres
router.post('/', createOffer); // Créer une offre
router.get('/:offerId', getOfferById); // Récupérer une offre spécifique
router.put('/:offerId', updateOffer); // Mettre à jour une offre
router.delete('/:offerId', deleteOffer); // Supprimer une offre

// Gestion des candidatures
router.post('/:offerId/apply', applyToOffer); // Postuler à une offre
router.get('/:offerId/applications', getOfferApplications); // Candidatures pour une offre

module.exports = router;
