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
    direct_offer: {
      label: 'En attente',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Offre directe en attente de réponse',
      isDirectOffer: true
    },
    pending: {
      label: 'En attente',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Candidature envoyée, en attente de réponse'
    },
    in_negotiation: {
      label: 'En négociation',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Discussion en cours avec l\'employeur'
    },
    accepted: {
      label: 'Acceptée',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Candidature acceptée avec succès'
    },
    rejected: {
      label: 'Refusée',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Candidature refusée'
    },
    withdrawn: {
      label: 'Retirée',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Candidature retirée par le chauffeur'
    },
    employer_rejected: {
      label: 'Rejetée',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Candidature rejetée par l\'employeur'
    }
  };

  const currentStatus = statusConfig[application.status] || statusConfig.pending;

  // Actions selon le statut et le rôle
  const handleAction = async (action, reason = '') => {
    setLoading(true);
    try {
      let response;
      
      // Si c'est une offre directe (pas encore de candidature)
      if (application.status === 'direct_offer' || application.isDirectOffer) {
        if (action === 'accept') {
          // Créer une candidature acceptée pour cette offre directe
          response = await applicationsApi.apply(application.offerId._id, { 
            status: 'accepted',
            message: 'J\'accepte votre offre directe.'
          });
          
          if (onUpdate) {
            // Mettre à jour l'UI pour refléter le changement
            onUpdate({
              ...response.data,
              // S'assurer que les champs nécessaires sont présents
              offer: application.offer || application.offerId,
              isDirectOffer: true
            });
          }
          
          alert('Offre directe acceptée avec succès !');
          return;
        } else if (action === 'reject') {
          // Créer une candidature refusée pour cette offre directe
          response = await applicationsApi.apply(application.offerId._id, { 
            status: 'rejected',
            message: 'Je décline votre offre directe.'
          });
          
          if (onUpdate) {
            onUpdate({
              ...response.data,
              offer: application.offer || application.offerId,
              isDirectOffer: true
            });
          }
          
          alert('Offre directe refusée.');
          return;
        }
      }
      
      // Pour les candidatures normales
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
      
      if (messages[action]) {
        alert(messages[action]);
      }
      
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

  // Style élégant pour les offres directes
  const isDirectOffer = application.status === 'direct_offer' || application.isDirectOffer;
  const cardClasses = isDirectOffer 
    ? "bg-white border border-blue-200 rounded-lg p-6 shadow-sm"
    : "bg-white border border-gray-200 rounded-lg p-6 shadow-sm";

  return (
    <div className={cardClasses}>
      {/* Badge élégant pour offres directes */}
      {isDirectOffer && (
        <div className="mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-blue-600 font-medium">Offre directe</span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {application.offer?.title || 'Offre supprimée'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {application.offer?.company || 
             application.offer?.employerId?.companyName || 
             `${application.offer?.employerId?.firstName} ${application.offer?.employerId?.lastName}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isDirectOffer ? 'Offre reçue' : 'Candidature envoyée'} le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        {/* Badge de statut */}
        <div className={`px-3 py-1 rounded text-xs font-medium border ${currentStatus.color}`}>
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


      {/* Description du statut */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{currentStatus.description}</p>
      </div>

      {/* Actions selon le statut et le rôle */}
      <div className="flex flex-wrap gap-2">
        {/* Bouton conversation (si disponible) */}
        {(application.hasConversation || application.isDirectOffer) && application.conversationId && (
          <button
            onClick={handleOpenConversation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {application.isDirectOffer ? 'Contacter le recruteur' : 'Voir la conversation'}
          </button>
        )}

        {/* Actions pour les offres directes */}
        {userRole === 'driver' && application.status === 'direct_offer' && (
          <div className="w-full mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-3">
              Cette offre vous est destinée personnellement
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment accepter cette offre directe ?')) {
                    try {
                      setLoading(true);
                      // Pour les offres directes, utiliser l'ID de l'offre, pas l'ID temporaire
                      const realOfferId = application.isDirectOffer 
                        ? (application.offerId._id || application.offerId)
                        : (application.offerId._id || application._id);
                      
                      console.log('🔍 Debug IDs (Accepter):', {
                        applicationId: application._id,
                        offerId: application.offerId,
                        realOfferId,
                        isDirectOffer: application.isDirectOffer
                      });
                      
                      const response = await applicationsApi.respondToDirectOffer(
                        realOfferId, 
                        'accept', 
                        'J\'accepte votre offre directe.'
                      );
                      
                      if (onUpdate) {
                        // Mettre à jour le statut local immédiatement
                        onUpdate({
                          ...application,
                          status: 'accepted',
                          isDirectOffer: true, // Garder le flag pour différencier même après acceptation
                          wasDirectOffer: true, // Nouveau flag pour indiquer l'origine
                          message: 'J\'accepte votre offre directe.',
                          updatedAt: new Date().toISOString()
                        });
                      }
                      
                      // Feedback visuel moderne
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                      notification.textContent = 'Offre acceptée avec succès !';
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);
                    } catch (error) {
                      console.error('Erreur lors de l\'acceptation de l\'offre directe:', error);
                      alert(error.response?.data?.message || 'Une erreur est survenue lors de l\'acceptation de l\'offre');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? 'Traitement...' : 'Accepter'}
              </button>
            
              <button
                onClick={async () => {
                  const reason = prompt('Raison du refus (optionnel) :');
                  if (reason !== null) {
                    try {
                      setLoading(true);
                      // Pour les offres directes, utiliser l'ID de l'offre, pas l'ID temporaire
                      const realOfferId = application.isDirectOffer 
                        ? (application.offerId._id || application.offerId)
                        : (application.offerId._id || application._id);
                      
                      const response = await applicationsApi.respondToDirectOffer(
                        realOfferId, 
                        'reject', 
                        reason || 'Je décline votre offre directe.'
                      );
                      
                      if (onUpdate) {
                        // Mettre à jour le statut local immédiatement
                        onUpdate({
                          ...application,
                          status: 'rejected',
                          isDirectOffer: true, // Garder le flag pour différencier même après refus
                          wasDirectOffer: true, // Nouveau flag pour indiquer l'origine
                          message: reason || 'Je décline votre offre directe.',
                          updatedAt: new Date().toISOString()
                        });
                      }
                      
                      // Feedback visuel moderne
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                      notification.textContent = 'Offre refusée. Réponse envoyée.';
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);
                    } catch (error) {
                      console.error('Erreur lors du refus de l\'offre directe:', error);
                      alert(error.response?.data?.message || 'Une erreur est survenue lors du refus de l\'offre');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
              >
                Refuser
              </button>
            </div>
          </div>
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

    </div>
  );
}
