const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Toutes les routes admin nécessitent l'authentification
router.use(requireAuth);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Gestion des chauffeurs
router.get('/drivers', adminController.getDrivers);
router.get('/drivers/:driverId', adminController.getDriverById);
router.put('/drivers/:driverId/status', adminController.updateDriverStatus);
router.post('/drivers/:driverId/notify', adminController.sendNotificationToDriver);

// Gestion des employeurs
router.get('/employers', adminController.getEmployers);
router.get('/employers/:employerId', adminController.getEmployerById);
router.put('/employers/:employerId/status', adminController.updateEmployerStatus);

// Actions sur les comptes utilisateurs
router.put('/users/:userId/suspend', adminController.suspendAccount);
router.put('/users/:userId/reactivate', adminController.reactivateAccount);
router.post('/users/:userId/message', adminController.sendMessageToUser);
router.post('/users/:userId/notify', adminController.sendNotificationToUser);
router.get('/users/:userId/activities', adminController.getUserActivities);

// Gestion des candidatures
router.get('/applications', adminController.getApplications);

// Gestion des missions
router.get('/missions', adminController.getMissions);

// Gestion des véhicules
router.get('/vehicles', adminController.getVehicles);

// Gestion des offres
router.get('/offers', adminController.getOffers);
router.get('/offers/:offerId', adminController.getOfferById);
router.put('/offers/:offerId/moderate', adminController.moderateOffer);

// Gestion des transactions
router.get('/transactions', adminController.getTransactions);

// Gestion des tickets de support
router.get('/tickets', adminController.getTickets);
router.put('/tickets/:ticketId/assign', adminController.assignTicket);

// Configuration de la plateforme
router.get('/configs', adminController.getPlatformConfigs);
router.put('/configs/:configId', adminController.updatePlatformConfig);

// Campagnes Email/SMS
router.get('/campaigns', adminController.getCampaigns);
router.get('/campaigns/user-groups', adminController.getUserGroups);
router.post('/campaigns/send', adminController.sendCampaign);

module.exports = router;
