/**
 * Exemple de composant utilisant les nouvelles bonnes pratiques
 * Remplace les anciens patterns problématiques
 */

import { useState, useEffect } from 'react';
import { useErrorHandler } from '../utils/errorHandler';
import { offersApi } from '../services/api';
import logger from '../utils/logger';
import { measurePerformance } from '../utils/logger';

const ImprovedComponent = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleApiError, showSuccess } = useErrorHandler();

  // ✅ BONNE PRATIQUE : Fonction async avec gestion d'erreur centralisée
  const fetchOffers = async () => {
    const perf = measurePerformance('fetchOffers');
    setLoading(true);
    
    try {
      logger.info('Fetching offers started');
      
      const response = await offersApi.list();
      const offersData = response.data || [];
      
      setOffers(offersData);
      logger.info('Offers loaded successfully', { count: offersData.length });
      
      perf.end({ success: true, count: offersData.length });
      
    } catch (error) {
      // ✅ BONNE PRATIQUE : Gestion d'erreur centralisée avec Toast
      handleApiError(error, 'Chargement des offres');
      setOffers([]);
      perf.end({ success: false });
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ BONNE PRATIQUE : Action utilisateur avec feedback
  const handleDeleteOffer = async (offerId) => {
    try {
      logger.userAction('delete_offer_attempt', { offerId });
      
      await offersApi.delete(offerId);
      
      // ✅ BONNE PRATIQUE : Toast de succès au lieu d'alert
      showSuccess('Offre supprimée avec succès');
      
      // Rafraîchir la liste
      await fetchOffers();
      
      logger.userAction('delete_offer_success', { offerId });
      
    } catch (error) {
      handleApiError(error, 'Suppression de l\'offre');
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // ✅ BONNE PRATIQUE : États de chargement et d'erreur gérés proprement
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Chargement des offres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Offres disponibles</h2>
      
      {offers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune offre disponible
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map(offer => (
            <div key={offer._id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{offer.title}</h3>
              <p className="text-gray-600">{offer.description}</p>
              
              <button
                onClick={() => handleDeleteOffer(offer._id)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImprovedComponent;

// ❌ ANCIEN PATTERN PROBLÉMATIQUE (à éviter) :
/*
const BadComponent = () => {
  const [offers, setOffers] = useState([]);
  
  const fetchOffers = async () => {
    try {
      console.log('Fetching offers...'); // ❌ Console.log en production
      const response = await fetch('/api/offers'); // ❌ Fetch au lieu d'axios
      const data = await response.json();
      setOffers(data);
      console.log('Offers loaded:', data); // ❌ Console.log
    } catch (error) {
      console.error('Error:', error); // ❌ Console.error
      alert('Erreur lors du chargement'); // ❌ Alert au lieu de Toast
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      alert('Supprimé !'); // ❌ Alert
      fetchOffers();
    } catch (error) {
      console.error(error); // ❌ Pas de gestion d'erreur
    }
  };
  
  // ... reste du composant
};
*/
