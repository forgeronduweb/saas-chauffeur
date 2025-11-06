const express = require('express');
const router = express.Router();
const platformContentController = require('../controllers/platformContentController');
const { requireAuth } = require('../middleware/auth');

// TODO: Ajouter multer pour l'upload d'images plus tard

// Routes publiques (pour afficher le contenu sur le site)
router.get('/public', platformContentController.getAllContents);
router.get('/public/:id', platformContentController.getContentById);

// Routes admin (protégées)
router.use(requireAuth);

router.get('/', platformContentController.getAllContents);
router.get('/:id', platformContentController.getContentById);
router.post('/', platformContentController.createContent);
router.put('/:id', platformContentController.updateContent);
router.delete('/:id', platformContentController.deleteContent);
router.post('/reorder', platformContentController.reorderContents);
router.patch('/:id/toggle', platformContentController.toggleContentStatus);

module.exports = router;
