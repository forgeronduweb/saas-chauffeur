const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getMyMissions,
  getMissionById,
  updateMissionStatus,
  completeMission,
  cancelMission,
  rateMission
} = require('../controllers/missionController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes pour les missions
router.get('/my', getMyMissions); // Mes missions
router.get('/:missionId', getMissionById); // Détails d'une mission
router.put('/:missionId/status', updateMissionStatus); // Changer le statut
router.put('/:missionId/complete', completeMission); // Marquer comme terminée
router.put('/:missionId/cancel', cancelMission); // Annuler la mission
router.put('/:missionId/rate', rateMission); // Noter la mission

module.exports = router;
