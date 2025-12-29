import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import PublicHeader from '../component/common/PublicHeader';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread

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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Important</span>;
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.unread) {
      await markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres */}
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

        {/* Liste des notifications */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Vous serez notifié des mises à jour importantes ici
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
                  <div className="flex items-start gap-4">
                    {/* Indicateur non lu */}
                    <div className="pt-1.5">
                      {notification.unread ? (
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full block"></span>
                      ) : (
                        <span className="w-2.5 h-2.5 bg-gray-300 rounded-full block"></span>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {/* Action */}
                    {notification.actionText && (
                      <button className="px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-100 rounded transition-colors font-medium">
                        {notification.actionText}
                      </button>
                    )}
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
