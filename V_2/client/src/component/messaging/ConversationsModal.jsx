import React, { useState, useEffect } from 'react';
import { X, Search, MessageCircle, Clock } from 'lucide-react';
import { messagesApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

const ConversationsModal = ({ isOpen, onClose, onSelectConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      // L'API peut retourner response.data directement ou response.data.conversations
      const conversationsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.conversations || []);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    const currentUserId = user?._id;
    return conversation.participants?.find(p => p._id !== currentUserId);
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    if (!other) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const name = `${other.firstName || ''} ${other.lastName || ''}`.toLowerCase();
    const company = other.companyName?.toLowerCase() || '';
    
    return name.includes(searchLower) || company.includes(searchLower);
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - uniquement sur desktop */}
      <div 
        className="hidden lg:block fixed inset-0 bg-black/20 z-[60] pointer-events-none"
      />

      {/* Modal - À droite, au-dessus du chat */}
      <div className="fixed inset-0 lg:bottom-0 lg:right-4 lg:top-auto lg:left-auto w-full h-full lg:w-[360px] lg:h-[500px] lg:max-h-[calc(100vh-1rem)] bg-white lg:rounded-t-2xl shadow-2xl z-[9999] flex flex-col border-0 lg:border lg:border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Messagerie</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
              <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm text-center">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                if (!other) return null;

                const hasUnread = conversation.unreadCount > 0;
                const lastMessage = conversation.lastMessage;

                return (
                  <button
                    key={conversation._id}
                    onClick={() => onSelectConversation(conversation)}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex items-start space-x-3"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {other.profilePhotoUrl ? (
                        <img
                          src={other.profilePhotoUrl}
                          alt={`${other.firstName} ${other.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg">
                          {other.firstName?.[0]}{other.lastName?.[0]}
                        </div>
                      )}
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{conversation.unreadCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {other.firstName} {other.lastName}
                          </p>
                          {other.companyName && (
                            <p className="text-xs text-gray-500 truncate">{other.companyName}</p>
                          )}
                        </div>
                        {lastMessage && lastMessage.createdAt && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {(() => {
                              try {
                                const date = new Date(lastMessage.createdAt);
                                if (isNaN(date.getTime())) return '';
                                return formatDistanceToNow(date, { 
                                  addSuffix: true, 
                                  locale: fr 
                                });
                              } catch (error) {
                                return '';
                              }
                            })()}
                          </span>
                        )}
                      </div>
                      
                      {lastMessage && (
                        <p className={`text-xs truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationsModal;
