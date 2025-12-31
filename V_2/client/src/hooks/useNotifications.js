import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mettre à jour l'état quand les notifications changent
  const handleNotificationsUpdate = useCallback((newNotifications) => {
    console.log('🔔 handleNotificationsUpdate - Mise à jour avec', newNotifications.length, 'notifications');
    const unreadCount = newNotifications.filter(n => n.unread).length;
    console.log('🔔 handleNotificationsUpdate - Nouveau compteur non lues:', unreadCount);
    setNotifications(newNotifications);
    setUnreadCount(unreadCount);
    setLoading(false);
    setError(null);
  }, []);

  // Initialiser les notifications
  useEffect(() => {
    let unsubscribe;

    const initializeNotifications = async () => {
      try {
        setLoading(true);
        
        // Demander la permission pour les notifications browser
        await notificationService.requestPermission();
        
        // S'abonner aux mises à jour
        unsubscribe = notificationService.addListener(handleNotificationsUpdate);
        
        // Démarrer le polling
        notificationService.startPolling();
        
        // Récupération initiale
        await notificationService.fetchNotifications();
      } catch (err) {
        console.error('Erreur lors de l\'initialisation des notifications:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeNotifications();

    // Nettoyage
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      notificationService.stopPolling();
    };
  }, [handleNotificationsUpdate]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (!success) {
        throw new Error('Impossible de marquer la notification comme lue');
      }
      return success;
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (!success) {
        throw new Error('Impossible de marquer toutes les notifications comme lues');
      }
      return success;
    } catch (err) {
      console.error('Erreur lors du marquage de toutes comme lues:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Actualiser manuellement les notifications
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await notificationService.fetchNotifications();
      // setLoading(false) sera appelé par handleNotificationsUpdate
    } catch (err) {
      console.error('Erreur lors de l\'actualisation:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Créer une notification de test (pour le développement)
  const createTestNotification = useCallback((type) => {
    notificationService.createTestNotification(type);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    createTestNotification
  };
}

export default useNotifications;
