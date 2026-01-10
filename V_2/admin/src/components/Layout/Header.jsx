import React, { useMemo, useState } from 'react'
import { Menu, Bell, Search, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = ({ onMenuClick, isDark, onThemeToggle }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Mapper les routes aux titres de pages
  const pageTitle = useMemo(() => {
    const path = location.pathname
    const titles = {
      '/dashboard': 'Tableau de bord',
      '/drivers': 'Gestion des chauffeurs',
      '/drivers-validation': 'Validation des chauffeurs',
      '/employers': 'Gestion des employeurs',
      '/applications': 'Gestion des candidatures',
      '/offers': 'Gestion des offres',
      '/offers-moderation': 'Modération des offres',
      '/vehicles': 'Gestion des véhicules',
      '/missions': 'Gestion des missions',
      '/transactions': 'Gestion financière',
      '/support': 'Support client',
      '/platform-config': 'Configuration',
      '/notifications': 'Notifications',
      '/settings': 'Paramètres',
      '/test-connection': 'Test de connexion',
      '/products': 'Gestion des produits',
      '/banners': 'Gestion des bannières',
      '/reports': 'Signalements'
    }
    return titles[path] || 'Tableau de bord'
  }, [location.pathname])

  // Options de recherche rapide
  const searchOptions = [
    { label: 'Chauffeurs', path: '/drivers', icon: '👨‍✈️' },
    { label: 'Employeurs', path: '/employers', icon: '🏢' },
    { label: 'Offres d\'emploi', path: '/offers', icon: '💼' },
    { label: 'Candidatures', path: '/applications', icon: '📋' },
    { label: 'Produits', path: '/products', icon: '🛒' },
    { label: 'Missions', path: '/missions', icon: '🚗' },
    { label: 'Véhicules', path: '/vehicles', icon: '🚙' },
    { label: 'Bannières', path: '/banners', icon: '🖼️' },
    { label: 'Signalements', path: '/reports', icon: '⚠️' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ]

  // Filtrer les options selon la recherche
  const filteredOptions = searchQuery.trim()
    ? searchOptions.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchOptions

  const handleSearch = (path) => {
    navigate(path)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (filteredOptions.length > 0) {
      handleSearch(filteredOptions[0].path)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-4 py-3 h-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
            {pageTitle}
          </h1>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(true)
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Résultats de recherche */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.path}
                    onClick={() => handleSearch(option.path)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
