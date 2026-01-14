import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Car, 
  Briefcase, 
  DollarSign, 
  Settings, 
  LogOut,
  BarChart3,
  User,
  Users,
  HeadphonesIcon,
  Cog,
  Bell,
  FileText,
  Megaphone
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { path: '/dashboard', icon: Home, label: 'Tableau de bord' },
      ]
    },
    {
      title: 'Utilisateurs',
      items: [
        { path: '/drivers', icon: Users, label: 'Chauffeurs' },
        { path: '/employers', icon: User, label: 'Employeurs' },
      ]
    },
    {
      title: 'Offres & Produits',
      items: [
        { path: '/offers', icon: Briefcase, label: 'Offres' },
        { path: '/applications', icon: FileText, label: 'Candidatures' },
        { path: '/products', icon: DollarSign, label: 'Produits/Services', badge: 'Bientôt' },
      ]
    },
    {
      title: 'Opérations',
      items: [
        { path: '/missions', icon: BarChart3, label: 'Missions' },
        { path: '/vehicles', icon: Car, label: 'Véhicules' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { path: '/marketing', icon: Megaphone, label: 'Contenu Marketing' },
      ]
    },
    {
      title: 'Système',
      items: [
        { path: '/settings', icon: Settings, label: 'Paramètres' },
      ]
    }
  ]

  const handleLogout = () => {
    logout()
    onClose?.()
  }

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-0.5">
              <span className="text-gray-900">GoDriver</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">ADMINISTRATION</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="px-3 mb-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <li key={item.path}>
                      {item.badge ? (
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{item.label}</span>
                          <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded flex-shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-orange-800 text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer avec User & Logout */}
        <div className="border-t border-gray-200 p-2.5">
          {/* User Info */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 mb-1.5 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-800 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.firstName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
