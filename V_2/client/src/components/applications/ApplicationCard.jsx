import { useState } from 'react';
import { applicationsApi } from '../../services/api';

/**
 * Carte d'affichage d'une candidature avec gestion intelligente des statuts
 * @param {Object} props - Props du composant
 * @param {Object} props.application - Candidature à afficher
 * @param {string} props.userRole - Rôle de l'utilisateur (driver/employer)
 * @param {Function} props.onUpdate - Callback de mise à jour
 * @param {Function} props.onOpenConversation - Callback d'ouverture de conversation
 */
export default function ApplicationCard({ application, userRole, onUpdate, onOpenConversation }) {
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Configuration des statuts avec couleurs et messages
  const statusConfig = {
    pending: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Candidature envoyée, en attente de réponse',
      icon: '⏳'
    },
    in_negotiation: {
      label: 'En négociation',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Discussion en cours avec l\'employeur',
      icon: '💬'
    },
    awaiting_final_decision: {
      label: 'Décision finale requise',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'L\'employeur attend votre décision finale',
      icon: '⚠️'
    },
    accepted: {
      label: 'Acceptée',
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Candidature acceptée avec succès',
      icon: '✅'
    },
    rejected: {
      label: 'Refusée',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Candidature refusée',
      icon: '❌'
    },
    withdrawn: {
      label: 'Retirée',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Candidature retirée par le chauffeur',
      icon: '↩️'
    },
    employer_rejected: {
      label: 'Rejetée par l\'employeur',
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Candidature rejetée par l\'employeur',
      icon: '❌'
    }
  };

  const currentStatus = statusConfig[application.status] || statusConfig.pending;

  // Actions selon le statut et le rôle
  const handleAction = async (action, reason = '') => {
    setLoading(true);
    try {
      let response;
      
      switch (action) {
        case 'accept':
          response = await applicationsApi.accept(application._id, reason);
          break;
        case 'reject':
          response = await applicationsApi.reject(application._id, reason);
          break;
        case 'withdraw':
          response = await applicationsApi.withdraw(application._id, reason);
          break;
        case 'send_final_offer':
          // Cette action nécessite une modal séparée
          break;
        default:
          return;
      }

      if (onUpdate) {
        onUpdate(response.data);
      }

      // Message de succès
      const messages = {
        accept: 'Candidature acceptée avec succès !',
        reject: 'Candidature refusée.',
        withdraw: 'Candidature retirée.'
      };
      
      alert(messages[action]);
      
    } catch (error) {
      console.error(`Erreur ${action}:`, error);
      alert(error.response?.data?.message || `Erreur lors de l'action ${action}`);
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  // Ouvrir la conversation
  const handleOpenConversation = () => {
    if (application.conversationId && onOpenConversation) {
      onOpenConversation(application.conversationId);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {application.offer?.title || 'Offre supprimée'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {application.offer?.company || 
             application.offer?.employerId?.companyName || 
             `${application.offer?.employerId?.firstName} ${application.offer?.employerId?.lastName}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Candidature envoyée le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        {/* Badge de statut */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
          <span className="mr-1">{currentStatus.icon}</span>
          {currentStatus.label}
        </div>
      </div>

      {/* Message de la candidature */}
      {application.message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Votre message :</span> {application.message}
          </p>
          
          {/* Analyse du message */}
          {application.messageAnalysis && (
            <div className="mt-2 flex items-center gap-2">
              {application.hasConversation ? (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                  Conversation créée
                </span>
              ) : (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Candidature directe
                </span>
              )}
              
              {application.messageAnalysis.confidence > 0 && (
                <span className="text-xs text-gray-500">
                  Confiance: {Math.round(application.messageAnalysis.confidence * 100)}%
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Proposition finale */}
      {application.finalOffer && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💼 Proposition finale de l'employeur</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {application.finalOffer.salary && (
              <p><span className="font-medium">Salaire :</span> {application.finalOffer.salary.toLocaleString()} FCFA</p>
            )}
            {application.finalOffer.startDate && (
              <p><span className="font-medium">Date de début :</span> {new Date(application.finalOffer.startDate).toLocaleDateString('fr-FR')}</p>
            )}
            {application.finalOffer.conditions && (
              <p><span className="font-medium">Conditions :</span> {application.finalOffer.conditions}</p>
            )}
          </div>
        </div>
      )}

      {/* Description du statut */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{currentStatus.description}</p>
      </div>

      {/* Actions selon le statut et le rôle */}
      <div className="flex flex-wrap gap-2">
        {/* Bouton conversation (si disponible) */}
        {application.hasConversation && application.conversationId && (
          <button
            onClick={handleOpenConversation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Voir la conversation
          </button>
        )}

        {/* Actions pour chauffeur */}
        {userRole === 'driver' && application.status === 'awaiting_final_decision' && (
          <>
            <button
              onClick={() => handleAction('accept', 'Proposition acceptée')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {loading ? 'Traitement...' : 'Accepter l\'offre'}
            </button>
            
            <button
              onClick={() => {
                const reason = prompt('Raison du refus (optionnel) :');
                if (reason !== null) {
                  handleAction('reject', reason || 'Offre refusée');
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Refuser l'offre
            </button>
          </>
        )}

        {/* Action retirer candidature (si possible) */}
        {userRole === 'driver' && ['pending', 'in_negotiation'].includes(application.status) && (
          <button
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
                handleAction('withdraw', 'Candidature retirée par le chauffeur');
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Retirer la candidature
          </button>
        )}
      </div>

      {/* Bannière d'urgence pour décision finale */}
      {application.status === 'awaiting_final_decision' && userRole === 'driver' && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-medium">
              Action requise : Vous devez accepter ou refuser cette offre pour finaliser le processus.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
