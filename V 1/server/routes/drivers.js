const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getDriverProfile,
  getDriverProfileById,
  updateDriverProfile,
  getAllDrivers,
  updateDriverStatus,
  updateLocation,
  findNearbyDrivers,
  getDriversCount
} = require('../controllers/driverController');

const router = express.Router();

// Routes pour les chauffeurs connectés
router.get('/profile', requireAuth, getDriverProfile);
router.put('/profile', requireAuth, updateDriverProfile);
router.put('/profile/upload', requireAuth, updateDriverProfile); // Route pour upload avec fichiers
router.put('/location', requireAuth, updateLocation);

// Routes publiques/client
router.get('/count', getDriversCount); // Récupérer le nombre de chauffeurs
router.get('/nearby', findNearbyDrivers);
router.get('/:driverId', getDriverProfileById); // Récupérer le profil d'un chauffeur spécifique

// Routes admin (TODO: ajouter middleware admin)
router.get('/', requireAuth, getAllDrivers);
router.put('/:driverId/status', requireAuth, updateDriverStatus);

module.exports = router;
