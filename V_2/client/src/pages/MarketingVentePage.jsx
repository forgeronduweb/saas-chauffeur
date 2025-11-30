import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SimpleHeader from '../component/common/SimpleHeader';
import Footer from '../component/common/Footer';
import ProductCard from '../component/common/ProductCard';
import CustomDropdown from '../component/common/CustomDropdown';
import { offersApi, promotionsApi } from '../services/api';
import { Zap, TrendingUp, Star } from 'lucide-react';

export default function MarketingVentePage() {
  const [products, setProducts] = useState([]);
  const [boostedOffers, setBoostedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const navigate = useNavigate();
  
  // États des filtres
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Catégories spécialisées pour chauffeurs
  const categories = [
    { value: 'vehicules', label: 'Véhicules & Flottes', icon: '🚗', count: 0 },
    { value: 'pieces', label: 'Pièces & Accessoires', icon: '🔧', count: 0 }
  ];

  // Options pour les dropdowns
  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'vehicules', label: 'Véhicules & Flottes' },
    { value: 'pieces', label: 'Pièces & Accessoires' }
  ];

  const conditionOptions = [
    { value: '', label: 'Toutes conditions' },
    { value: 'neuf', label: 'Neuf' },
    { value: 'occasion', label: 'Occasion' },
    { value: 'reconditionne', label: 'Reconditionné' }
  ];

  const cityOptions = [
    { value: '', label: 'Toutes les villes' },
    { value: 'abidjan', label: 'Abidjan' },
    { value: 'yamoussoukro', label: 'Yamoussoukro' },
    { value: 'bouake', label: 'Bouaké' },
    { value: 'daloa', label: 'Daloa' },
    { value: 'san-pedro', label: 'San Pedro' }
  ];

  const priceRangeOptions = [
    { value: '', label: 'Tous les prix' },
    { value: '0-500000', label: '0 - 500,000 FCFA' },
    { value: '500000-2000000', label: '500,000 - 2,000,000 FCFA' },
    { value: '2000000-5000000', label: '2,000,000 - 5,000,000 FCFA' },
    { value: '5000000+', label: '5,000,000+ FCFA' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les offres boostées en priorité
        const boostedResponse = await promotionsApi.getBoostedOffers({
          limit: 6 // Limiter à 6 offres boostées pour la section premium
        });
        
        // Récupérer toutes les offres normales
        const productsResponse = await offersApi.list({
          type: 'Autre',
          status: 'active'
        });
        
        setBoostedOffers(boostedResponse.data.success ? boostedResponse.data.data.offers : []);
        setProducts(productsResponse.data.offers || productsResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les produits');
        setProducts([]);
        setBoostedOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculer le nombre de produits par catégorie
  useEffect(() => {
    categories.forEach(cat => {
      cat.count = products.filter(p => p.category?.toLowerCase() === cat.value).length;
    });
  }, [products]);

  // Fonctions utilitaires pour les boosts
  const getBoostIcon = (type) => {
    switch (type) {
      case 'featured': return <TrendingUp className="w-4 h-4" />;
      case 'premium': return <Star className="w-4 h-4" />;
      case 'urgent': return <Zap className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getBoostColor = (type) => {
    switch (type) {
      case 'featured': return 'blue';
      case 'premium': return 'yellow';
      case 'urgent': return 'red';
      default: return 'blue';
    }
  };

  const getBoostBadge = (boost) => {
    if (!boost) return null;
    
    const colorClass = getBoostColor(boost.type);
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white bg-${colorClass}-500 mb-2`}>
        {getBoostIcon(boost.type)}
        <span>{boost.config?.name || 'Boost'}</span>
      </div>
    );
  };

  // Filtrage combiné (recherche + filtres)
  const filteredProducts = products.filter(product => {
    // Filtre de recherche
    const matchesSearch = searchQuery === '' ||
      (product.title || product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.location?.city || product.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par catégorie
    const matchesCategory = selectedCategory === '' ||
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
    
    // Filtre par ville
    const matchesCity = selectedCity === '' ||
      (product.location?.city && product.location.city.toLowerCase().includes(selectedCity.toLowerCase())) ||
      (product.location && typeof product.location === 'string' && product.location.toLowerCase().includes(selectedCity.toLowerCase()));
    
    // Filtre par condition
    const matchesCondition = selectedCondition === '' ||
      (product.condition && product.condition.toLowerCase() === selectedCondition.toLowerCase());
    
    // Filtre par prix
    let matchesPrice = true;
    if (selectedPriceRange && product.price) {
      const priceValue = typeof product.price === 'string' 
        ? parseInt(product.price.replace(/[^0-9]/g, '')) 
        : product.price;
      
      switch(selectedPriceRange) {
        case '0-100000':
          matchesPrice = priceValue < 100000;
          break;
        case '100000-500000':
          matchesPrice = priceValue >= 100000 && priceValue < 500000;
          break;
        case '500000-2000000':
          matchesPrice = priceValue >= 500000 && priceValue < 2000000;
          break;
        case '2000000-5000000':
          matchesPrice = priceValue >= 2000000 && priceValue < 5000000;
          break;
        case '5000000+':
          matchesPrice = priceValue >= 5000000;
          break;
        default:
          matchesPrice = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesCity && matchesCondition && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader 
        activeTab="marketing" 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-8 pt-6">
        {/* Titre section avec compteur et bouton filtres mobile */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900">
            <span className="lg:hidden">Marketplace</span>
            <span className="hidden lg:inline">Produits & Services</span>
            {' '}<span className="text-gray-500">({filteredProducts.length})</span>
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
              <h3 className="text-lg text-gray-900 mb-4">Filtres</h3>
              
              {/* Catégorie */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Catégorie
                </label>
                <CustomDropdown
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categoryOptions}
                  className="w-full"
                />
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Condition
                </label>
                <CustomDropdown
                  value={selectedCondition}
                  onChange={setSelectedCondition}
                  options={conditionOptions}
                  className="w-full"
                />
              </div>

              {/* Ville */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Ville
                </label>
                <CustomDropdown
                  value={selectedCity}
                  onChange={setSelectedCity}
                  options={cityOptions}
                  className="w-full"
                />
              </div>

              {/* Prix */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Fourchette de prix
                </label>
                <CustomDropdown
                  value={selectedPriceRange}
                  onChange={setSelectedPriceRange}
                  options={priceRangeOptions}
                  className="w-full"
                />
              </div>

              {/* Bouton Réinitialiser */}
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCity('');
                  setSelectedPriceRange('');
                  setSelectedCondition('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Section des offres boostées */}
            {boostedOffers.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Offres mises en avant
                  </h2>
                  <span className="text-sm text-gray-500">Sponsorisé</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                  {boostedOffers.map(product => (
                    <div key={product._id} className="relative">
                      {getBoostBadge(product.boost)}
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des produits normaux */}
            <div className="mb-4">
              <h2 className="text-xl text-gray-900 mb-4">
                Toutes les offres {filteredProducts.length > 0 && `(${filteredProducts.length})`}
              </h2>
            </div>
            
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg text-gray-900 mb-2">Aucun produit disponible</h3>
            <p className="text-gray-600">Aucun produit publié pour le moment</p>
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
                <span className="text-sm text-gray-900 whitespace-nowrap">Marketing/Vente</span>
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
                <span className="text-sm text-gray-900 whitespace-nowrap">Offre d'emploi</span>
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
              <h3 className="text-base text-gray-900">Filtres</h3>
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
              {/* Catégorie */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  Catégorie
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="vehicules">Véhicules Professionnels</option>
                  <option value="pieces">Pièces & Accessoires</option>
                  <option value="services">Entretien & Réparation</option>
                  <option value="equipements">Équipements Pro</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  Condition
                </label>
                <select 
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes conditions</option>
                  <option value="neuf">Neuf</option>
                  <option value="occasion">Occasion</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Ville */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  Ville
                </label>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes les villes</option>
                  <option value="abidjan">Abidjan</option>
                  <option value="bouake">Bouaké</option>
                  <option value="yamoussoukro">Yamoussoukro</option>
                  <option value="san-pedro">San-Pédro</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-xs text-gray-700 mb-1.5">
                  Fourchette de prix
                </label>
                <select 
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous les prix</option>
                  <option value="0-100000">Moins de 100,000 FCFA</option>
                  <option value="100000-500000">100,000 - 500,000 FCFA</option>
                  <option value="500000-2000000">500,000 - 2,000,000 FCFA</option>
                  <option value="2000000-5000000">2,000,000 - 5,000,000 FCFA</option>
                  <option value="5000000+">Plus de 5,000,000 FCFA</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 pt-3">
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedCity('');
                    setSelectedPriceRange('');
                    setSelectedCondition('');
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
