import React, { useState, useRef, useEffect } from 'react'
import { LogOut, User, Settings, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const UserMenu = ({ userInitial }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    setIsOpen(false)
    // Naviguer vers la page de profil (à créer si nécessaire)
    // navigate('/profile')
  }

  const handleSettingsClick = () => {
    setIsOpen(false)
    navigate('/settings')
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {userInitial || user?.email?.charAt(0).toUpperCase() || 'A'}
          </span>
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {user?.email || 'Admin'}
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 text-sm w-56 p-4 bg-white dark:bg-gray-800 border border-gray-300/30 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-md font-medium shadow-lg z-50">
          <ul className="flex flex-col gap-2">
            {/* Informations utilisateur */}
            <li className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.email || 'Administrateur'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Administrateur
              </div>
            </li>

            {/* Mon profil */}
            <li 
              onClick={handleProfileClick}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <User size={18} />
              <span>Mon profil</span>
            </li>

            {/* Paramètres */}
            <li 
              onClick={handleSettingsClick}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Settings size={16} />
              <span>Paramètres</span>
            </li>

            {/* Séparateur */}
            <div className="w-full h-px bg-gray-300/50 dark:bg-gray-600 my-2"></div>

            {/* Aide */}
            <li className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <HelpCircle size={18} />
              <span>Aide</span>
            </li>

            {/* Séparateur */}
            <div className="w-full h-px bg-gray-300/50 dark:bg-gray-600 my-2"></div>

            {/* Déconnexion */}
            <li 
              onClick={handleLogout}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default UserMenu
