const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { requireAuth } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Créer ou mettre à jour le profil employeur
router.post('/profile', employerController.createOrUpdateProfile);
router.put('/profile', employerController.createOrUpdateProfile);

// Récupérer le profil employeur
router.get('/profile', employerController.getProfile);

// Supprimer le profil employeur
router.delete('/profile', employerController.deleteProfile);

// Upload de documents
router.post('/documents', employerController.uploadDocuments);

module.exports = router;
