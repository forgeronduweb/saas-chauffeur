/**
 * Modale personnalisée sans fond noir - Style naturel et professionnel
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-lg',
  showCloseButton = true 
}) => {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Pas d'overlay du tout - juste le contenu */}
      
      {/* Contenu de la modale - style carte flottante */}
      <div className={`
        relative bg-white rounded-2xl shadow-xl border border-gray-100
        w-full ${maxWidth} max-h-[90vh] overflow-y-auto pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `}>
        {/* Header avec titre et bouton fermer */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}
        
        {/* Contenu */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

// Exemple d'utilisation pour votre cas de candidature
export const ApplicationModal = ({ isOpen, onClose, jobTitle }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Postuler à cette offre"
      maxWidth="max-w-2xl"
    >
      {/* En-tête avec info du poste */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {jobTitle || 'Chauffeur de camion'}
        </h3>
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Formulaire */}
      <div className="space-y-6">
        {/* Message personnel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message personnel (optionnel)
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            rows={4}
            placeholder="Présentez-vous brièvement, posez vos questions ou exprimez votre intérêt..."
          />
          <div className="text-sm text-gray-500 mt-1">
            0/1000 caractères
          </div>
        </div>

        {/* Conseils */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-orange-600">💡</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-orange-800 mb-2">
                Conseils pour votre candidature
              </h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Présentez-vous brièvement et mentionnez votre expérience</li>
                <li>• Posez des questions sur les horaires, conditions ou salaire si nécessaire</li>
                <li>• Exprimez votre motivation pour ce poste spécifique</li>
                <li>• Un message personnalisé augmente vos chances d'être remarqué</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>📄</span>
            Envoyer ma candidature
          </button>
        </div>
      </div>
    </CustomModal>
  );
};
