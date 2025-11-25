const express = require('express');
const { requireAuth } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Récupérer les candidatures du chauffeur connecté
router.get('/my', applicationController.getMyApplications);

// Récupérer les candidatures reçues par l'employeur
router.get('/received', applicationController.getReceivedApplications);

// Créer une candidature
router.post('/:offerId', applicationController.createApplication);

// Mettre à jour l'ID de conversation d'une candidature
router.patch('/:applicationId/conversation', applicationController.updateConversation);

// Mettre à jour le statut d'une candidature
router.patch('/:applicationId/status', applicationController.updateStatus);

// Envoyer une proposition finale (employeur)
router.post('/:applicationId/final-offer', applicationController.sendFinalOffer);

// Répondre à une offre directe (accepter/refuser)
router.post('/direct-offer/:offerId/respond', applicationController.respondToDirectOffer);

module.exports = router;
