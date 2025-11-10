/**
 * Système de cache simple pour améliorer les performances
 * Cache les données en mémoire avec expiration automatique
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  }

  /**
   * Récupérer une valeur du cache
   * @param {string} key - Clé du cache
   * @returns {any|null} - Valeur ou null si expirée/inexistante
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si le cache a expiré
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Stocker une valeur dans le cache
   * @param {string} key - Clé du cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Durée de vie en millisecondes (optionnel)
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Supprimer une entrée du cache
   * @param {string} key - Clé à supprimer
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Vider tout le cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Obtenir la taille du cache
   * @returns {number} - Nombre d'entrées
   */
  size() {
    return this.cache.size;
  }

  /**
   * Nettoyer les entrées expirées
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Instance singleton
const cache = new SimpleCache();

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

export default cache;
