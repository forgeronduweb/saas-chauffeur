import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppSidebar } from '../AppSidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar'
import { Search, X, Users, Building2, Briefcase, FileText, ShoppingBag, Car, Image, AlertTriangle, Settings } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Tableau de bord',
  '/drivers': 'Chauffeurs',
  '/employers': 'Employeurs',
  '/offers': 'Offres',
  '/applications': 'Candidatures',
  '/missions': 'Missions',
  '/products': 'Produits',
  '/banners': 'Marketing & Boost',
  '/reports': 'Signalements',
  '/notifications': 'Notifications',
  '/settings': 'Paramètres',
  '/drivers-validation': 'Validation',
}

const searchOptions = [
  { label: 'Chauffeurs', path: '/drivers', icon: Users },
  { label: 'Employeurs', path: '/employers', icon: Building2 },
  { label: 'Offres d\'emploi', path: '/offers', icon: Briefcase },
  { label: 'Candidatures', path: '/applications', icon: FileText },
  { label: 'Produits', path: '/products', icon: ShoppingBag },
  { label: 'Missions', path: '/missions', icon: Car },
  { label: 'Bannières', path: '/banners', icon: Image },
  { label: 'Signalements', path: '/reports', icon: AlertTriangle },
  { label: 'Paramètres', path: '/settings', icon: Settings },
]

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const getPageTitle = () => {
    const path = location.pathname
    if (pageTitles[path]) return pageTitles[path]
    if (path.startsWith('/drivers/')) return 'Détails chauffeur'
    if (path.startsWith('/employers/')) return 'Détails employeur'
    if (path.startsWith('/offers/')) return 'Détails offre'
    if (path.startsWith('/applications/')) return 'Détails candidature'
    return 'Administration'
  }

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 grid grid-cols-3 h-14 items-center border-b border-sidebar-border bg-white px-4 lg:px-6">
          {/* Gauche - Titre */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="hidden sm:block text-lg font-medium text-gray-900 truncate">{getPageTitle()}</h1>
          </div>
          
          {/* Centre - Barre de recherche (position fixe) */}
          <div className="flex justify-center">
            <div className="w-full max-w-md relative">
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
                className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-gray-300 transition-all placeholder-gray-500"
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

            {/* Résultats de recherche */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <button
                        key={option.path}
                        onClick={() => handleSearch(option.path)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                      >
                        <IconComponent className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </button>
                    )
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Droite - Espace vide pour équilibrer */}
          <div></div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <div className="animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
