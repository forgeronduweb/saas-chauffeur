const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

// Créer le dossier uploads/boosts s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads/boosts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boosts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'boost-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});
const {
  getBoostPricing,
  createBoost,
  getUserBoosts,
  getBoostedOffers,
  cancelBoost,
  updateBoostStats
} = require('../controllers/promotionController');

// Routes publiques
// GET /api/promotions/pricing - Obtenir les tarifs de boost
router.get('/pricing', getBoostPricing);

// GET /api/promotions/boosted - Obtenir les offres boostées (pour affichage public)
router.get('/boosted', getBoostedOffers);

// PUT /api/promotions/:promotionId/stats - Mettre à jour les statistiques (public pour tracking)
router.put('/:promotionId/stats', updateBoostStats);

// Routes protégées (nécessitent une authentification)
// POST /api/promotions - Créer un nouveau boost
router.post('/', requireAuth, upload.single('boostImage'), createBoost);

// GET /api/promotions/my - Obtenir les boosts de l'utilisateur
router.get('/my', requireAuth, getUserBoosts);

// DELETE /api/promotions/:promotionId - Annuler un boost
router.delete('/:promotionId', requireAuth, cancelBoost);

module.exports = router;
