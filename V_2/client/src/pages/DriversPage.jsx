import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SimpleHeader from '../component/common/SimpleHeader';
import Footer from '../component/common/Footer';
import DriverCard from '../component/common/DriverCard';
import { driversService, driversApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DriversPage() {
  const { user, isDriver } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentDriverProfile, setCurrentDriverProfile] = useState(null);
  const navigate = useNavigate();
  
  // États des filtres
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');

  // Récupérer le profil du chauffeur connecté si c'est un chauffeur
  useEffect(() => {
    const fetchCurrentDriverProfile = async () => {
      if (user && isDriver()) {
        try {
          const response = await driversApi.getMyProfile();
          // La réponse contient {driver: {...}}, on extrait directement le driver
          if (response.data && response.data.driver) {
            setCurrentDriverProfile(response.data.driver);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil chauffeur:', error);
        }
      }
    };

    fetchCurrentDriverProfile();
  }, [user, isDriver]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const response = await driversService.getAll();
        console.log('Chauffeurs API (DriversPage):', response);
        
        // La structure est response.data.data
        if (response.data && response.data.data) {
          setDrivers(response.data.data);
        } else if (Array.isArray(response.data)) {
          setDrivers(response.data);
        } else {
          setDrivers([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chauffeurs:', error);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  /**
   * Filtrage combiné (recherche + filtres + exclusion du chauffeur connecté)
   * 
   * Logique d'affichage selon le type d'utilisateur:
   * - Non connecté: Affiche tous les chauffeurs
   * - Employeur: Affiche tous les chauffeurs
   * - Chauffeur: Affiche tous les chauffeurs SAUF lui-même
   */
  
  const filteredDrivers = drivers.filter(driver => {
    // Exclure le chauffeur connecté de la liste (il ne doit pas se voir lui-même)
    if (user && isDriver() && currentDriverProfile && driver._id === currentDriverProfile._id) {
      console.log('✅ Chauffeur exclu de la liste:', driver.firstName, driver.lastName);
      return false;
    }

    // Filtre de recherche
    const matchesSearch = searchQuery === '' ||
      `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.workZone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleBrand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par ville
    const matchesCity = selectedCity === '' ||
      (driver.workZone && driver.workZone.toLowerCase().includes(selectedCity.toLowerCase()));
    
    // Filtre par expérience
    const matchesExperience = selectedExperience === '' ||
      driver.experience === selectedExperience;
    
    // Filtre par type de véhicule
    const matchesVehicleType = selectedVehicleType === '' ||
      (driver.vehicleType && driver.vehicleType.toLowerCase() === selectedVehicleType.toLowerCase());
    
    return matchesSearch && matchesCity && matchesExperience && matchesVehicleType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader 
        activeTab="chauffeurs" 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-8 pt-6">
        {/* Titre section avec bouton filtres mobile */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900">
            <span className="lg:hidden">Chauffeurs</span>
            <span className="hidden lg:inline">Chauffeurs disponibles</span>
            {' '}<span className="text-gray-500">
              ({user && isDriver() && currentDriverProfile 
                ? `${filteredDrivers.length} plus moi` 
                : `${filteredDrivers.length}`})
            </span>
          </h2>
          
          {/* Bouton filtres mobile */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filtres Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
              
              {/* Ville */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les villes</option>
                  <option value="abidjan">Abidjan</option>
                  <option value="yamoussoukro">Yamoussoukro</option>
                  <option value="bouake">Bouaké</option>
                  <option value="daloa">Daloa</option>
                  <option value="san-pedro">San Pedro</option>
                </select>
              </div>

              {/* Expérience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expérience
                </label>
                <select 
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes expériences</option>
                  <option value="Débutant">Débutant (moins d'1 an)</option>
                  <option value="1-3 ans">1-3 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5-10 ans">5-10 ans</option>
                  <option value="Plus de 10 ans">Plus de 10 ans</option>
                </select>
              </div>

              {/* Type de véhicule */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de véhicule
                </label>
                <select 
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous les véhicules</option>
                  <option value="berline">Berline</option>
                  <option value="suv">4x4/SUV</option>
                  <option value="pickup">Pick-up</option>
                  <option value="minibus">Minibus</option>
                  <option value="utilitaire">Utilitaire</option>
                </select>
              </div>

              {/* Bouton Réinitialiser */}
              <button 
                onClick={() => {
                  setSelectedCity('');
                  setSelectedExperience('');
                  setSelectedVehicleType('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Liste des chauffeurs */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-xl overflow-hidden animate-pulse">
                    <div className="h-32 lg:h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDrivers.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDrivers.map(driver => (
                  <DriverCard key={driver._id} driver={driver} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chauffeur disponible</h3>
                <p className="text-gray-600">Aucun chauffeur ne correspond à vos critères</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Filtres Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Filtres</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filtres */}
            <div className="p-4 space-y-3">
              {/* Ville */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Ville
                </label>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les villes</option>
                  <option value="abidjan">Abidjan</option>
                  <option value="yamoussoukro">Yamoussoukro</option>
                  <option value="bouake">Bouaké</option>
                  <option value="daloa">Daloa</option>
                  <option value="san-pedro">San Pedro</option>
                </select>
              </div>

              {/* Expérience */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Expérience
                </label>
                <select 
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes expériences</option>
                  <option value="Débutant">Débutant (moins d'1 an)</option>
                  <option value="1-3 ans">1-3 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5-10 ans">5-10 ans</option>
                  <option value="Plus de 10 ans">Plus de 10 ans</option>
                </select>
              </div>

              {/* Type de véhicule */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Type de véhicule
                </label>
                <select 
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous les véhicules</option>
                  <option value="berline">Berline</option>
                  <option value="suv">4x4/SUV</option>
                  <option value="pickup">Pick-up</option>
                  <option value="minibus">Minibus</option>
                  <option value="utilitaire">Utilitaire</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 pt-3">
                <button 
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedExperience('');
                    setSelectedVehicleType('');
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
