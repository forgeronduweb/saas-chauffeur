const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, isAdmin } = require('../middleware/auth');

// Routes utilisateur
router.post('/', requireAuth, reportController.createReport);

// Routes admin
router.get('/', requireAuth, isAdmin, reportController.getReports);
router.get('/pending-count', requireAuth, isAdmin, reportController.getPendingCount);
router.put('/:id', requireAuth, isAdmin, reportController.updateReportStatus);

module.exports = router;
