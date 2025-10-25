import { useState, useEffect, useCallback } from 'react';
import { 
  driversApi, 
  offersApi, 
  applicationsApi, 
  missionsApi, 
  notificationsApi, 
  statsApi,
  apiUtils
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useAppData = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // États pour les données
  const [drivers, setDrivers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});

  // Fonction générique pour gérer les appels API
  const handleApiCall = useCallback(async (apiCall, setter, errorMessage) => {
    try {
      setError(null);
      const response = await apiCall();
      setter(response.data);
      return response.data;
    } catch (err) {
      console.error(errorMessage, err);
      setError(err.response?.data?.error || errorMessage);
      throw err;
    }
  }, []);

  // Charger les chauffeurs disponibles
  const loadDrivers = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      setError(null);
      const response = await driversApi.list();
      // L'API retourne { drivers: [...], pagination: {...} }
      setDrivers(response.data.drivers || []);
      return response.data.drivers;
    } catch (err) {
      console.error('Erreur lors du chargement des chauffeurs', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des chauffeurs');
      throw err;
    }
  }, [isAuthenticated]);

  // Charger mes offres (pour employeurs)
  const loadMyOffers = useCallback(async () => {
    if (!isAuthenticated() || user?.role !== 'client') return;
    return handleApiCall(
      offersApi.myOffers,
      setMyOffers,
      'Erreur lors du chargement de vos offres'
    );
  }, [isAuthenticated, user, handleApiCall]);

  // Charger les offres disponibles (pour chauffeurs)
  const loadAvailableOffers = useCallback(async () => {
    if (!isAuthenticated() || user?.role !== 'driver') return;
    try {
      setError(null);
      const response = await offersApi.list({ status: 'active' });
      // L'API retourne { offers: [...], pagination: {...} }
      setAvailableOffers(response.data.offers || []);
      return response.data.offers;
    } catch (err) {
      console.error('Erreur lors du chargement des offres disponibles', err);
      // Ne pas définir d'erreur globale pour les offres, juste un tableau vide
      setAvailableOffers([]);
      console.warn('Offres non disponibles, continuons avec un tableau vide');
      return [];
    }
  }, [isAuthenticated, user]);

  // Charger mes candidatures (pour chauffeurs)
  const loadMyApplications = useCallback(async () => {
    if (!isAuthenticated() || user?.role !== 'driver') return;
    try {
      setError(null);
      const response = await applicationsApi.myApplications();
      setMyApplications(response.data || []);
      return response.data;
    } catch (err) {
      console.error('Erreur lors du chargement de vos candidatures', err);
      // Ne pas définir d'erreur globale pour les candidatures, juste un tableau vide
      setMyApplications([]);
      console.warn('Candidatures non disponibles, continuons avec un tableau vide');
      return [];
    }
  }, [isAuthenticated, user]);

  // Charger les candidatures reçues (pour employeurs)
  const loadReceivedApplications = useCallback(async () => {
    if (!isAuthenticated() || user?.role !== 'client') return;
    return handleApiCall(
      applicationsApi.receivedApplications,
      setReceivedApplications,
      'Erreur lors du chargement des candidatures reçues'
    );
  }, [isAuthenticated, user, handleApiCall]);

  // Charger mes missions
  const loadMyMissions = useCallback(async () => {
    if (!isAuthenticated()) return;
    return handleApiCall(
      missionsApi.myMissions,
      setMyMissions,
      'Erreur lors du chargement de vos missions'
    );
  }, [isAuthenticated, handleApiCall]);

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      setError(null);
      const response = await notificationsApi.list();
      // L'API retourne { notifications: [...], pagination: {...}, unreadCount: ... }
      setNotifications(response.data.notifications || []);
      return response.data.notifications;
    } catch (err) {
      console.error('Erreur lors du chargement des notifications', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des notifications');
      throw err;
    }
  }, [isAuthenticated]);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    if (!isAuthenticated()) return;
    const apiCall = user?.role === 'driver' ? statsApi.driverStats : statsApi.employerStats;
    return handleApiCall(
      apiCall,
      setStats,
      'Erreur lors du chargement des statistiques'
    );
  }, [isAuthenticated, user, handleApiCall]);

  // Vérifier la santé de l'API
  const checkApiHealth = useCallback(async () => {
    try {
      await apiUtils.healthCheck();
      return true;
    } catch (err) {
      console.error('API non disponible:', err);
      setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      return false;
    }
  }, []);

  // Charger toutes les données nécessaires
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null); // Reset error state
    
    // Vérifier d'abord la santé de l'API
    const isApiHealthy = await checkApiHealth();
    if (!isApiHealthy) {
      setLoading(false);
      return;
    }
    
    try {
      const promises = [
        loadNotifications(),
        loadStats(),
        loadMyMissions(),
      ];

      if (user?.role === 'client') {
        promises.push(loadDrivers(), loadMyOffers(), loadReceivedApplications());
      } else if (user?.role === 'driver') {
        promises.push(loadAvailableOffers(), loadMyApplications());
      }

      const results = await Promise.allSettled(promises);
      
      // Vérifier s'il y a des erreurs critiques
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} requêtes ont échoué lors du chargement des données`);
        // Ne pas définir d'erreur globale si seulement quelques requêtes échouent
        // L'utilisateur peut toujours utiliser l'application avec les données partielles
      }
    } catch (err) {
      console.error('Erreur critique lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated, 
    user, 
    checkApiHealth,
    loadNotifications, 
    loadStats, 
    loadMyMissions, 
    loadDrivers, 
    loadMyOffers, 
    loadAvailableOffers, 
    loadMyApplications,
    loadReceivedApplications
  ]);

  // Fonctions pour les actions
  const createOffer = useCallback(async (offerData) => {
    const response = await offersApi.create(offerData);
    await loadMyOffers(); // Recharger les offres
    return response.data;
  }, [loadMyOffers]);

  const applyToOffer = useCallback(async (offerId, applicationData) => {
    const response = await applicationsApi.apply(offerId, applicationData);
    await loadMyApplications(); // Recharger les candidatures
    return response.data;
  }, [loadMyApplications]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    await notificationsApi.markAsRead(notificationId);
    await loadNotifications(); // Recharger les notifications
  }, [loadNotifications]);

  const markAllNotificationsAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    await loadNotifications(); // Recharger les notifications
  }, [loadNotifications]);

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadAllData();
    }
  }, [isAuthenticated, user, loadAllData]);

  return {
    // États
    loading,
    error,
    drivers,
    myOffers,
    availableOffers,
    myApplications,
    receivedApplications,
    myMissions,
    notifications,
    stats,

    // Actions de chargement
    loadDrivers,
    loadMyOffers,
    loadAvailableOffers,
    loadMyApplications,
    loadReceivedApplications,
    loadMyMissions,
    loadNotifications,
    loadStats,
    loadAllData,
    checkApiHealth,

    // Actions de modification
    createOffer,
    applyToOffer,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Utilitaires
    refreshData: loadAllData,
    clearError: () => setError(null),
  };
};

export default useAppData;
