// Middleware de cache simple en mémoire pour réduire les requêtes MongoDB
const NodeCache = require('node-cache');

// Cache avec TTL de 5 minutes par défaut
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Vérifier les expirations toutes les 60 secondes
  useClones: false // Performance: ne pas cloner les objets
});

/**
 * Middleware de cache pour les routes GET
 * @param {number} duration - Durée du cache en secondes (défaut: 300s = 5min)
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Ne cacher que les requêtes GET
    if (req.method !== 'GET') {
      return next();
    }

    // Créer une clé unique basée sur l'URL et les query params
    const key = `__express__${req.originalUrl || req.url}`;
    
    // Vérifier si la réponse est en cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`❌ Cache MISS: ${key}`);
    
    // Intercepter la méthode json de la réponse
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      // Mettre en cache la réponse
      cache.set(key, body, duration);
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * Invalider le cache pour une clé spécifique ou un pattern
 */
const invalidateCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => cache.del(key));
    console.log(`🗑️ Cache invalidated: ${matchingKeys.length} keys matching "${pattern}"`);
  } else {
    cache.flushAll();
    console.log('🗑️ All cache cleared');
  }
};

/**
 * Obtenir les statistiques du cache
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  getCacheStats,
  cache
};
