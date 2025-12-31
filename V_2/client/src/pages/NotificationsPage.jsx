import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import SimpleHeader from '../component/common/SimpleHeader';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, refresh } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => n.unread) 
    : notifications;

  const formatDate = (date) => {
    const notifDate = new Date(date);
    return notifDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enlever les emojis du texte
  const removeEmojis = (text) => {
    if (!text) return '';
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, '').trim();
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 Notification cliquée:', notification._id, notification.unread);
    if (notification.unread) {
      const result = await markAsRead(notification._id);
      console.log('🔔 Résultat markAsRead:', result);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log(' Bouton "Tout marquer comme lu" cliqué');
    const result = await markAllAsRead();
    console.log(' Résultat markAllAsRead:', result);
    // Forcer le rafraîchissement
    if (refresh) {
      console.log('Appel de refresh()');
      await refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === 'unread' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Chargement...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    notification.unread ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {notification.unread ? (
                        <span className="w-2 h-2 bg-orange-500 rounded-full block"></span>
                      ) : (
                        <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {removeEmojis(notification.title)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {removeEmojis(notification.message)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
