import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SimpleHeader from '../component/common/SimpleHeader';
import Footer from '../component/common/Footer';
import OfferCard from '../component/common/OfferCard';
import CustomDropdown from '../component/common/CustomDropdown';
import { offersApi } from '../services/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const navigate = useNavigate();
  
  // États des filtres
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');

  // Options pour les dropdowns
  const cityOptions = [
    { value: '', label: 'Toutes les villes' },
    { value: 'abidjan', label: 'Abidjan' },
    { value: 'yamoussoukro', label: 'Yamoussoukro' },
    { value: 'bouake', label: 'Bouaké' },
    { value: 'daloa', label: 'Daloa' },
    { value: 'san-pedro', label: 'San Pedro' },
    { value: 'man', label: 'Man' },
    { value: 'gagnoa', label: 'Gagnoa' },
    { value: 'korhogo', label: 'Korhogo' },
    { value: 'divo', label: 'Divo' },
    { value: 'abengourou', label: 'Abengourou' },
    { value: 'bondoukou', label: 'Bondoukou' },
    { value: 'seguela', label: 'Séguéla' },
    { value: 'soubre', label: 'Soubré' },
    { value: 'ferkessedougou', label: 'Ferkessédougou' },
    { value: 'odienne', label: 'Odienné' },
    { value: 'touba', label: 'Touba' },
    { value: 'dabou', label: 'Dabou' },
    { value: 'tiassale', label: 'Tiassalé' },
    { value: 'grand-bassam', label: 'Grand-Bassam' },
    { value: 'guiglo', label: 'Guiglo' },
    { value: 'danane', label: 'Danané' },
    { value: 'biankouma', label: 'Biankouma' },
    { value: 'mbatto', label: 'M\'Batto' },
    { value: 'bocanda', label: 'Bocanda' },
    { value: 'katiola', label: 'Katiola' },
    { value: 'bouafle', label: 'Bouaflé' },
    { value: 'sakassou', label: 'Sakassou' },
    { value: 'daoukro', label: 'Daoukro' },
    { value: 'tanda', label: 'Tanda' },
    { value: 'tabou', label: 'Tabou' }
  ];

  const contractTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'independant', label: 'Indépendant' }
  ];

  const workTypeOptions = [
    { value: '', label: 'Tous les horaires' },
    { value: 'temps plein', label: 'Temps plein' },
    { value: 'temps partiel', label: 'Temps partiel' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const experienceOptions = [
    { value: '', label: 'Toute expérience' },
    { value: '1-3', label: '1-3 ans' },
    { value: '3-5', label: '3-5 ans' },
    { value: '5-10', label: '5-10 ans' }
  ];

  // Bannières publicitaires
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=400&fit=crop',
      title: 'Trouvez votre emploi idéal',
      subtitle: 'Des centaines d\'offres disponibles',
      link: '/auth'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
      title: 'Postulez en un clic',
      subtitle: 'Processus simple et rapide',
      link: '/auth'
    }
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        
        // Charger les offres depuis l'API
        const response = await offersApi.list();
        console.log('Offres API (OffersPage):', response);
        
        // L'API retourne {offers: [...]}
        if (response.data && response.data.offers) {
          console.log('Structure des offres:', response.data.offers[0]); // Debug
          setOffers(response.data.offers);
        } else {
          setOffers([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Défilement automatique du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Filtrage combiné (recherche + filtres)
  const filteredOffers = offers.filter(offer => {
    // Normaliser location (peut être string ou objet)
    const locationStr = typeof offer.location === 'string' 
      ? offer.location 
      : (offer.location?.city || offer.location?.ville || '');
    
    // Filtre de recherche
    const matchesSearch = searchQuery === '' ||
      (offer.title && offer.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (offer.company && offer.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (locationStr && locationStr.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtre par ville
    const matchesCity = selectedCity === '' ||
      (locationStr && locationStr.toLowerCase().includes(selectedCity.toLowerCase()));
    
    // Filtre par type de contrat
    const matchesContractType = selectedContractType === '' ||
      (offer.type && offer.type.toLowerCase() === selectedContractType.toLowerCase());
    
    // Filtre par type de travail
    const matchesWorkType = selectedWorkType === '' ||
      (offer.workType && offer.workType.toLowerCase().includes(selectedWorkType.toLowerCase()));
    
    return matchesSearch && matchesCity && matchesContractType && matchesWorkType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader 
        activeTab="offres" 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-8 pt-6">
        {/* Titre section offres avec bouton filtres mobile */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900">
            <span className="lg:hidden">Offres</span>
            <span className="hidden lg:inline">Offres d'emploi</span>
            {' '}<span className="text-gray-500">({filteredOffers.length})</span>
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
                <CustomDropdown
                  value={selectedCity}
                  onChange={setSelectedCity}
                  options={cityOptions}
                  className="w-full"
                />
              </div>

              {/* Type de contrat */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat
                </label>
                <CustomDropdown
                  value={selectedContractType}
                  onChange={setSelectedContractType}
                  options={contractTypeOptions}
                  className="w-full"
                />
              </div>

              {/* Horaire */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horaire
                </label>
                <CustomDropdown
                  value={selectedWorkType}
                  onChange={setSelectedWorkType}
                  options={workTypeOptions}
                  className="w-full"
                />
              </div>

              {/* Expérience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expérience requise
                </label>
                <CustomDropdown
                  value=""
                  onChange={() => {}}
                  options={experienceOptions}
                  className="w-full"
                />
              </div>

              {/* Bouton Réinitialiser */}
              <button 
                onClick={() => {
                  setSelectedCity('');
                  setSelectedContractType('');
                  setSelectedWorkType('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Liste des offres */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {filteredOffers.map(offer => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre disponible</h3>
            <p className="text-gray-600">Aucune offre d'emploi publiée pour le moment</p>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* Bouton Flottant (FAB) - Masqué car remplacé par le bouton Publier dans le header */}
      <div className="hidden fixed bottom-6 right-6 z-50 lg:hidden">
        {/* Menu des options */}
        {showFabMenu && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 -z-10" 
              onClick={() => setShowFabMenu(false)}
            />
            
            {/* Options du menu */}
            <div className="absolute bottom-16 right-0 mb-2 space-y-3">
              {/* Option Marketing */}
              <Link
                to="/publier-offre?type=product"
                onClick={() => setShowFabMenu(false)}
                className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-5 py-3 hover:bg-gray-50 transition-all animate-fade-in"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">Marketing/Vente</span>
              </Link>

              {/* Option Offre d'emploi */}
              <Link
                to="/publier-offre?type=job"
                onClick={() => setShowFabMenu(false)}
                className="flex items-center gap-3 bg-white rounded-full shadow-lg pl-4 pr-5 py-3 hover:bg-gray-50 transition-all animate-fade-in"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11 4V3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1ZM9 2.5H7a.5.5 0 0 0-.5.5v1h3V3a.5.5 0 0 0-.5-.5ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                    <path d="M3 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">Offre d'emploi</span>
              </Link>
            </div>
          </>
        )}

        {/* Bouton principal */}
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all ${showFabMenu ? 'rotate-45' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
            />
          </svg>
        </button>
      </div>

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
                  <option value="man">Man</option>
                  <option value="gagnoa">Gagnoa</option>
                  <option value="korhogo">Korhogo</option>
                  <option value="divo">Divo</option>
                  <option value="abengourou">Abengourou</option>
                  <option value="bondoukou">Bondoukou</option>
                  <option value="seguela">Séguéla</option>
                  <option value="soubre">Soubré</option>
                  <option value="ferkessedougou">Ferkessédougou</option>
                  <option value="odienne">Odienné</option>
                  <option value="touba">Touba</option>
                  <option value="dabou">Dabou</option>
                  <option value="tiassale">Tiassalé</option>
                  <option value="grand-bassam">Grand-Bassam</option>
                  <option value="guiglo">Guiglo</option>
                  <option value="danane">Danané</option>
                  <option value="biankouma">Biankouma</option>
                  <option value="mbatto">M'Batto</option>
                  <option value="bocanda">Bocanda</option>
                  <option value="katiola">Katiola</option>
                  <option value="bouafle">Bouaflé</option>
                  <option value="sakassou">Sakassou</option>
                  <option value="daoukro">Daoukro</option>
                  <option value="tanda">Tanda</option>
                  <option value="tabou">Tabou</option>
                </select>
              </div>

              {/* Type de contrat */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Type de contrat
                </label>
                <select 
                  value={selectedContractType}
                  onChange={(e) => setSelectedContractType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous les types</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="independant">Indépendant</option>
                </select>
              </div>

              {/* Horaire */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Horaire
                </label>
                <select 
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous les horaires</option>
                  <option value="temps plein">Temps plein</option>
                  <option value="temps partiel">Temps partiel</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Expérience */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Expérience requise
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Toute expérience</option>
                  <option value="1-3">1-3 ans</option>
                  <option value="3-5">3-5 ans</option>
                  <option value="5-10">5-10 ans</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 pt-3">
                <button 
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedContractType('');
                    setSelectedWorkType('');
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
