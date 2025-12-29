import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driversService, driversApi, offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import Footer from '../component/common/Footer';
import DriverCard from '../component/common/DriverCard';
import OfferCard from '../component/common/OfferCard';
import ProductCard from '../component/common/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function HomePage() {
  const { user, isDriver } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [totalOffers, setTotalOffers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDriverProfile, setCurrentDriverProfile] = useState(null);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Bannières par défaut si aucune n'est configurée
  const defaultBanners = [
    {
      _id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Recrutez en toute confiance',
      link: '/auth'
    },
    {
      _id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Trouvez votre chauffeur idéal',
      link: '/auth'
    },
    {
      _id: 3,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=400&fit=crop',
      title: 'Service premium garanti',
      link: '/chauffeurs'
    }
  ];

  // Charger les bannières depuis l'API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/banners?location=home&active=true`);
        const data = await response.json();
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          setBanners(defaultBanners);
        }
      } catch (error) {
        console.error('Erreur chargement bannières:', error);
        setBanners(defaultBanners);
      }
    };
    fetchBanners();
  }, []);


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

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les chauffeurs (limité à 8 pour la page d'accueil)
        const driversResponse = await driversService.getAll();
        if (driversResponse.data && driversResponse.data.data) {
          const allDrivers = driversResponse.data.data;
          setTotalDrivers(allDrivers.length); // Nombre total
          setDrivers(allDrivers.slice(0, 8)); // Afficher seulement 8
        } else {
          setDrivers([]);
          setTotalDrivers(0);
        }
        
        // Charger les offres (limité à 8 pour la page d'accueil)
        const offersResponse = await offersApi.list();
        console.log('Offres reçues (HomePage):', offersResponse);
        console.log('Structure:', offersResponse.data);
        
        // L'API retourne {offers: [...]} et non {data: [...]}
        if (offersResponse.data && offersResponse.data.offers) {
          const allOffers = offersResponse.data.offers;
          console.log('Nombre d\'offres:', allOffers.length);
          console.log('Première offre:', allOffers[0]);
          setTotalOffers(allOffers.length); // Nombre total
          setOffers(allOffers.slice(0, 8)); // Afficher seulement 8
        } else {
          console.log('Aucune offre API');
          setOffers([]);
          setTotalOffers(0);
        }

        // Charger les produits (limité à 8 pour la page d'accueil)
        try {
          const productsResponse = await api.get('/offers', {
            params: {
              type: 'Autre',
              status: 'active'
            }
          });
          console.log('Produits reçus (HomePage):', productsResponse);
          console.log('Structure produits:', productsResponse.data);
          
          if (productsResponse.data && (productsResponse.data.offers || productsResponse.data)) {
            const allProducts = productsResponse.data.offers || productsResponse.data;
            console.log('Nombre de produits:', allProducts.length);
            console.log('Premier produit:', allProducts[0]);
            setProducts(allProducts.slice(0, 8)); // Afficher seulement 8
          } else {
            console.log('Aucun produit API');
            setProducts([]);
          }
        } catch (productError) {
          console.error('Erreur lors du chargement des produits:', productError);
          setProducts([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // En cas d'erreur, afficher des tableaux vides
        setDrivers([]);
        setTotalDrivers(0);
        setOffers([]);
        setTotalOffers(0);
        setProducts([]);
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

  /**
   * Filtrage combiné (recherche + exclusion du chauffeur connecté)
   * 
   * Logique d'affichage selon le type d'utilisateur:
   * - Non connecté: Affiche tous les chauffeurs
   * - Employeur: Affiche tous les chauffeurs
   * - Chauffeur: Affiche tous les chauffeurs SAUF lui-même
   */
  const filteredDrivers = drivers.filter(driver => {
    // Exclure le chauffeur connecté de la liste (il ne doit pas se voir lui-même)
    if (user && isDriver() && currentDriverProfile && driver._id === currentDriverProfile._id) {
      return false;
    }

    // Filtre de recherche
    const matchesSearch = searchQuery === '' ||
      `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.workZone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader 
        activeTab="" 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Section publicitaire - Carrousel */}
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-4 lg:py-8">
        <div className="relative bg-gray-200 rounded-lg lg:rounded-xl overflow-hidden h-56 sm:h-80 lg:h-[450px]">
          {/* Images du carrousel */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={banner.image} 
                alt={banner.title}
                onClick={() => navigate(banner.link)}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
          ))}

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 lg:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 lg:h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-6 lg:w-8' 
                    : 'bg-white/50 w-1.5 lg:w-2'
                }`}
              />
            ))}
          </div>

          {/* Boutons de navigation - masqués sur mobile */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-8">
        {/* Titre section chauffeurs */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg lg:text-2xl font-normal text-gray-900">
            Chauffeurs <span className="text-gray-500">
              ({user && isDriver() && currentDriverProfile 
                ? `${totalDrivers - 1} plus moi` 
                : `${totalDrivers}`})
            </span>
          </h2>
          <Link 
            to="/chauffeurs" 
            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {/* Liste des chauffeurs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-xl overflow-hidden animate-pulse">
                <div className="h-32 lg:h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDrivers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredDrivers.map(driver => (
              <DriverCard key={driver._id} driver={driver} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-gray-900 mb-2">Aucun chauffeur trouvé</h3>
            <p className="text-gray-600">Aucun chauffeur ne correspond à vos critères de recherche.</p>
          </div>
        )}

        {/* Section Offres d'emploi */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg lg:text-2xl font-normal text-gray-900">
              Offres d'emploi <span className="text-gray-500">({totalOffers})</span>
            </h2>
            <Link 
              to="/offres"
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          {offers.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {offers.map(offer => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-gray-900 mb-2">Aucune offre disponible</h3>
              <p className="text-gray-600">Aucune offre d'emploi ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>

        {/* Section Marketing & Vente */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg lg:text-2xl font-normal text-gray-900">
              Marketing & Vente <span className="text-gray-500">({products.length})</span>
            </h2>
            <Link 
              to="/marketing-vente"
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-gray-900 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">Aucun produit ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
