const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');
const { autoClearCache } = require('../middleware/cache');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  updateRole
} = require('../controllers/authController');
const { 
  forgotPassword, 
  resetPassword 
} = require('../controllers/passwordResetController');
const {
  sendVerificationCode,
  verifyCode,
  resendVerificationCode
} = require('../controllers/emailVerificationController');

const router = express.Router();

// Routes publiques
router.post('/register', autoClearCache('/api/drivers'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Routes de vérification d'email
router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-email', verifyCode);
router.post('/resend-verification-code', resendVerificationCode);

// Routes Google OAuth - Vérifier si configuré
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false 
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: process.env.CLIENT_URL + '/auth?mode=login&error=google_auth_failed'
    }),
    (req, res) => {
      try {
        // Générer un JWT pour l'utilisateur
        const token = jwt.sign(
          { 
            sub: req.user._id,
            email: req.user.email,
            role: req.user.role 
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Rediriger vers le client avec le token
        const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Erreur lors de la génération du token:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth?mode=login&error=token_generation_failed`);
      }
    }
  );
  console.log('✅ Routes Google OAuth enregistrées');
} else {
  // Routes de fallback si Google OAuth n'est pas configuré
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth non configuré',
      message: 'Veuillez configurer GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans les variables d\'environnement'
    });
  });
  
  router.get('/google/callback', (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/auth?mode=login&error=google_not_configured`);
  });
  console.log('⚠️  Routes Google OAuth désactivées - Configuration manquante');
}

// Routes protégées
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, autoClearCache('/api/drivers'), updateProfile);
router.put('/me/role', requireAuth, autoClearCache('/api/drivers'), updateRole);

// Route de debug pour forcer la sélection de rôle (à supprimer en production)
router.post('/debug/reset-role', requireAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { 
        needsRoleSelection: true,
        role: 'client'
      },
      { new: true }
    ).select('-passwordHash');
    
    console.log('🔄 Flag needsRoleSelection réinitialisé pour:', user.email);
    res.json({ message: 'Compte réinitialisé. Reconnectez-vous avec Google.', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


