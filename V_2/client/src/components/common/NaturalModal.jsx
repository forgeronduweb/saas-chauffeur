/**
 * Modale ultra-naturelle - Style carte moderne sans fond
 */

import { useEffect } from 'react';
import { X, Send } from 'lucide-react';

const NaturalModal = ({ isOpen, onClose, jobTitle = "Chauffeur de camion" }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Version Desktop - Carte flottante au centre */}
      <div className="hidden sm:block fixed inset-0 z-50 pointer-events-none">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className={`
            bg-white rounded-3xl shadow-2xl border border-gray-100 pointer-events-auto
            w-full max-w-md transform transition-all duration-500 ease-out
            ${isOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 rotate-1'}
          `}>
            {/* Header simple */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Postuler à cette offre
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message personnel (optionnel)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                    placeholder="Présentez-vous brièvement..."
                  />
                </div>

                {/* Conseils compacts */}
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-700">
                    💡 <strong>Conseil :</strong> Mentionnez votre expérience et votre motivation pour ce poste.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Mobile - Slide depuis le bas */}
      <div className="sm:hidden fixed inset-0 z-50 pointer-events-none">
        <div className="flex items-end min-h-screen">
          <div className={`
            bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 pointer-events-auto
            w-full transform transition-all duration-500 ease-out
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          `}>
            {/* Handle pour indiquer que c'est draggable */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header mobile */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Postuler
                  </h2>
                  <p className="text-sm text-gray-600">{jobTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Contenu mobile */}
            <div className="px-6 pb-8">
              <div className="space-y-4">
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Présentez-vous brièvement, posez vos questions ou exprimez votre intérêt..."
                />

                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-sm text-orange-700">
                    💡 <strong>Conseil :</strong> Un message personnalisé augmente vos chances d'être remarqué.
                  </p>
                </div>

                <button
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer ma candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NaturalModal;
