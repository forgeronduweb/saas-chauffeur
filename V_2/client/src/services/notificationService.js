import { notificationsApi } from './api';

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
    this.isPolling = false;
    this.pollInterval = null;
  }

  // Ajouter un listener pour les nouvelles notifications
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier tous les listeners
  notifyListeners() {
    console.log('🔔 notifyListeners - Notification des', this.listeners.size, 'listeners avec', this.notifications.length, 'notifications');
    this.listeners.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Erreur dans le listener de notifications:', error);
      }
    });
  }

  // Démarrer le polling des notifications
  startPolling(interval = 30000) { // 30 secondes par défaut
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.fetchNotifications(); // Première récupération immédiate
    
    this.pollInterval = setInterval(() => {
      this.fetchNotifications();
    }, interval);
  }

  // Arrêter le polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  // Récupérer les notifications depuis l'API
  async fetchNotifications() {
    try {
      const response = await notificationsApi.list();
      const data = response.data;
      const newNotifications = data.notifications || [];
      
      // Vérifier s'il y a de nouvelles notifications
      const hasNewNotifications = this.hasNewNotifications(newNotifications);
      
      this.notifications = newNotifications;
      
      console.log('🔔 fetchNotifications - Notifications chargées:', newNotifications.length, 'non lues:', newNotifications.filter(n => n.unread).length);
      
      this.notifyListeners();
      
      // Afficher une notification browser si il y en a de nouvelles
      if (hasNewNotifications && 'Notification' in window) {
        this.showBrowserNotification(newNotifications);
      }
      
      return newNotifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  // Vérifier s'il y a de nouvelles notifications
  hasNewNotifications(newNotifications) {
    const currentUnreadCount = this.notifications.filter(n => n.unread).length;
    const newUnreadCount = newNotifications.filter(n => n.unread).length;
    return newUnreadCount > currentUnreadCount;
  }

  // Afficher une notification browser
  showBrowserNotification(notifications) {
    if (Notification.permission !== 'granted') return;
    
    const unreadNotifications = notifications.filter(n => n.unread);
    if (unreadNotifications.length === 0) return;
    
    const latestNotification = unreadNotifications[0];
    const title = this.getNotificationTitle(latestNotification.type);
    const body = latestNotification.title || latestNotification.message;
    
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'chauffeur-notification'
    });
    
    // Auto-fermer après 5 secondes
    setTimeout(() => notification.close(), 5000);
  }

  // Obtenir le titre de la notification selon le type
  getNotificationTitle(type) {
    switch (type) {
      case 'new_offer':
        return 'Nouvelle offre disponible';
      case 'urgent_offer':
        return 'Offre urgente !';
      case 'application_accepted':
        return 'Candidature acceptée';
      case 'application_rejected':
        return 'Candidature rejetée';
      case 'payment_received':
        return 'Paiement reçu';
      case 'mission_update':
        return 'Mission mise à jour';
      case 'mission_completed':
        return 'Mission terminée';
      case 'rating_received':
        return 'Nouvelle évaluation';
      case 'document_expiring':
        return 'Document bientôt expiré';
      case 'profile_validation':
        return 'Profil validé';
      default:
        return 'Nouvelle notification';
    }
  }

  // Demander la permission pour les notifications browser
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      console.log('🔔 Marquer notification comme lue:', notificationId);
      const response = await notificationsApi.markAsRead(notificationId);
      console.log('✅ Réponse API markAsRead:', response);
      
      // Recharger les notifications depuis le serveur pour synchroniser
      await this.fetchNotifications();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du marquage comme lu:', error);
      console.error('Détails:', error.response?.data || error.message);
      return false;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      console.log(' Marquer toutes les notifications comme lues');
      const response = await notificationsApi.markAllAsRead();
      console.log(' Réponse API markAllAsRead:', response);
      
      // Recharger les notifications depuis le serveur pour synchroniser
      await this.fetchNotifications();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de toutes comme lues:', error);
      console.error('Détails:', error.response?.data || error.message);
      return false;
    }
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount() {
    return this.notifications.filter(n => n.unread).length;
  }

  // Obtenir toutes les notifications
  getNotifications() {
    return this.notifications;
  }

  // Créer une notification de test (pour le développement)
  createTestNotification(type = 'new_offer') {
    const content = this.getTestNotificationContent(type);
    const testNotification = {
      id: Date.now().toString(),
      type: type,
      title: content.title,
      message: content.message,
      time: 'À l\'instant',
      unread: true,
      action: 'Voir les détails',
      hasApplied: content.hasApplied || false
    };
    
    this.notifications.unshift(testNotification);
    this.notifyListeners();
    this.showBrowserNotification([testNotification]);
  }

  // Contenu des notifications de test
  getTestNotificationContent(type) {
    const isAppliedRandomly = Math.random() > 0.5; // 50% de chance d'avoir déjà postulé
    
    switch (type) {
      case 'new_offer':
        return {
          title: 'Nouvelle offre : Chauffeur VTC - Abidjan',
          message: 'Une nouvelle offre correspond à votre profil. Salaire : 150,000 FCFA/mois',
          hasApplied: isAppliedRandomly
        };
      case 'urgent_offer':
        return {
          title: 'Offre urgente : Livraison express',
          message: 'Mission urgente disponible. Bonus de 50,000 FCFA. Répondez rapidement !',
          hasApplied: isAppliedRandomly
        };
      case 'application_accepted':
        return {
          title: 'Candidature acceptée',
          message: 'Votre candidature pour "Chauffeur personnel" a été acceptée !',
          hasApplied: true // Forcément déjà postulé si accepté
        };
      case 'payment_received':
        return {
          title: 'Paiement reçu',
          message: 'Vous avez reçu un paiement de 75,000 FCFA pour votre dernière mission'
        };
      case 'driver_profile_updated':
        return {
          title: 'Profil chauffeur mis à jour',
          message: 'Jean D. a mis à jour son profil. Consultez les nouvelles informations.'
        };
      default:
        return {
          title: 'Notification de test',
          message: 'Ceci est une notification de test'
        };
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();
export default notificationService;
