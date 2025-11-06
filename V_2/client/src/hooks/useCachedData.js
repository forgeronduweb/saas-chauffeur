import { useState, useEffect } from 'react';
import cache from '../utils/cache';

/**
 * Hook personnalisé pour gérer les données avec cache
 * @param {string} cacheKey - Clé unique pour le cache
 * @param {Function} fetchFunction - Fonction async pour récupérer les données
 * @param {number} cacheTTL - Durée de vie du cache en ms (optionnel)
 * @param {Array} dependencies - Dépendances pour rafraîchir (optionnel)
 * @returns {Object} - { data, loading, error, refresh }
 */
export default function useCachedData(cacheKey, fetchFunction, cacheTTL = 5 * 60 * 1000, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord (sauf si forceRefresh)
      if (!forceRefresh) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Récupérer les données depuis l'API
      const result = await fetchFunction();
      
      // Stocker dans le cache
      cache.set(cacheKey, result, cacheTTL);
      
      setData(result);
    } catch (err) {
      console.error(`Erreur lors du chargement (${cacheKey}):`, err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refresh = () => {
    cache.delete(cacheKey);
    fetchData(true);
  };

  return { data, loading, error, refresh };
}
