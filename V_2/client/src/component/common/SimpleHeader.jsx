import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubNavigation from './SubNavigation';
import SearchResults from './SearchResults';
import MessagingSystem from '../messaging/MessagingSystem';
import FloatingMessagingButton from '../messaging/FloatingMessagingButton';
import { searchService, messagesApi } from '../../services/api';
import { User, ShoppingCart, FileText, Briefcase, LogOut, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../../components/ui/dropdown-menu';

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
              <span className="text-orange-500 font-bold">Go</span>
              <span className="text-gray-900 font-bold">Driver</span>
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
              <>
                {/* Notifications */}
                <NotificationBell />
                
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* Informations utilisateur */}
                  <div className="px-3 py-3 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">
                      {user.role === 'driver' ? 'Chauffeur' : 'Employeur'}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center justify-between cursor-pointer">
                      Mon profil
                      <User className="w-4 h-4 text-gray-500" />
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'employer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/employer/candidates" className="flex items-center justify-between cursor-pointer">
                          Mes candidatures
                          <FileText className="w-4 h-4 text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/employer/offers" className="flex items-center justify-between cursor-pointer">
                          Mes annonces
                          <Briefcase className="w-4 h-4 text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/employer/my-products" className="flex items-center justify-between cursor-pointer">
                          Mes offres marketing
                          <ShoppingCart className="w-4 h-4 text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'driver' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/driver/my-products" className="flex items-center justify-between cursor-pointer">
                          Mes offres marketing
                          <ShoppingCart className="w-4 h-4 text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/driver/applications" className="flex items-center justify-between cursor-pointer">
                          Mes candidatures
                          <FileText className="w-4 h-4 text-gray-500" />
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <span className="flex items-center justify-between w-full">
                      Déconnexion
                      <LogOut className="w-4 h-4" />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
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
