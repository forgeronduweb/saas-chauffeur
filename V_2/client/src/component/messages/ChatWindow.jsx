import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { messagesApi } from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChatWindow({ conversation, onBack, onNewMessage }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenuForMessage, setShowMenuForMessage] = useState(null);
  const [deletedMessageIds, setDeletedMessageIds] = useState(new Set()); // Messages supprimés localement
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const otherUser = conversation.otherParticipant;

  // Charger les messages
  useEffect(() => {
    if (conversation?._id) {
      fetchMessages();
      // Marquer comme lu
      markAsRead();
      
      // Polling automatique toutes les 60 secondes en mode silencieux (réduit pour éviter rafraîchissements visibles)
      const intervalId = setInterval(() => {
        if (!isTyping) {
          fetchMessages(true); // Mode silencieux - pas de loader
        }
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [conversation?._id, isTyping]); // Retiré deletedMessageIds pour éviter re-renders

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenuForMessage && !event.target.closest('.message-menu')) {
        setShowMenuForMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenuForMessage]);

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await messagesApi.getMessages(conversation._id);
      const allMessages = response.data.messages || [];
      
      // Filtrer les messages supprimés localement
      const filteredMessages = allMessages.filter(msg => !deletedMessageIds.has(msg._id));
      
      // Mise à jour silencieuse - comparer intelligemment
      setMessages(prevMessages => {
        // Comparer seulement les IDs et timestamps pour éviter JSON.stringify coûteux
        const prevIds = prevMessages.map(m => `${m._id}-${m.createdAt}`);
        const newIds = filteredMessages.map(m => `${m._id}-${m.createdAt}`);
        
        if (prevIds.length === newIds.length && prevIds.every((id, i) => id === newIds[i])) {
          return prevMessages; // Pas de changement
        }
        return filteredMessages;
      });
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [conversation._id, deletedMessageIds]);

  const markAsRead = async () => {
    try {
      await messagesApi.markAsRead(conversation._id);
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await messagesApi.send({
        conversationId: conversation._id,
        content: newMessage.trim(),
        type: 'text'
      });

      // Ajouter le message à la liste avec senderId correct
      const newMsg = {
        ...response.data.message,
        senderId: user.sub // S'assurer que senderId est l'ID de l'utilisateur connecté
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Notifier le parent
      if (onNewMessage) {
        onNewMessage(newMsg);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, conversation._id, user.sub, onNewMessage]);

  const handleDeleteMessage = useCallback((messageId) => {
    // Ajouter l'ID à la liste des messages supprimés
    setDeletedMessageIds(prev => new Set([...prev, messageId]));
    
    // Retirer le message de la liste affichée
    setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
    setShowMenuForMessage(null);
    
    // TODO: Implémenter l'appel API côté serveur si nécessaire
    // await messagesApi.deleteMessage(messageId);
  }, []);

  const formatMessageTime = (date) => {
    try {
      return format(new Date(date), 'HH:mm', { locale: fr });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (date) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return '';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Grouper les messages par date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatMessageDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative">
      {/* En-tête du chat - Fixed sous le sous-header sur mobile, absolute sur desktop */}
      <div className="fixed top-[128px] lg:absolute lg:top-0 left-0 right-0 z-20 flex items-center gap-1.5 xs:gap-2 sm:gap-3 p-2 xs:p-3 sm:p-4 border-b border-gray-200 bg-white">
        {/* Bouton retour (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="flex-shrink-0">
          {otherUser?.profilePhotoUrl ? (
            <img
              src={otherUser.profilePhotoUrl}
              alt={`${otherUser.firstName} ${otherUser.lastName}`}
              className="w-8 xs:w-10 sm:w-12 h-8 xs:h-10 sm:h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 xs:w-10 sm:w-12 h-8 xs:h-10 sm:h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs xs:text-sm sm:text-base">
              {getInitials(otherUser?.firstName, otherUser?.lastName)}
            </div>
          )}
        </div>

        {/* Infos utilisateur */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xs xs:text-sm sm:text-base text-gray-900 truncate">
            {otherUser?.firstName} {otherUser?.lastName}
          </h2>
          <p className="text-[10px] xs:text-xs sm:text-sm text-blue-600 truncate">
            {otherUser?.role === 'driver' ? 'Chauffeur' : 'Employeur'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Plus d'options">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Zone de messages - Scroll avec padding pour en-tête et footer */}
      <div 
        ref={messagesContainerRef}
        className="absolute top-[57px] xs:top-[65px] sm:top-[73px] bottom-[72px] xs:bottom-[80px] sm:bottom-[88px] left-0 right-0 overflow-y-auto p-2 xs:p-3 sm:p-4 space-y-3 xs:space-y-4 sm:space-y-6 bg-gray-50"
      >
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            {/* Séparateur de date - Sticky sous l'en-tête */}
            <div className="sticky top-0 z-10 flex items-center justify-center py-2">
              <div className="bg-white px-4 py-1 rounded-full shadow-md border border-gray-200">
                <span className="text-xs font-medium text-gray-600">{date}</span>
              </div>
            </div>

            {/* Messages du jour */}
            <div className="space-y-3">
              {msgs.map((message, index) => {
                // Extraire l'ID de l'expéditeur (peut être un objet ou un string)
                const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
                // Vérifier plusieurs formats d'ID possibles
                const isOwn = senderId === user.sub || senderId === user.id || senderId === user._id;
                const isSystem = message.type === 'system';

                if (isSystem) {
                  return (
                    <div key={message._id} className="flex justify-center">
                      <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs max-w-md text-center italic">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message._id}
                    className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar (seulement pour les messages reçus) */}
                    {!isOwn && (
                      <div className="flex-shrink-0 w-8 h-8">
                        {otherUser?.profilePhotoUrl ? (
                          <img
                            src={otherUser.profilePhotoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                            {getInitials(otherUser?.firstName, otherUser?.lastName)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bulle de message - Style Jumli */}
                    <div className={`
                      max-w-[90%] xs:max-w-[85%] sm:max-w-[70%] px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-2xl shadow-sm relative text-sm xs:text-base
                      ${isOwn 
                        ? 'bg-orange-500 text-white rounded-br-sm' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }
                    `}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div className={`
                        flex items-center gap-1 mt-1 text-xs
                        ${isOwn ? 'text-orange-100 justify-end' : 'text-gray-500'}
                      `}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwn && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Menu déroulant - Positionné sur la bulle */}
                      {showMenuForMessage === message._id && (
                        <div className={`absolute z-20 top-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] ${isOwn ? 'right-0' : 'left-0'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Supprimer ce message ? (uniquement pour vous)')) {
                                handleDeleteMessage(message._id);
                              } else {
                                setShowMenuForMessage(null);
                              }
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer pour moi
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bouton menu trois points */}
                    <div className={`flex-shrink-0 message-menu ${isOwn ? 'order-first' : 'order-last'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuForMessage(showMenuForMessage === message._id ? null : message._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                        title="Options"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie - Fixed en bas sur mobile, absolute sur desktop */}
      <div className="fixed lg:absolute bottom-0 left-0 right-0 z-20 p-2 xs:p-3 sm:p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 xs:gap-2 sm:gap-3">
          {/* Bouton pièce jointe (optionnel) */}
          <button
            type="button"
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Joindre un fichier"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Champ de texte */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsTyping(true);
              }}
              onBlur={() => setIsTyping(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                  setIsTyping(false);
                }
              }}
              placeholder="Tapez votre message..."
              rows={1}
              className="w-full px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none max-h-32"
              style={{ minHeight: '36px' }}
            />
          </div>

          {/* Bouton envoyer */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`
              flex-shrink-0 p-2 xs:p-2.5 sm:p-3 rounded-xl font-medium transition-all
              ${newMessage.trim() && !sending
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>

        {/* Indicateur de frappe (optionnel) */}
        <div className="mt-2 text-xs text-gray-500 h-4">
          {/* {isTyping && <span>{otherUser?.firstName} est en train d'écrire...</span>} */}
        </div>
      </div>
    </div>
  );
}
