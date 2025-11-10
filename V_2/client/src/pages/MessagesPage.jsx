import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from '../component/common/SimpleHeader';
import ConversationList from '../component/messages/ConversationList';
import ChatWindow from '../component/messages/ChatWindow';
import { messagesApi } from '../services/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  // Redirection vers la page d'accueil (les modales sont maintenant utilisées partout)
  useEffect(() => {
    navigate('/');
    return;
  }, [navigate]);

  // Charger les conversations
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchConversations();

    // Polling automatique toutes les 60 secondes en mode silencieux (réduit pour éviter rafraîchissements visibles)
    const intervalId = setInterval(() => {
      fetchConversations(true); // Mode silencieux
    }, 60000);

    // Gérer le redimensionnement
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, [user, navigate]);

  // Sélectionner une conversation depuis l'URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await messagesApi.getConversations();
      const newConversations = response.data.conversations || [];
      
      // Mise à jour silencieuse - comparer intelligemment
      setConversations(prevConversations => {
        // Comparer seulement les IDs et timestamps pour éviter JSON.stringify coûteux
        const prevIds = prevConversations.map(c => `${c._id}-${c.lastMessage?.createdAt || ''}`);
        const newIds = newConversations.map(c => `${c._id}-${c.lastMessage?.createdAt || ''}`);
        
        if (prevIds.length === newIds.length && prevIds.every((id, i) => id === newIds[i])) {
          return prevConversations; // Pas de changement
        }
        return newConversations;
      });
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mettre à jour l'URL
    navigate(`/messages?conversation=${conversation._id}`, { replace: true });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    navigate('/messages', { replace: true });
  };

  const handleNewMessage = useCallback((message) => {
    // Mise à jour optimiste de la conversation active sans recharger toute la liste
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv._id === selectedConversation?._id) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });
    });
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader activeTab="messages" readOnly />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader activeTab="messages" readOnly />
      
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-6">
        {/* Conteneur principal - Plein écran sur mobile */}
        <div className="bg-white border-0 sm:border border-gray-200 overflow-hidden h-[calc(100vh-80px)] sm:h-auto">
          <div className="grid lg:grid-cols-3 h-full sm:h-[calc(100vh-240px)] min-h-[600px]">
            {/* Liste des conversations - Desktop toujours visible, Mobile conditionnelle */}
            <div className={`
              lg:col-span-1 border-r border-gray-200 
              ${isMobileView && selectedConversation ? 'hidden' : 'block'}
            `}>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onRefresh={fetchConversations}
              />
            </div>

            {/* Fenêtre de chat - Desktop toujours visible, Mobile conditionnelle */}
            <div className={`
              lg:col-span-2 
              ${isMobileView && !selectedConversation ? 'hidden' : 'block'}
            `}>
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={isMobileView ? handleBackToList : null}
                  onNewMessage={handleNewMessage}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-1">Choisissez une conversation pour commencer à discuter</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
