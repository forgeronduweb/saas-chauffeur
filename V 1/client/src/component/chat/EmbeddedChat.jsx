import { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EmbeddedChat({ initialConversationId = null, initialOtherParticipant = null }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, []);

  // Gérer la conversation initiale
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === initialConversationId);
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [initialConversationId, conversations]);

  // Scroll automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatService.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    if (selectedConversation?._id === conversation._id) return;
    
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    
    try {
      const response = await chatService.getMessages(conversation._id);
      setMessages(response.data.messages);
      
      // Marquer comme lu
      if (conversation.unreadCount > 0) {
        await chatService.markConversationAsRead(conversation._id);
        // Mettre à jour le compteur local
        setConversations(prev => prev.map(c => 
          c._id === conversation._id ? { ...c, unreadCount: 0 } : c
        ));
        
        // Déclencher l'événement pour mettre à jour les compteurs globaux
        window.dispatchEvent(new CustomEvent('conversationMarkedAsRead'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const response = await chatService.sendMessage(selectedConversation._id, messageContent);
      const newMsg = response.data;
      
      // Ajouter le message à la liste
      setMessages(prev => [...prev, newMsg]);
      
      // Mettre à jour le dernier message de la conversation
      setConversations(prev => prev.map(c => 
        c._id === selectedConversation._id 
          ? { 
              ...c, 
              lastMessage: {
                content: messageContent,
                senderId: newMsg.senderId,
                timestamp: newMsg.createdAt
              }
            }
          : c
      ));
      
      // Déclencher l'événement pour mettre à jour les compteurs de messages non lus
      window.dispatchEvent(new CustomEvent('newMessageSent'));
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setNewMessage(messageContent); // Restaurer le message en cas d'erreur
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row">
      {/* Liste des conversations */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} ${selectedConversation ? 'lg:w-1/3' : 'w-full'} border-r border-gray-200 flex-col bg-white`}>
        {/* Header conversations - Fixe */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800">Conversations</h3>
          <p className="text-sm text-gray-600 mt-1">
            {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Liste scrollable avec hauteur fixe */}
        <div className="h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune conversation
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation._id}
                onClick={() => selectConversation(conversation)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?._id === conversation._id 
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar et infos principales */}
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    conversation.otherParticipant.role === 'driver' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {conversation.otherParticipant.name.charAt(0)}
                  </div>
                  
                  {/* Contenu conversation */}
                  <div className="flex-1 min-w-0">
                    {/* Header avec nom et badge non lu */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm lg:text-base text-gray-900 truncate">
                        {conversation.otherParticipant.name}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium animate-pulse">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Dernier message */}
                    <p className="text-xs lg:text-sm text-gray-600 truncate mb-2 leading-relaxed">
                      {conversation.lastMessage?.content || 'Nouvelle conversation...'}
                    </p>
                    
                    {/* Footer avec rôle et heure */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        conversation.otherParticipant.role === 'driver' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {conversation.otherParticipant.role === 'driver'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {conversation.lastMessage?.timestamp && formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
        {selectedConversation ? (
          <>
            {/* Header de la conversation */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                {/* Bouton retour mobile */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 mr-3 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  selectedConversation.otherParticipant.role === 'driver' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {selectedConversation.otherParticipant.name.charAt(0)}
                </div>
                
                {/* Infos utilisateur */}
                <div className="ml-3">
                  <h4 className="font-semibold text-base text-gray-900">
                    {selectedConversation.otherParticipant.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.otherParticipant.role === 'driver' ? 'Chauffeur' : 'Employeur'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages - Zone scrollable avec hauteur fixe */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3 lg:space-y-4 pb-16">
                {loadingMessages ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
                </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm">
                    Aucun message. Commencez la conversation !
                  </div>
                ) : (
                  messages.map(message => {
                    const isOwn = message.senderId === JSON.parse(localStorage.getItem('user') || '{}').id;
                    return (
                      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-indigo-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="flex-shrink-0 p-4 mt-12 border-t border-gray-200 bg-white">
              <form onSubmit={sendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 lg:mt-[-80px]">
            <div className="text-center px-4">
              <svg className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm lg:text-base">Sélectionnez une conversation pour commencer</p>
              <p className="text-xs lg:text-sm text-gray-400 mt-2 hidden lg:block">Choisissez une conversation dans la liste de gauche pour voir les messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
