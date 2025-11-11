// Middleware de cache simple en mémoire pour réduire les requêtes MongoDB
const NodeCache = require('node-cache');

// Cache avec TTL adapté à l'environnement
const isDevelopment = process.env.NODE_ENV !== 'production';
const defaultTTL = isDevelopment ? 10 : 300; // 10s en dev, 5min en prod

const cache = new NodeCache({ 
  stdTTL: defaultTTL,
  checkperiod: isDevelopment ? 5 : 60, // Vérifier plus souvent en dev
  useClones: false // Performance: ne pas cloner les objets
});

console.log(`🔧 Cache configuré: TTL=${defaultTTL}s (${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'})`);

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

/**
 * Middleware pour invalider le cache automatiquement après les modifications
 * À utiliser après les routes POST, PUT, PATCH, DELETE
 */
const autoClearCache = (pattern) => {
  return (req, res, next) => {
    // Intercepter la méthode send/json pour invalider après la réponse
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    const clearAndRespond = (fn, data) => {
      // Invalider le cache uniquement si la requête a réussi (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCache(pattern);
      }
      return fn(data);
    };
    
    res.json = (data) => clearAndRespond(originalJson, data);
    res.send = (data) => clearAndRespond(originalSend, data);
    
    next();
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  getCacheStats,
  autoClearCache,
  cache
};
