import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubNavigation from './SubNavigation';
import SearchResults from './SearchResults';
import MessagingSystem from '../messaging/MessagingSystem';
import FloatingMessagingButton from '../messaging/FloatingMessagingButton';
import { searchService, messagesApi } from '../../services/api';

export default function SimpleHeader({ activeTab = '', searchQuery = '', onSearchChange = () => {}, readOnly = false, hideSubNav = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [initialConversationId, setInitialConversationId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchTimeoutRef = useRef(null);
  const searchContainerDesktopRef = useRef(null);
  const searchContainerMobileRef = useRef(null);
  
  // Charger le compteur de messages non lus
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Écouter les événements d'ouverture de messagerie
  useEffect(() => {
    const handleOpenMessaging = (event) => {
      const { conversationId } = event.detail || {};
      console.log('🎯 SimpleHeader reçoit openMessaging:', { conversationId });
      
      // Fermer d'abord si déjà ouvert pour forcer le re-render
      if (showMessaging) {
        setShowMessaging(false);
        setTimeout(() => {
          setInitialConversationId(conversationId);
          setShowMessaging(true);
        }, 100);
      } else {
        setInitialConversationId(conversationId);
        setShowMessaging(true);
      }
    };

    window.addEventListener('openMessaging', handleOpenMessaging);
    return () => window.removeEventListener('openMessaging', handleOpenMessaging);
  }, [showMessaging]);

  const loadUnreadCount = async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  };

  // Gestion de la recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (localSearchQuery.trim().length >= 1) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await searchService.global(localSearchQuery);
          console.log('🔍 Frontend - Résultats reçus:', response?.data);
          console.log('🔍 Frontend - Drivers:', response?.data?.results?.drivers);
          console.log('🔍 Frontend - Offers:', response?.data?.results?.offers);
          console.log('🔍 Frontend - Products:', response?.data?.results?.products);
          if (response?.data?.results) {
            setSearchResults(response.data.results);
            setShowResults(true);
            console.log('✅ SearchResults mis à jour, showResults:', true);
          }
        } catch (error) {
          console.error('Erreur de recherche:', error);
          console.error('Détails:', error.response?.data || error.message);
          // Afficher un message d'erreur à l'utilisateur
          setSearchResults({ drivers: [], offers: [], products: [], error: true });
          setShowResults(true);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults(null);
      setShowResults(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchQuery]);

  // Fermer les résultats au clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideDesktop = searchContainerDesktopRef.current && 
        !searchContainerDesktopRef.current.contains(event.target);
      const clickedOutsideMobile = searchContainerMobileRef.current && 
        !searchContainerMobileRef.current.contains(event.target);
      
      // Fermer si on clique en dehors du conteneur actif
      if (clickedOutsideDesktop || clickedOutsideMobile) {
        setShowResults(false);
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    onSearchChange(value);
  };

  const handleCloseSearch = () => {
    setShowMobileSearch(false);
    setLocalSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults) {
      // Trouver le premier résultat disponible
      const drivers = searchResults.drivers || [];
      const offers = searchResults.offers || [];
      const products = searchResults.products || [];
      
      if (drivers.length > 0) {
        window.location.href = `/chauffeur/${drivers[0]._id}`;
      } else if (offers.length > 0) {
        window.location.href = `/offre/${offers[0]._id}`;
      } else if (products.length > 0) {
        window.location.href = `/produit/${products[0]._id}`;
      }
    }
  };

  return (
    <>
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${showMessaging ? 'hidden lg:block' : ''}`}>
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-3xl lg:text-8xl">
              <span className="text-orange-500">Go</span>
              <span className="text-gray-900">Driver</span>
            </span>
          </Link>

          {/* Espaceur mobile pour centrer visuellement */}
          <div className="flex-1 lg:hidden"></div>

          {/* Barre de recherche desktop */}
          <div ref={searchContainerDesktopRef} className="hidden lg:flex flex-1 max-w-2xl mx-auto relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher chauffeurs, offres, produits..."
                value={localSearchQuery}
                onChange={readOnly ? undefined : (e) => handleSearchChange(e.target.value)}
                onFocus={() => localSearchQuery.length >= 1 && setShowResults(true)}
                onKeyDown={handleKeyDown}
                readOnly={readOnly}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            {showResults && searchResults && (
              <SearchResults 
                results={searchResults} 
                query={localSearchQuery}
                onClose={() => setShowResults(false)}
              />
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-4 lg:gap-20">
            {/* Icône de recherche mobile */}
            {!readOnly && (
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Rechercher"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <Link
              to="/publier-offre"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm lg:hidden">Publier</span>
              <span className="hidden lg:inline text-sm">Publier une offre</span>
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2"
                >
                  {/* Avatar sur mobile */}
                  <div className="lg:hidden w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {user.profilePhotoUrl ? (
                      <img 
                        src={user.profilePhotoUrl} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    )}
                  </div>
                  {/* Bouton Mon espace sur desktop */}
                  <span className="hidden lg:inline px-4 py-2 bg-orange-500 text-white text-base rounded hover:bg-orange-600 transition-colors">
                    Mon espace
                  </span>
                </button>

                {/* Menu dropdown */}
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    {/* Menu mobile - texte réduit */}
                    <div className="lg:hidden absolute right-0 mt-2 text-sm w-64 p-3 bg-white border border-gray-500/30 text-gray-800/80 rounded-md z-20">
                      {/* Informations utilisateur */}
                      <div className="px-3 py-3 mb-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">
                          {user.role === 'driver' ? 'Chauffeur' : 'Employeur'}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-px">
                        <li className="flex items-center justify-between gap-2 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                          <Link to="/profile" onClick={() => setShowMenu(false)} className="-mr-px">Mon profil</Link>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1F2937" fillOpacity=".8"/>
                          </svg>
                        </li>
                        {user.role === 'employer' && (
                          <>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/candidates" onClick={() => setShowMenu(false)}>Mes candidatures</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/offers" onClick={() => setShowMenu(false)}>Mes annonces</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/my-products" onClick={() => setShowMenu(false)}>Mes offres marketing</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                          </>
                        )}
                        {user.role === 'driver' && (
                          <>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/driver/my-products" onClick={() => setShowMenu(false)}>Mes offres marketing</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/driver/applications" onClick={() => setShowMenu(false)}>Mes candidatures</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                          </>
                        )}
                        <div className="w-full h-px bg-gray-300/50 my-2"></div>
                        <li className="flex items-center text-red-600/80 justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-red-600/20 transition">
                          <button onClick={() => { logout(); setShowMenu(false); }} className="text-left w-full">Déconnexion</button>
                          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 3.833h17m-4.25 0-.287-.766c-.28-.744-.419-1.115-.677-1.39a2.1 2.1 0 0 0-.852-.546C11.559 1 11.118 1 10.237 1H8.763c-.881 0-1.322 0-1.697.131a2.1 2.1 0 0 0-.852.546c-.258.275-.398.646-.676 1.39l-.288.766m10.625 0v9.634c0 1.586 0 2.38-.347 2.986a3.04 3.04 0 0 1-1.393 1.238c-.682.309-1.575.309-3.36.309h-2.55c-1.785 0-2.678 0-3.36-.309a3.04 3.04 0 0 1-1.393-1.238c-.347-.606-.347-1.4-.347-2.986V3.833m8.5 3.778v6.611m-4.25-6.61v6.61" stroke="#DC2626" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Menu desktop - texte normal */}
                    <div className="hidden lg:block absolute right-0 mt-2 text-lg w-64 p-3 bg-white border border-gray-500/30 text-gray-800/80 rounded-md z-20">
                      {/* Informations utilisateur */}
                      <div className="px-3 py-3 mb-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-lg text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-base text-gray-500 mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">
                          {user.role === 'driver' ? 'Chauffeur' : 'Employeur'}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-px">
                        <li className="flex items-center justify-between gap-2 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                          <Link to="/profile" onClick={() => setShowMenu(false)} className="-mr-px">Mon profil</Link>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#1F2937" fillOpacity=".8"/>
                          </svg>
                        </li>
                        {user.role === 'employer' && (
                          <>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/candidates" onClick={() => setShowMenu(false)}>Mes candidatures</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/offers" onClick={() => setShowMenu(false)}>Mes annonces</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/employer/my-products" onClick={() => setShowMenu(false)}>Mes offres marketing</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                          </>
                        )}
                        {user.role === 'driver' && (
                          <>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/driver/my-products" onClick={() => setShowMenu(false)}>Mes offres marketing</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                            <li className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-500/20 transition">
                              <Link to="/driver/applications" onClick={() => setShowMenu(false)}>Mes candidatures</Link>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#1F2937" fillOpacity=".8"/>
                              </svg>
                            </li>
                          </>
                        )}
                        <div className="w-full h-px bg-gray-300/50 my-2"></div>
                        <li className="flex items-center text-red-600/80 justify-between gap-3 cursor-pointer px-3 py-2 rounded hover:bg-red-600/20 transition">
                          <button onClick={() => { logout(); setShowMenu(false); }} className="text-left w-full">Déconnexion</button>
                          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 3.833h17m-4.25 0-.287-.766c-.28-.744-.419-1.115-.677-1.39a2.1 2.1 0 0 0-.852-.546C11.559 1 11.118 1 10.237 1H8.763c-.881 0-1.322 0-1.697.131a2.1 2.1 0 0 0-.852.546c-.258.275-.398.646-.676 1.39l-.288.766m10.625 0v9.634c0 1.586 0 2.38-.347 2.986a3.04 3.04 0 0 1-1.393 1.238c-.682.309-1.575.309-3.36.309h-2.55c-1.785 0-2.678 0-3.36-.309a3.04 3.04 0 0 1-1.393-1.238c-.347-.606-.347-1.4-.347-2.986V3.833m8.5 3.778v6.611m-4.25-6.61v6.61" stroke="#DC2626" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth?mode=login"
                className="px-4 py-2 bg-orange-500 text-white text-sm lg:text-base rounded hover:bg-orange-600 transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>

        {/* Barre de recherche mobile - Affichée au clic */}
        {!readOnly && showMobileSearch && (
          <div ref={searchContainerMobileRef} className="lg:hidden mt-4 animate-fadeIn relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher chauffeurs, offres..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleCloseSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer la recherche"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isSearching && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            {showResults && searchResults && (
              <SearchResults 
                results={searchResults} 
                query={localSearchQuery}
                onClose={handleCloseSearch}
              />
            )}
          </div>
        )}
      </div>

      {/* Sous-menu */}
      {!hideSubNav && <SubNavigation activeTab={activeTab} />}
    </header>

    {/* Système de messagerie - en dehors du header */}
    <MessagingSystem 
      isOpen={showMessaging}
      initialConversationId={initialConversationId}
      onClose={() => {
        setShowMessaging(false);
        setInitialConversationId(null); // Réinitialiser
        loadUnreadCount(); // Recharger le compteur à la fermeture
      }}
    />

    {/* Bouton flottant de messagerie (visible uniquement si connecté et pas sur pages formulaires) - en dehors du header */}
    {user && 
     !location.pathname.includes('/publier-offre') && 
     !location.pathname.includes('/poster-annonce') &&
     !location.pathname.includes('/formulaire') && 
     !location.pathname.includes('/auth') && (
      <FloatingMessagingButton
        isOpen={showMessaging}
        onClick={() => setShowMessaging(!showMessaging)}
        unreadCount={unreadCount}
      />
    )}
    </>
  );
}
