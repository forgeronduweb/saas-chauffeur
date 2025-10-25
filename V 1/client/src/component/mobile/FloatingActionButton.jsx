import { useState } from 'react';

export default function FloatingActionButton({ 
  icon, 
  onClick, 
  className = '',
  color = 'indigo', // 'indigo', 'green', 'red', 'blue'
  size = 'md', // 'sm', 'md', 'lg'
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'bottom-center'
  tooltip,
  disabled = false
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getColorClasses = () => {
    const colors = {
      indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };
    return colors[color] || colors.indigo;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-12 w-12',
      md: 'h-14 w-14',
      lg: 'h-16 w-16'
    };
    return sizes[size] || sizes.md;
  };

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['bottom-right'];
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 'h-5 w-5',
      md: 'h-6 w-6',
      lg: 'h-7 w-7'
    };
    return iconSizes[size] || iconSizes.md;
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          fixed ${getPositionClasses()} ${getSizeClasses()}
          ${getColorClasses()}
          text-white rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          z-40 ${className}
        `}
      >
        <div className={getIconSize()}>
          {icon}
        </div>
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className={`
          fixed ${getPositionClasses()} 
          bg-gray-900 text-white text-sm px-3 py-2 rounded-lg
          transform -translate-x-full -translate-y-2 mr-4
          opacity-90 pointer-events-none z-50
        `}>
          {tooltip}
          <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2">
            <div className="border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour les FAB avec menu d'actions
export function FloatingActionMenu({ 
  mainIcon, 
  actions = [], 
  color = 'indigo',
  position = 'bottom-right' 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="lg:hidden">
      {/* Actions secondaires */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 space-y-3 z-40">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-end animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Label */}
              <span className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg mr-3 opacity-90">
                {action.label}
              </span>
              
              {/* Bouton */}
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`
                  h-12 w-12 bg-white border-2 border-gray-200 rounded-full shadow-lg
                  flex items-center justify-center text-gray-600 hover:text-gray-900
                  transition-all duration-200 hover:scale-105 active:scale-95
                `}
              >
                <div className="h-5 w-5">
                  {action.icon}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bouton principal */}
      <FloatingActionButton
        icon={
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
            {mainIcon}
          </div>
        }
        onClick={toggleMenu}
        color={color}
        position={position}
        className="z-50"
      />
    </div>
  );
}
