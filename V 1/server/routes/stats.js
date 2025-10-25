const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getEmployerStats,
  getDriverStats,
  getGeneralStats
} = require('../controllers/statsController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les statistiques
router.get('/employer', getEmployerStats); // Stats employeur
router.get('/driver', getDriverStats); // Stats chauffeur
router.get('/general', getGeneralStats); // Stats générales

module.exports = router;
