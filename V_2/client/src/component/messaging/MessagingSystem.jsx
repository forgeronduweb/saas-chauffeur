import React, { useState, useEffect } from 'react';
import ConversationsModal from './ConversationsModal';
import ChatModal from './ChatModal';

/**
 * MessagingSystem - Orchestrateur des modales de messagerie
 * 
 * Gestion du flux :
 * 1. Clic sur "Messages" → Ouvre ConversationsModal
 * 2. Clic sur une conversation → Ouvre ChatModal
 * 3. Bouton retour dans ChatModal → Retour à ConversationsModal
 * 4. Fermeture → Ferme tout
 * 
 * Fonctionne sur mobile et desktop avec des modales adaptatives
 */
const MessagingSystem = ({ isOpen, onClose, initialConversationId = null }) => {
  const [showConversations, setShowConversations] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Réinitialiser les états quand la messagerie s'ouvre
  useEffect(() => {
    if (isOpen) {
      setShowConversations(true);
      setShowChat(false);
      setSelectedConversation(null);
    }
  }, [isOpen]);

  // Gestion conversation initiale (ouverture directe d'un chat)
  useEffect(() => {
    if (isOpen && initialConversationId) {
      // Charger la conversation et ouvrir directement le chat
      loadAndOpenConversation(initialConversationId);
    }
  }, [isOpen, initialConversationId]);

  // Écouter les événements personnalisés d'ouverture de messagerie
  useEffect(() => {
    const handleOpenMessaging = (event) => {
      const { conversationId } = event.detail || {};
      
      console.log('📨 Événement openMessaging reçu:', { conversationId, isOpen });
      
      if (conversationId && isOpen) {
        // Si déjà ouvert, charger la conversation
        loadAndOpenConversation(conversationId);
      }
    };

    window.addEventListener('openMessaging', handleOpenMessaging);
    return () => window.removeEventListener('openMessaging', handleOpenMessaging);
  }, [isOpen]);

  const loadAndOpenConversation = async (conversationId) => {
    try {
      // Simuler le chargement de la conversation
      // Dans un cas réel, vous feriez un appel API ici
      const conversation = { _id: conversationId };
      handleSelectConversation(conversation);
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Garder les conversations visibles (style LinkedIn)
    setShowConversations(true);
    setShowChat(true);
  };

  const handleCloseConversations = () => {
    // Fermer uniquement la modal des conversations
    setShowConversations(false);
    // Si le chat n'est pas ouvert, fermer le système complet
    if (!showChat) {
      // Utiliser setTimeout pour s'assurer que l'état est mis à jour
      setTimeout(() => onClose(), 0);
    }
  };

  const handleCloseChat = () => {
    // Fermer uniquement la modal de chat
    setShowChat(false);
    setSelectedConversation(null);
    // Si les conversations ne sont pas ouvertes, fermer le système complet
    if (!showConversations) {
      // Utiliser setTimeout pour s'assurer que l'état est mis à jour
      setTimeout(() => onClose(), 0);
    }
  };

  // Ne rien afficher si fermé
  if (!isOpen) return null;

  return (
    <>
      {/* Modal des conversations */}
      {showConversations && (
        <ConversationsModal
          isOpen={showConversations}
          onClose={handleCloseConversations}
          onSelectConversation={handleSelectConversation}
        />
      )}

      {/* Modal de chat */}
      {showChat && selectedConversation && (
        <ChatModal
          isOpen={showChat}
          conversation={selectedConversation}
          onClose={handleCloseChat}
          onBack={handleCloseChat}
        />
      )}
    </>
  );
};

export default MessagingSystem;
