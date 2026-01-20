const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { requireAuth } = require('../middleware/auth');

// Routes publiques
router.get('/partners', employerController.getPartners);

// Routes protégées par authentification
router.post('/profile', requireAuth, employerController.createOrUpdateProfile);
router.put('/profile', requireAuth, employerController.createOrUpdateProfile);
router.get('/profile', requireAuth, employerController.getProfile);
router.delete('/profile', requireAuth, employerController.deleteProfile);
router.post('/documents', requireAuth, employerController.uploadDocuments);

// Route publique pour récupérer un employeur par ID (doit être après /profile pour éviter conflit)
router.get('/:id', employerController.getEmployerById);

module.exports = router;
