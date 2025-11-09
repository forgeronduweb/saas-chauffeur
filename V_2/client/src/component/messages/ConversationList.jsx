import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ConversationList({ conversations, selectedConversation, onSelectConversation, onRefresh }) {
  const formatTime = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return '';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="h-full bg-white relative">
      {/* En-tête fixe - Fixed sous le sous-header sur mobile, absolute sur desktop */}
      <div className="fixed top-[128px] lg:absolute lg:top-0 left-0 right-0 z-20 p-2 sm:p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-base text-gray-900">Messages</h2>
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Actualiser"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Liste des conversations - Scrollable avec padding pour l'en-tête */}
      <div className="absolute top-[57px] lg:top-[57px] bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const isSelected = selectedConversation?._id === conversation._id;
              const otherUser = conversation.otherParticipant;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`
                    w-full p-2 sm:p-3 text-left transition-colors hover:bg-gray-50 border-b border-gray-100
                    ${isSelected ? 'bg-orange-50' : ''}
                    ${hasUnread ? 'bg-blue-50/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar simplifié */}
                    <div className="flex-shrink-0 relative">
                      {otherUser?.profilePhotoUrl ? (
                        <img
                          src={otherUser.profilePhotoUrl}
                          alt={`${otherUser.firstName} ${otherUser.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium text-xs">
                          {getInitials(otherUser?.firstName, otherUser?.lastName)}
                        </div>
                      )}
                      {/* Point en ligne */}
                      {hasUnread && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Contenu simplifié */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h3 className={`font-medium text-sm truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {otherUser?.firstName} {otherUser?.lastName}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                        </span>
                      </div>

                      {/* Dernier message simplifié */}
                      {conversation.lastMessage && (
                        <p className={`text-xs truncate ${hasUnread ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                          {conversation.lastMessage.content}
                        </p>
                      )}

                      {/* Rôle et entreprise en une ligne */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {otherUser?.role === 'driver' ? 'Chauffeur' : 'Employeur'}
                        </span>
                        {otherUser?.companyName && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400 truncate">
                              {otherUser.companyName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
