import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserMenu({ userInitial, userRole = 'client', onSettingsClick, onProfileClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout, user } = useAuth();

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setIsOpen(false);
  };

  const getAvatarColor = () => {
    switch (userRole) {
      case 'driver':
        return 'bg-green-600';
      case 'admin':
        return 'bg-red-600';
      default:
        return 'bg-indigo-600';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 w-8 ${getAvatarColor()} rounded-full flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        <span className="text-white text-sm font-medium">
          {userInitial || user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 text-sm w-56 p-4 bg-white border border-gray-300/30 text-gray-500 rounded-md font-medium shadow-lg z-50">
          <ul className="flex flex-col gap-2">
            {/* Informations utilisateur */}
            <li className="px-3 py-2 border-b border-gray-200 mb-2">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'Utilisateur'
                }
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {userRole === 'driver' ? 'Chauffeur' : userRole === 'admin' ? 'Administrateur' : 'Client'}
              </div>
            </li>

            {/* Mon profil */}
            <li 
              onClick={handleProfileClick}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-300/40 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Mon profil</span>
            </li>

            {/* Paramètres */}
            <li 
              onClick={handleSettingsClick}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-300/40 transition"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.001 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" stroke="currentColor" strokeOpacity=".9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.935 10a1.1 1.1 0 0 0 .22 1.213l.04.04a1.332 1.332 0 0 1-.433 2.176 1.33 1.33 0 0 1-1.454-.289l-.04-.04a1.1 1.1 0 0 0-1.213-.22 1.1 1.1 0 0 0-.667 1.007V14a1.333 1.333 0 1 1-2.667 0v-.06a1.1 1.1 0 0 0-.72-1.007 1.1 1.1 0 0 0-1.213.22l-.04.04a1.334 1.334 0 1 1-1.887-1.886l.04-.04a1.1 1.1 0 0 0 .22-1.214 1.1 1.1 0 0 0-1.006-.666H2A1.333 1.333 0 0 1 2 6.72h.06A1.1 1.1 0 0 0 3.068 6a1.1 1.1 0 0 0-.22-1.213l-.04-.04A1.333 1.333 0 1 1 4.695 2.86l.04.04a1.1 1.1 0 0 0 1.213.22h.053a1.1 1.1 0 0 0 .667-1.007V2a1.333 1.333 0 1 1 2.667 0v.06A1.1 1.1 0 0 0 10 3.067a1.1 1.1 0 0 0 1.214-.22l.04-.04a1.334 1.334 0 1 1 1.886 1.886l-.04.04a1.1 1.1 0 0 0-.22 1.214V6a1.1 1.1 0 0 0 1.007.667H14a1.333 1.333 0 1 1 0 2.666h-.06a1.1 1.1 0 0 0-1.006.667" stroke="currentColor" strokeOpacity="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Paramètres</span>
            </li>

            {/* Séparateur */}
            <div className="w-full h-px bg-gray-300/50 my-2"></div>

            {/* Aide */}
            <li className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-gray-300/40 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Aide</span>
            </li>

            {/* Séparateur */}
            <div className="w-full h-px bg-gray-300/50 my-2"></div>

            {/* Déconnexion */}
            <li 
              onClick={handleLogout}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded hover:bg-red-50 hover:text-red-600 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Se déconnecter</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
