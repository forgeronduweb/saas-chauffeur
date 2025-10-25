import { useState, useEffect } from 'react';

export default function MobileBottomNav({ activeTab, setActiveTab, menuItems, userRole = 'client' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Masquer/afficher la navigation lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll vers le bas - masquer
        setIsVisible(false);
      } else {
        // Scroll vers le haut - afficher
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Utiliser tous les éléments du menu (pas de limite à 5)
  const mobileMenuItems = menuItems;

  const getIconColor = (isActive) => {
    if (userRole === 'driver') {
      return isActive ? 'text-green-600' : 'text-gray-400';
    }
    return isActive ? 'text-indigo-600' : 'text-gray-400';
  };

  const getActiveBackground = () => {
    return userRole === 'driver' ? 'bg-green-50' : 'bg-indigo-50';
  };

  return (
    <nav className={`
      lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50
      transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `}>
      <div className="grid gap-1 p-3" style={{gridTemplateColumns: `repeat(${mobileMenuItems.length}, minmax(0, 1fr))`}}>
        {mobileMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-h-[60px]
                ${isActive ? getActiveBackground() : 'hover:bg-gray-50'}
                transition-colors duration-200
              `}
            >
              <div className={`${getIconColor(isActive)} relative mb-1`}>
                <div className="h-6 w-6 flex items-center justify-center">
                  {item.icon}
                </div>
                
                {/* Badge de notification */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              {/* Label sous l'icône */}
              <span className={`text-xs font-medium ${getIconColor(isActive)} truncate max-w-full`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
