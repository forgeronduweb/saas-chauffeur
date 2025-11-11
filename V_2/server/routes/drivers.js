const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { cacheMiddleware, autoClearCache } = require('../middleware/cache');
const {
  getDriverProfile,
  getDriverProfileById,
  updateDriverProfile,
  getAllDrivers,
  getPublicDrivers,
  updateDriverStatus,
  updateLocation,
  findNearbyDrivers,
  getDriversCount,
  becomeDriver
} = require('../controllers/driverController');

const router = express.Router();

// Routes pour les chauffeurs connectés
router.get('/profile', requireAuth, getDriverProfile);
router.put('/profile', requireAuth, autoClearCache('/api/drivers'), updateDriverProfile);
router.put('/profile/upload', requireAuth, autoClearCache('/api/drivers'), updateDriverProfile); // Route pour upload avec fichiers
router.put('/location', requireAuth, autoClearCache('/api/drivers'), updateLocation);
router.post('/become-driver', requireAuth, autoClearCache('/api/drivers'), becomeDriver); // Devenir chauffeur

// Routes publiques/client avec cache
router.get('/public', cacheMiddleware(300), getPublicDrivers); // Cache 5 min
router.get('/count', cacheMiddleware(600), getDriversCount); // Cache 10 min (change rarement)
router.get('/nearby', cacheMiddleware(180), findNearbyDrivers); // Cache 3 min
router.get('/:driverId', requireAuth, cacheMiddleware(300), getDriverProfileById); // Cache 5 min

// Routes admin (TODO: ajouter middleware admin)
router.get('/', requireAuth, getAllDrivers);
router.put('/:driverId/status', requireAuth, autoClearCache('/api/drivers'), updateDriverStatus);

module.exports = router;
