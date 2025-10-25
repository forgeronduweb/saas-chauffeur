const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  requireAdmin,
  getDashboardStats,
  getDrivers,
  updateDriverStatus,
  getOffers,
  moderateOffer,
  getTransactions,
  getTickets,
  assignTicket,
  getConfigs,
  updateConfig
} = require('../controllers/adminController');

const router = express.Router();

// Middleware pour toutes les routes admin
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Gestion des chauffeurs
router.get('/drivers', getDrivers);
router.put('/drivers/:driverId/status', updateDriverStatus);

// Gestion des offres
router.get('/offers', getOffers);
router.put('/offers/:offerId/moderate', moderateOffer);

// Gestion des transactions
router.get('/transactions', getTransactions);

// Gestion des tickets de support
router.get('/tickets', getTickets);
router.put('/tickets/:ticketId/assign', assignTicket);

// Configuration de la plateforme
router.get('/configs', getConfigs);
router.put('/configs/:configId', updateConfig);

module.exports = router;
