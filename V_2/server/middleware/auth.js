const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    
    // Vérifier si le compte est suspendu
    const user = await User.findById(payload.sub).select('isActive suspensionReason');
    if (user && user.isActive === false) {
      return res.status(403).json({ 
        error: 'Compte suspendu',
        code: 'ACCOUNT_SUSPENDED',
        reason: user.suspensionReason || 'Votre compte a été suspendu par un administrateur.'
      });
    }
    
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    
    // Vérifier si le compte est suspendu
    const user = await User.findById(payload.sub).select('isActive suspensionReason');
    if (user && user.isActive === false) {
      return res.status(403).json({ 
        error: 'Compte suspendu',
        code: 'ACCOUNT_SUSPENDED',
        reason: user.suspensionReason || 'Votre compte a été suspendu par un administrateur.'
      });
    }
    
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  return next();
}

module.exports = { requireAuth, authenticateToken, isAdmin };


