import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applicationsApi, messagesApi } from '../../services/api';
import negotiationDetector from '../../services/negotiationDetector';

/**
 * Modal intelligente de candidature avec détection automatique de négociation
 * @param {Object} props - Props du composant
 * @param {Object} props.offer - Offre d'emploi
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Function} props.onSuccess - Callback de succès
 */
export default function SmartApplicationModal({ offer, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Analyse en temps réel du message
  useEffect(() => {
    if (message.trim()) {
      const result = negotiationDetector.analyzeMessage(message);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [message]);

  // Fermeture avec nettoyage
  const handleClose = () => {
    setMessage('');
    setAnalysis(null);
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
      // 1️⃣ Analyser le message
      const messageAnalysis = message.trim() 
        ? negotiationDetector.analyzeMessage(message)
        : { needsConversation: false, confidence: 0, detectedKeywords: [], reason: 'Message vide' };

      console.log('📊 Analyse du message:', messageAnalysis);

      // 2️⃣ Créer la candidature avec analyse
      const applicationData = {
        message: message.trim() || "Je suis intéressé(e) par cette offre.",
        messageAnalysis: {
          needsConversation: messageAnalysis.needsConversation,
          confidence: messageAnalysis.confidence,
          detectedKeywords: messageAnalysis.detectedKeywords,
          reason: messageAnalysis.reason
        },
        hasConversation: messageAnalysis.needsConversation
      };

      console.log('📝 Données de candidature:', applicationData);

      const applicationResponse = await applicationsApi.apply(offer._id, applicationData);
      console.log('✅ Candidature créée:', applicationResponse.data);

      let conversationId = null;

      // 3️⃣ Créer conversation SEULEMENT si nécessaire
      if (messageAnalysis.needsConversation) {
        console.log('💬 Création de conversation nécessaire');
        
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

      // 4️⃣ Succès
      const successData = {
        application: applicationResponse.data,
        conversationId,
        needsConversation: messageAnalysis.needsConversation
      };

      if (onSuccess) {
        onSuccess(successData);
      }

      // 5️⃣ Ouvrir la messagerie si conversation créée
      if (conversationId) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openMessaging', {
            detail: { conversationId }
          }));
        }, 1000);
      }

      handleClose();
      
      // Message de succès
      const successMessage = messageAnalysis.needsConversation
        ? 'Candidature envoyée ! Une conversation a été créée pour discuter avec l\'employeur.'
        : 'Candidature envoyée avec succès !';
      
      alert(successMessage);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Postuler à cette offre
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">{offer.title}</p>
          {offer.company && (
            <p className="text-sm text-gray-500">{offer.company}</p>
          )}
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Champ message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message personnel (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Présentez-vous brièvement, posez vos questions ou exprimez votre intérêt..."
              className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={1000}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {message.length}/1000 caractères
              </p>
              {analysis && (
                <p className="text-xs text-gray-500">
                  Confiance: {Math.round(analysis.confidence * 100)}%
                </p>
              )}
            </div>
          </div>

          {/* Indicateur intelligent */}
          {analysis && (
            <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              analysis.needsConversation 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  analysis.needsConversation ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {analysis.needsConversation ? (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${
                    analysis.needsConversation ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {analysis.needsConversation ? '💬 Discussion détectée' : '📋 Candidature simple'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    analysis.needsConversation ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {analysis.needsConversation 
                      ? 'Une conversation sera créée automatiquement pour échanger avec l\'employeur.'
                      : 'Votre candidature sera envoyée directement sans créer de conversation.'
                    }
                  </p>
                  
                  {/* Détails de l'analyse */}
                  {analysis.needsConversation && analysis.detectedKeywords.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 font-medium">Mots-clés détectés:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.detectedKeywords.slice(0, 5).map((keyword, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                        {analysis.detectedKeywords.length > 5 && (
                          <span className="text-xs text-blue-600">
                            +{analysis.detectedKeywords.length - 5} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 mt-2">
                    {analysis.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Conseils */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 text-sm mb-2">💡 Conseils pour votre candidature</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Présentez-vous brièvement et mentionnez votre expérience</li>
              <li>• Posez des questions sur les horaires, conditions ou salaire si nécessaire</li>
              <li>• Exprimez votre motivation pour ce poste spécifique</li>
              <li>• Un message personnalisé augmente vos chances d'être remarqué</li>
            </ul>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  {analysis?.needsConversation ? '💬 Postuler et Discuter' : '📋 Envoyer ma Candidature'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
