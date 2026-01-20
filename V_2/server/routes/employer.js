const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { requireAuth } = require('../middleware/auth');

// Routes publiques
router.get('/partners', employerController.getPartners);
router.get('/partners/stats', employerController.getPartnersStats);
router.get('/:id/details', employerController.getPartnerDetails);

// Routes d'enrichissement (protégées)
router.post('/:id/enrich', requireAuth, employerController.enrichPartnerFromWeb);
router.post('/enrich-all', requireAuth, employerController.enrichAllPartners);

// Routes protégées par authentification
router.post('/profile', requireAuth, employerController.createOrUpdateProfile);
router.put('/profile', requireAuth, employerController.createOrUpdateProfile);
router.get('/profile', requireAuth, employerController.getProfile);
router.delete('/profile', requireAuth, employerController.deleteProfile);
router.post('/documents', requireAuth, employerController.uploadDocuments);

// Route publique pour récupérer un employeur par ID (doit être après /profile pour éviter conflit)
router.get('/:id', employerController.getEmployerById);

module.exports = router;
