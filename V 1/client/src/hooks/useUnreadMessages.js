import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/api';

const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour calculer le nombre total de messages non lus
  const calculateUnreadCount = useCallback((conversationsList) => {
    console.log('🧮 Calcul du nombre de messages non lus pour:', conversationsList.length, 'conversations');
    const total = conversationsList.reduce((sum, conversation) => {
      const unread = conversation.unreadCount || 0;
      console.log(`📝 Conversation ${conversation._id}: ${unread} messages non lus`);
      return sum + unread;
    }, 0);
    console.log('📊 Total calculé:', total);
    setUnreadCount(total);
    return total;
  }, []);

  // Fonction pour charger les conversations et compter les non lus
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des conversations...');
      const response = await chatService.getConversations();
      const conversationsList = response.data || [];
      
      console.log('📨 Conversations reçues:', conversationsList);
      setConversations(conversationsList);
      const total = calculateUnreadCount(conversationsList);
      console.log('📊 Total messages non lus:', total);
      
      // Afficher une notification browser si il y a de nouveaux messages
      if (total > unreadCount && total > 0) {
        console.log('🔔 Nouveaux messages détectés, affichage notification');
        showBrowserNotification(total);
      }
      
      return conversationsList;
    } catch (err) {
      console.error('❌ Erreur lors du chargement des conversations:', err);
      setError(err.message || 'Erreur lors du chargement des messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, [calculateUnreadCount, unreadCount]);

  // Fonction pour afficher une notification browser
  const showBrowserNotification = useCallback((count) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = count === 1 ? 'Nouveau message' : `${count} nouveaux messages`;
      const body = count === 1 
        ? 'Vous avez reçu un nouveau message'
        : `Vous avez ${count} messages non lus`;
      
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'unread-messages',
        renotify: true,
        requireInteraction: false
      });

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Clic sur la notification pour ouvrir les messages
      notification.onclick = () => {
        window.focus();
        // Déclencher l'ouverture des messages
        window.dispatchEvent(new CustomEvent('openMessages'));
        notification.close();
      };
    }
  }, []);

  // Fonction pour demander la permission des notifications
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Fonction pour marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await chatService.markConversationAsRead(conversationId);
      
      // Mettre à jour localement
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        );
        calculateUnreadCount(updated);
        return updated;
      });
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, [calculateUnreadCount]);

  // Fonction pour actualiser manuellement
  const refresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  // Polling automatique toutes les 5 secondes pour une meilleure réactivité
  useEffect(() => {
    // Charger immédiatement
    loadConversations();

    // Demander la permission pour les notifications
    requestNotificationPermission();

    // Configurer le polling très fréquent pour les tests
    const interval = setInterval(() => {
      console.log('⏰ Polling automatique des messages...');
      loadConversations();
    }, 5000); // 5 secondes pour une meilleure réactivité

    // Écouter les événements de nouveaux messages
    const handleNewMessage = () => {
      console.log('📨 Événement newMessageReceived détecté');
      setTimeout(() => {
        loadConversations();
      }, 1000); // Délai pour laisser le temps au message d'être sauvegardé
    };

    const handleMessageSent = () => {
      console.log('📤 Événement newMessageSent détecté');
      setTimeout(() => {
        loadConversations();
      }, 500); // Délai plus court pour les messages envoyés
    };

    const handleConversationMarkedAsRead = () => {
      console.log('✅ Événement conversationMarkedAsRead détecté');
      setTimeout(() => {
        loadConversations();
      }, 200); // Délai très court pour la mise à jour immédiate
    };

    const handleForceRefresh = () => {
      console.log('🔄 Force refresh des messages non lus');
      loadConversations();
    };

    // Écouter les événements de focus de la fenêtre pour actualiser
    const handleWindowFocus = () => {
      console.log('👁️ Fenêtre mise au focus, actualisation des messages');
      loadConversations();
    };

    // Écouter les événements de visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👀 Page visible, actualisation des messages');
        loadConversations();
      }
    };

    window.addEventListener('newMessageReceived', handleNewMessage);
    window.addEventListener('newMessageSent', handleMessageSent);
    window.addEventListener('conversationMarkedAsRead', handleConversationMarkedAsRead);
    window.addEventListener('forceRefreshUnreadMessages', handleForceRefresh);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('newMessageReceived', handleNewMessage);
      window.removeEventListener('newMessageSent', handleMessageSent);
      window.removeEventListener('conversationMarkedAsRead', handleConversationMarkedAsRead);
      window.removeEventListener('forceRefreshUnreadMessages', handleForceRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadConversations, requestNotificationPermission]);

  // Fonction pour déclencher manuellement une notification de test
  const createTestNotification = useCallback(() => {
    showBrowserNotification(1);
  }, [showBrowserNotification]);

  // Fonction pour forcer une actualisation immédiate
  const forceRefresh = useCallback(() => {
    console.log('🔄 Actualisation forcée des messages');
    loadConversations();
  }, [loadConversations]);

  // Fonction pour tester le système de notifications
  const testNotificationSystem = useCallback(() => {
    console.log('🧪 Test du système de notifications');
    console.log('📊 Messages non lus actuels:', unreadCount);
    console.log('📨 Conversations:', conversations);
    showBrowserNotification(unreadCount || 1);
  }, [unreadCount, conversations, showBrowserNotification]);

  return {
    unreadCount,
    conversations,
    loading,
    error,
    markConversationAsRead,
    refresh,
    createTestNotification,
    requestNotificationPermission,
    loadConversations, // Exposer pour debug
    forceRefresh, // Nouvelle fonction
    testNotificationSystem // Nouvelle fonction
  };
};

export default useUnreadMessages;
