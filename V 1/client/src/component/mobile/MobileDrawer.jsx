import { useEffect } from 'react';

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'bottom', // 'bottom', 'right', 'left'
  size = 'auto' // 'auto', 'full', 'half'
}) {
  
  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getDrawerClasses = () => {
    const baseClasses = 'fixed bg-white z-50 transition-transform duration-300 ease-in-out';
    
    switch (position) {
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 right-0 rounded-t-xl ${
          size === 'full' ? 'h-full' : 
          size === 'half' ? 'h-1/2' : 
          'max-h-[80vh]'
        } ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;
        
      case 'right':
        return `${baseClasses} top-0 right-0 bottom-0 w-80 max-w-[90vw] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`;
        
      case 'left':
        return `${baseClasses} top-0 left-0 bottom-0 w-80 max-w-[90vw] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`;
        
      default:
        return baseClasses;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={getDrawerClasses()}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Handle pour les drawers bottom */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
        
        {/* Content */}
        <div className={`
          flex-1 overflow-y-auto
          ${position === 'bottom' ? 'p-4' : 'p-0'}
        `}>
          {children}
        </div>
      </div>
    </>
  );
}

// Composant spécialisé pour les filtres mobiles
export function MobileFilterDrawer({ isOpen, onClose, children }) {
  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtres"
      position="bottom"
      size="auto"
    >
      <div className="space-y-4">
        {children}
        
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </MobileDrawer>
  );
}
