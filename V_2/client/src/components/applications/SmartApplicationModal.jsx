import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationsApi, messagesApi } from '../../services/api';

/**
 * Modal de candidature simple et naturelle
 * @param {Object} props - Props du composant
 * @param {Object} props.offer - Offre d'emploi
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Function} props.onSuccess - Callback de succès
 */
export default function SmartApplicationModal({ offer, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Supprimé : Analyse IA en temps réel

  // Fermeture avec nettoyage
  const handleClose = () => {
    setMessage('');
    setError('');
    onClose();
  };

  // Soumission de la candidature
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'driver') {
      setError('Vous devez être connecté en tant que chauffeur pour postuler');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Créer la candidature simple
      const applicationData = {
        message: message.trim() || "Je suis intéressé(e) par cette offre."
      };

      const applicationResponse = await applicationsApi.apply(offer._id, applicationData);
      console.log('✅ Candidature créée:', applicationResponse.data);

      // Créer une conversation si un message personnalisé est fourni
      let conversationId = null;
      if (message.trim()) {
        try {
          const conversationResponse = await messagesApi.createOrGetConversation(
            offer.employerId,
            { 
              type: 'offer_application', 
              offerId: offer._id,
              applicationId: applicationResponse.data._id 
            }
          );

          conversationId = conversationResponse.data.conversation._id;
          console.log('💬 Conversation créée:', conversationId);

          // Envoyer le message initial
          await messagesApi.send({
            conversationId,
            content: message.trim(),
            type: 'application_message'
          });

          console.log('📨 Message initial envoyé');

          // Mettre à jour la candidature avec l'ID de conversation
          await applicationsApi.updateConversation(applicationResponse.data._id, conversationId);
          
        } catch (conversationError) {
          console.error('❌ Erreur création conversation:', conversationError);
          // Ne pas faire échouer la candidature si la conversation échoue
        }
      }

      // Succès
      const successData = {
        application: applicationResponse.data,
        conversationId
      };

      if (onSuccess) {
        onSuccess(successData);
      }

      // Ouvrir la messagerie si conversation créée
      if (conversationId) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openMessaging', {
            detail: { conversationId }
          }));
        }, 1000);
      }

      handleClose();
      
      // Message de succès simple
      alert('Candidature envoyée avec succès !');

    } catch (error) {
      console.error('❌ Erreur candidature:', error);
      
      if (error.response?.status === 409) {
        setError('Vous avez déjà postulé à cette offre');
      } else if (error.response?.status === 404) {
        setError('Offre non trouvée ou supprimée');
      } else if (error.response?.status === 401) {
        setError('Vous devez être connecté pour postuler');
      } else {
        setError(error.response?.data?.message || 'Erreur lors de l\'envoi de la candidature');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu conditionnel
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* En-tête moderne */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg text-gray-900">
                Postuler à cette offre
              </h2>
              <p className="text-gray-600 mt-1">{offer.title}</p>
              {offer.company && (
                <p className="text-sm text-gray-500">{offer.company}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={submitting}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Champ message */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Message personnel (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message à l'employeur..."
              className="w-full border border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              maxLength={1000}
              disabled={submitting}
            />
            {/* Compteur de caractères supprimé */}
          </div>

          {/* Supprimé : Indicateur IA intelligent */}

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Conseils supprimés */}

          {/* Boutons centrés avec plus d'espace */}
          <div className="flex gap-6 pt-6 justify-center">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Envoi...' : 'Postuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
