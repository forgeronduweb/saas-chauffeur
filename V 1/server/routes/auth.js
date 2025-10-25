const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} = require('../controllers/authController');

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

module.exports = router;


