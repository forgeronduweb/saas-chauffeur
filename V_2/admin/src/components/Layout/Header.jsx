import React, { useMemo } from 'react'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = ({ onMenuClick, isDark, onThemeToggle }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
      '/test-connection': 'Test de connexion'
    }
    return titles[path] || 'Tableau de bord'
  }, [location.pathname])

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
