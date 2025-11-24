import { useState, useEffect } from 'react';
import { driversService, offersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DirectOfferModal from '../components/offers/DirectOfferModal';

export default function TestDirectOffers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les chauffeurs
        const driversResponse = await driversService.getAll();
        setDrivers(driversResponse.data || []);
        
        // Récupérer les offres
        const offersResponse = await offersApi.list();
        setOffers(offersResponse.data || []);
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDirectOffer = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleOfferSuccess = (offer) => {
    console.log('✅ Offre directe créée:', offer);
    // Recharger les offres
    offersApi.list().then(response => {
      setOffers(response.data || []);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎯 Test des Offres Directes
        </h1>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              Vous devez être connecté en tant qu'employeur pour tester les offres directes.
            </p>
          </div>
        )}

        {user && user.role !== 'employer' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">
              Seuls les employeurs peuvent créer des offres directes.
            </p>
          </div>
        )}

        {/* Liste des chauffeurs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Chauffeurs disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.slice(0, 6).map((driver) => (
              <div key={driver._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {driver.firstName?.[0]}{driver.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{driver.workZone || 'Zone non spécifiée'}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Expérience :</strong> {driver.experience || 'Non spécifiée'}</p>
                  <p><strong>Véhicule :</strong> {driver.vehicleType || 'Non spécifié'}</p>
                  <p><strong>Disponibilité :</strong> {driver.availability || 'Non spécifiée'}</p>
                </div>

                {user && user.role === 'employer' ? (
                  <button
                    onClick={() => handleCreateDirectOffer(driver)}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    Créer une offre directe
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
                  >
                    Connexion employeur requise
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Liste des offres */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Offres créées</h2>
          <div className="space-y-4">
            {offers.filter(offer => offer.targetDriverId).map((offer) => (
              <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {offer.location}</span>
                      <span>💰 {offer.salary?.toLocaleString()} FCFA</span>
                      <span>📅 {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      🎯 Offre directe
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {offer.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {offers.filter(offer => offer.targetDriverId).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune offre directe créée pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal d'offre directe */}
        <DirectOfferModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          driver={selectedDriver}
          onSuccess={handleOfferSuccess}
        />
      </div>
    </div>
  );
}
