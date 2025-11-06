import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driversService, statsApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import Footer from '../component/common/Footer';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  // Bannières publicitaires
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Recrutez en toute confiance',
      subtitle: 'Des chauffeurs professionnels vérifiés',
      link: '/auth' // Lien vers la page d'inscription
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Trouvez votre chauffeur idéal',
      subtitle: 'Disponible 24/7 à Abidjan',
      link: '/auth' // Lien vers la page d'inscription
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=400&fit=crop',
      title: 'Service premium garanti',
      subtitle: stats ? `${stats.overview.totalDrivers}+ chauffeurs expérimentés` : 'Plus de 100 chauffeurs expérimentés',
      link: '/chauffeurs'
    }
  ];

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les statistiques publiques
        const statsResponse = await statsApi.public();
        if (statsResponse.data && statsResponse.data.data) {
          setStats(statsResponse.data.data);
        }
        
        // Charger tous les chauffeurs
        const driversResponse = await driversService.getAll();
        if (driversResponse.data && driversResponse.data.data) {
          setDrivers(driversResponse.data.data);
        } else {
          setDrivers([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Défilement automatique du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, [banners.length]);

  // Filtrage simple par recherche
  const filteredDrivers = drivers.filter(driver =>
    searchQuery === '' ||
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.workZone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Titre section chauffeurs avec bouton filtres mobile */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900">
            Chauffeurs <span className="text-gray-500">({filteredDrivers.length})</span>
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
              
              {/* Zone de travail */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone de travail
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Toutes les zones</option>
                  <option value="cocody">Cocody</option>
                  <option value="plateau">Plateau</option>
                  <option value="yopougon">Yopougon</option>
                  <option value="abobo">Abobo</option>
                  <option value="marcory">Marcory</option>
                </select>
              </div>

              {/* Expérience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expérience
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Toute expérience</option>
                  <option value="1-3">1-3 ans</option>
                  <option value="3-5">3-5 ans</option>
                  <option value="5-10">5-10 ans</option>
                  <option value="10+">Plus de 10 ans</option>
                </select>
              </div>

              {/* Type de véhicule */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de véhicule
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Tous les véhicules</option>
                  <option value="berline">Berline</option>
                  <option value="4x4">4x4/SUV</option>
                  <option value="pickup">Pick-up</option>
                  <option value="minibus">Minibus</option>
                  <option value="utilitaire">Utilitaire</option>
                </select>
              </div>

              {/* Disponibilité */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilité
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Tous</option>
                  <option value="available">Disponible</option>
                  <option value="unavailable">Non disponible</option>
                </select>
              </div>

              {/* Bouton Réinitialiser */}
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Liste des chauffeurs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDrivers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDrivers.map(driver => (
              <div 
                key={driver._id} 
                className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/driver/${driver._id}`)}
              >
                {/* Photo en haut */}
                <figure className="relative h-32 lg:h-48 bg-gray-100 overflow-hidden">
                  {driver.profilePhotoUrl ? (
                    <img 
                      src={driver.profilePhotoUrl} 
                      alt={`${driver.firstName} ${driver.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 lg:w-20 h-12 lg:h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </figure>

                {/* Contenu compact */}
                <div className="p-2 lg:p-4">
                  <h3 className="text-xs lg:text-base font-semibold text-gray-900 mb-1 truncate">
                    {driver.firstName} {driver.lastName}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs lg:text-sm font-bold text-gray-900">
                      {driver.rating ? driver.rating.toFixed(1) : '5.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {driver.totalRides || 0} courses
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span className="truncate">{driver.workZone || 'Abidjan'}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 truncate">
                      {driver.vehicleType || 'Professionnel'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chauffeur disponible</h3>
            <p className="text-gray-600">Aucun chauffeur inscrit pour le moment</p>
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
              {/* Zone de travail */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Zone de travail
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Toutes les zones</option>
                  <option value="cocody">Cocody</option>
                  <option value="plateau">Plateau</option>
                  <option value="yopougon">Yopougon</option>
                  <option value="abobo">Abobo</option>
                  <option value="marcory">Marcory</option>
                </select>
              </div>

              {/* Expérience */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Expérience
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Toute expérience</option>
                  <option value="1-3">1-3 ans</option>
                  <option value="3-5">3-5 ans</option>
                  <option value="5-10">5-10 ans</option>
                  <option value="10+">Plus de 10 ans</option>
                </select>
              </div>

              {/* Type de véhicule */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Type de véhicule
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Tous les véhicules</option>
                  <option value="berline">Berline</option>
                  <option value="4x4">4x4/SUV</option>
                  <option value="pickup">Pick-up</option>
                  <option value="minibus">Minibus</option>
                  <option value="utilitaire">Utilitaire</option>
                </select>
              </div>

              {/* Disponibilité */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Disponibilité
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Tous</option>
                  <option value="available">Disponible</option>
                  <option value="unavailable">Non disponible</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 pt-3">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
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
