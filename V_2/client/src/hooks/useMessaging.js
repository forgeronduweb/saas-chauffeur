import { useState, useEffect } from 'react';
import { messagesApi } from '../services/api';

/**
 * Hook personnalisé pour gérer la messagerie
 * 
 * Usage:
 * const { openMessaging, unreadCount } = useMessaging();
 * 
 * // Ouvrir la messagerie
 * openMessaging();
 * 
 * // Ouvrir directement une conversation
 * openMessaging(conversationId);
 */
export const useMessaging = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  };

  const openMessaging = (conversationId = null) => {
    // Émettre un événement personnalisé pour ouvrir la messagerie
    const event = new CustomEvent('openMessaging', { 
      detail: { conversationId } 
    });
    window.dispatchEvent(event);
  };

  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  return {
    unreadCount,
    openMessaging,
    refreshUnreadCount
  };
};
