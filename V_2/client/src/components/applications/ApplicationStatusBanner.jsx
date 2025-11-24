import { useState } from 'react';
import { applicationsApi } from '../../services/api';

/**
 * Bannière d'état pour les conversations liées aux candidatures
 * Affiche des informations contextuelles et des actions selon le statut
 * @param {Object} props - Props du composant
 * @param {Object} props.conversation - Conversation avec contexte d'application
 * @param {string} props.userRole - Rôle de l'utilisateur (driver/employer)
 * @param {Function} props.onStatusUpdate - Callback de mise à jour de statut
 */
export default function ApplicationStatusBanner({ conversation, userRole, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);

  // Vérifier si c'est une conversation de candidature
  if (!conversation?.context || conversation.context.type !== 'offer_application') {
    return null;
  }

  const { context } = conversation;
  const applicationId = context.applicationId;

  // Actions pour l'employeur
  const handleSendFinalOffer = async () => {
    try {
      setLoading(true);
      
      // Ici, on pourrait ouvrir une modal pour saisir les détails de l'offre
      // Pour l'instant, on utilise des prompts simples
      const salary = prompt('Salaire proposé (FCFA) :');
      const startDate = prompt('Date de début souhaitée (YYYY-MM-DD) :');
      const conditions = prompt('Conditions particulières (optionnel) :');
      
      if (salary) {
        const offerData = {
          salary: parseInt(salary),
          startDate: startDate ? new Date(startDate) : null,
          conditions: conditions || ''
        };
        
        await applicationsApi.sendFinalOffer(applicationId, offerData);
        
        if (onStatusUpdate) {
          onStatusUpdate('awaiting_final_decision');
        }
        
        alert('Proposition finale envoyée avec succès !');
      }
    } catch (error) {
      console.error('Erreur envoi proposition finale:', error);
      alert('Erreur lors de l\'envoi de la proposition finale');
    } finally {
      setLoading(false);
    }
  };

  // Actions pour le chauffeur
  const handleDriverAction = async (action) => {
    try {
      setLoading(true);
      
      let reason = '';
      if (action === 'reject') {
        reason = prompt('Raison du refus (optionnel) :') || 'Offre refusée';
      } else if (action === 'accept') {
        reason = 'Offre acceptée';
      }
      
      if (action === 'reject' || window.confirm(`Êtes-vous sûr de vouloir ${action === 'accept' ? 'accepter' : 'refuser'} cette offre ?`)) {
        if (action === 'accept') {
          await applicationsApi.accept(applicationId, reason);
        } else {
          await applicationsApi.reject(applicationId, reason);
        }
        
        if (onStatusUpdate) {
          onStatusUpdate(action === 'accept' ? 'accepted' : 'rejected');
        }
        
        const message = action === 'accept' ? 'Offre acceptée avec succès !' : 'Offre refusée.';
        alert(message);
      }
    } catch (error) {
      console.error(`Erreur ${action}:`, error);
      alert(`Erreur lors de l'action ${action}`);
    } finally {
      setLoading(false);
    }
  };

  // Bannière pour statut "in_negotiation" - Employeur peut envoyer proposition finale
  if (context.status === 'in_negotiation' && userRole === 'employer') {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800">Négociation en cours</h4>
              <p className="text-sm text-green-700">
                Prêt à finaliser votre offre ? Le chauffeur devra donner sa réponse définitive.
              </p>
            </div>
          </div>
          <button
            onClick={handleSendFinalOffer}
            disabled={loading}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Envoi...' : '📋 Envoyer proposition finale'}
          </button>
        </div>
      </div>
    );
  }

  // Bannière pour statut "awaiting_final_decision" - Chauffeur doit décider
  if (context.status === 'awaiting_final_decision' && userRole === 'driver') {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-red-800">Décision finale requise</h4>
            <p className="text-sm text-red-700">
              L'employeur a envoyé une proposition finale. Vous devez accepter ou refuser pour finaliser le processus.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleDriverAction('accept')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Traitement...' : '✅ Accepter l\'offre'}
          </button>
          <button
            onClick={() => handleDriverAction('reject')}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
          >
            ❌ Refuser l'offre
          </button>
        </div>
        
        <p className="text-xs text-red-600 mt-2">
          ⚠️ Important : Les messages ne suffisent pas à valider votre décision. Utilisez les boutons ci-dessus.
        </p>
      </div>
    );
  }

  // Bannière informative pour les autres statuts
  const statusMessages = {
    pending: {
      color: 'yellow',
      title: 'Candidature en attente',
      message: 'Votre candidature a été envoyée et est en attente de réponse.',
      icon: '⏳'
    },
    accepted: {
      color: 'green',
      title: 'Candidature acceptée',
      message: 'Félicitations ! Votre candidature a été acceptée.',
      icon: '🎉'
    },
    rejected: {
      color: 'red',
      title: 'Candidature refusée',
      message: 'Votre candidature n\'a pas été retenue pour ce poste.',
      icon: '😔'
    },
    withdrawn: {
      color: 'gray',
      title: 'Candidature retirée',
      message: 'Vous avez retiré votre candidature pour cette offre.',
      icon: '↩️'
    },
    employer_rejected: {
      color: 'red',
      title: 'Candidature rejetée',
      message: 'L\'employeur a rejeté votre candidature.',
      icon: '❌'
    }
  };

  const statusInfo = statusMessages[context.status];
  if (!statusInfo) return null;

  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    green: 'bg-green-50 border-green-400 text-green-800',
    red: 'bg-red-50 border-red-400 text-red-800',
    gray: 'bg-gray-50 border-gray-400 text-gray-800'
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${colorClasses[statusInfo.color]}`}>
      <div className="flex items-center">
        <span className="text-lg mr-3">{statusInfo.icon}</span>
        <div>
          <h4 className="text-sm font-medium">{statusInfo.title}</h4>
          <p className="text-sm">{statusInfo.message}</p>
        </div>
      </div>
    </div>
  );
}
