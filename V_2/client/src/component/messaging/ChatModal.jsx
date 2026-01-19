import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { messagesApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

const ChatModal = ({ isOpen, conversation, onClose, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Vérifier si la conversation est en mode "no reply" (message admin sans réponse possible)
  const isNoReply = conversation?.metadata?.noReply || 
                    conversation?.metadata?.get?.('noReply') ||
                    (typeof conversation?.metadata === 'object' && conversation?.metadata?.noReply);
  
  // Essayer différentes sources pour l'ID
  const currentUserId = user?._id || user?.id || user?.userId || localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen && conversation) {
      loadMessages();
      markAsRead();
      // Auto-refresh toutes les 5 secondes
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation?._id) {
      console.log('❌ Conversation ID manquant:', conversation);
      return;
    }
    
    console.log('🔍 Chargement messages pour conversation:', conversation._id);
    console.log('🔍 Conversation complète:', conversation);
    
    try {
      const response = await messagesApi.getMessages(conversation._id);
      console.log('📬 Réponse API messages:', response);
      
      // L'API peut retourner response.data directement ou response.data.messages
      const messagesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.messages || []);
      
      console.log('📬 Messages parsés:', messagesData);
      setMessages(messagesData);
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
      console.error('❌ Détails erreur:', error.response?.data);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversation?._id) return;
    
    try {
      await messagesApi.markAsRead(conversation._id);
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    
    try {
      setSending(true);
      setNewMessage(''); // Vider le champ immédiatement pour une meilleure UX
      
      const response = await messagesApi.send({
        conversationId: conversation._id,
        content: messageContent
      });
      
      console.log('Réponse envoi message:', response);
      
      // L'API peut retourner response.data directement ou response.data.message
      const newMsg = response.data?.message || response.data;
      
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
      } else {
        // Si pas de message retourné, recharger tous les messages
        await loadMessages();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      console.error('Détails:', error.response?.data || error.message);
      // Remettre le message dans le champ en cas d'erreur
      setNewMessage(messageContent);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = () => {
    return conversation?.participants?.find(p => p._id !== currentUserId);
  };

  if (!isOpen || !conversation) return null;

  const other = getOtherParticipant();

  return (
    <>
      {/* Overlay - uniquement sur desktop */}
      <div 
        className="hidden lg:block fixed inset-0 bg-black/20 z-[70] pointer-events-none"
      />

      {/* Modal - Mobile: plein écran | Desktop: à gauche de la modale des conversations */}
      <div className={`fixed inset-0 lg:right-[380px] lg:left-auto lg:top-auto w-full h-full bg-white lg:rounded-t-2xl shadow-2xl z-[10000] lg:z-[9998] flex flex-col border-0 lg:border lg:border-gray-200 transition-all duration-300 ${
        isMinimized ? 'lg:bottom-0 lg:w-[320px] lg:h-[60px]' : 'lg:bottom-0 lg:w-[400px] lg:h-[500px] lg:max-h-[calc(100vh-1rem)]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Avatar */}
            {other?.profilePhotoUrl ? (
              <img
                src={other.profilePhotoUrl}
                alt={`${other.firstName} ${other.lastName}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {other?.firstName?.[0]}{other?.lastName?.[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {other?.firstName} {other?.lastName}
              </h3>
              {other?.companyName && (
                <p className="text-xs text-gray-500 truncate">{other.companyName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-gray-700" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-700" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">Aucun message pour le moment</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    // Gérer le cas où senderId peut être un objet ou une chaîne
                    const messageSenderId = typeof message.senderId === 'object' 
                      ? message.senderId?._id 
                      : message.senderId;
                    
                    // Convertir en string pour comparaison fiable
                    const senderIdStr = String(messageSenderId || '');
                    const currentUserIdStr = String(currentUserId || '');
                    const isOwn = senderIdStr === currentUserIdStr;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          {/* Carte produit si métadonnées présentes */}
                          {(() => {
                            // MongoDB Map est converti en objet par Mongoose avec .lean()
                            const metadata = message.metadata;
                            
                            if (!metadata) return null;
                            
                            // Log pour déboguer
                            console.log('🔍 Message ID:', message._id);
                            console.log('🔍 Metadata complet:', metadata);
                            console.log('🔍 Type de metadata:', typeof metadata);
                            console.log('🔍 Keys:', Object.keys(metadata || {}));
                            
                            // Fonction helper pour extraire la valeur (Map ou objet)
                            const getValue = (key) => {
                              if (metadata instanceof Map) {
                                return metadata.get(key);
                              }
                              return metadata[key];
                            };
                            
                            const productImage = getValue('productImage');
                            const productTitle = getValue('productTitle');
                            const productPrice = getValue('productPrice');
                            const productUrl = getValue('productUrl');
                            
                            console.log('🖼️ Product Image:', productImage);
                            console.log('📝 Product Title:', productTitle);
                            console.log('💰 Product Price:', productPrice);
                            console.log('🔗 Product URL:', productUrl);
                            
                            if (!productImage && !productTitle) return null;
                            
                            return (
                              <div className={`mb-2 rounded-lg overflow-hidden border ${
                                isOwn ? 'border-orange-300' : 'border-gray-200'
                              }`}>
                                <a 
                                  href={productUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    if (!productUrl) e.preventDefault();
                                  }}
                                >
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={productTitle || 'Produit'}
                                      className="w-full h-32 object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="p-2 bg-white">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {productTitle || 'Produit'}
                                    </p>
                                    {productPrice && (
                                      <p className="text-xs font-semibold text-green-600 mt-1">
                                        {Number(productPrice).toLocaleString()} FCFA
                                      </p>
                                    )}
                                    {productUrl && (
                                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Voir le produit
                                      </p>
                                    )}
                                  </div>
                                </a>
                              </div>
                            );
                          })()}
                          
                          {/* Bulle de message */}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-orange-500 text-white rounded-br-none'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {(() => {
                              try {
                                const date = new Date(message.createdAt);
                                if (isNaN(date.getTime())) return 'À l\'instant';
                                return formatDistanceToNow(date, {
                                  addSuffix: true,
                                  locale: fr
                                });
                              } catch (error) {
                                return 'À l\'instant';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {isNoReply ? (
              <div className="p-4 border-t border-gray-200 bg-gray-100">
                <div className="flex items-center justify-center py-3 text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Cette conversation n'accepte pas de réponse</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Écrivez votre message..."
                    rows="2"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatModal;
