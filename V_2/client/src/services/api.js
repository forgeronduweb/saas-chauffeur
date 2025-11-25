import axios from 'axios'
import { config } from '../config/env'
import logger from '../utils/logger.js'
import errorHandler from '../utils/errorHandler.js'

const API_BASE_URL = config.api.baseUrl
const API_URL = config.api.url

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes pour les images base64
  headers: { 'Content-Type': 'application/json' },
})

// Intercepteur de requête avec logging amélioré
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Marquer le début de la requête pour mesurer la performance
    config.metadata = { startTime: Date.now() }
    
    logger.debug('API Request started', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token
    })
    
    return config
  },
  (error) => {
    logger.error('API Request failed to start', { error })
    return Promise.reject(error)
  }
)

// Intercepteur de réponse avec logging et gestion d'erreur améliorés
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime
    
    logger.api(
      response.config.method,
      response.config.url,
      response.status,
      duration
    )
    
    return response
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    // Log l'erreur avec le nouveau système
    logger.api(
      error.config?.method || 'UNKNOWN',
      error.config?.url || 'UNKNOWN',
      error.response?.status || 0,
      duration,
      {
        message: error.message,
        data: error.response?.data
      }
    );
    
    // Gestion des erreurs 401 (non autorisé)
    if (error.response?.status === 401) {
      // Liste des routes publiques qui ne nécessitent pas de redirection
      const publicRoutes = ['/', '/auth', '/forgot-password', '/reset-password', 
                          '/offres', '/chauffeurs', '/marketing-vente', 
                          '/a-propos', '/contact', '/conditions', '/confidentialite'];
      const currentPath = window.location.pathname;
      
      // Ne pas rediriger si on est sur une route publique
      const isPublicRoute = publicRoutes.some(route => 
        route === currentPath || currentPath.startsWith(route + '/')
      );
      
      if (!isPublicRoute && 
          currentPath !== '/auth' && 
          !currentPath.startsWith('/auth/')) {
        // Sauvegarder l'URL actuelle pour rediriger après la connexion
        const redirectUrl = currentPath + window.location.search;
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        
        logger.info('Redirecting to auth due to 401', { 
          currentPath, 
          redirectUrl 
        });
        
        // Rediriger vers la page de connexion
        window.location.href = `/auth?redirect=${encodeURIComponent(redirectUrl)}`;
      }
    }
    
    // Gestion spéciale des erreurs réseau
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      logger.error('Network connection error', {
        message: 'Vérifiez votre connexion internet et que le serveur est démarré',
        error
      });
    }
    
    return Promise.reject(error)
  }
)

export const auth = {
  setToken: (token) => {
    localStorage.setItem('token', token)
    try { window.dispatchEvent(new Event('auth-changed')) } catch {}
  },
  getToken: () => localStorage.getItem('token'),
  clear: () => {
    localStorage.removeItem('token')
    try { window.dispatchEvent(new Event('auth-changed')) } catch {}
  },
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function getCurrentUserRole() {
  const token = auth.getToken()
  if (!token) return null
  const payload = parseJwt(token)
  return payload?.role || null
}

export const apiUtils = {
  getApiUrl: () => API_URL,
  getApiBaseUrl: () => API_BASE_URL,
  healthCheck: () => axios.get(`${API_URL}/health`),
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: async (payload) => {
    const res = await api.post('/auth/login', payload)
    const token = res?.data?.token
    if (token) auth.setToken(token)
    const role = getCurrentUserRole()
    return { token, role }
  },
  logout: () => auth.clear(),
  me: () => api.get('/auth/me'),
}

// API pour les chauffeurs
export const driversApi = {
  // Récupérer tous les chauffeurs (pour employeurs)
  list: () => api.get('/drivers'),
  // Récupérer les chauffeurs à proximité
  nearby: (params) => api.get('/drivers/nearby', { params }),
  // Récupérer le profil d'un chauffeur
  getProfile: (driverId) => api.get(`/drivers/${driverId}`),
  // Récupérer le profil du chauffeur connecté
  getMyProfile: () => api.get('/drivers/profile'),
  // Mettre à jour le profil du chauffeur connecté
  updateProfile: (driverId, data) => api.put('/drivers/profile', data),
  // Mettre à jour le profil avec fichier
  updateProfileWithFile: (driverId, formData) => {
    return api.put('/drivers/profile/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Mettre à jour le statut du chauffeur
  updateStatus: (driverId, status) => api.put(`/drivers/${driverId}/status`, { status }),
  // Mettre à jour la localisation
  updateLocation: (location) => api.put('/drivers/location', location),
}

// API pour les offres/missions
export const offersApi = {
  // Récupérer toutes les offres
  list: (params) => api.get('/offers', { params }),
  // Récupérer les offres de l'utilisateur connecté
  myOffers: () => api.get('/offers/my'),
  // Créer une nouvelle offre
  create: (data) => api.post('/offers', data),
  // Mettre à jour une offre
  update: (offerId, data) => api.put(`/offers/${offerId}`, data),
  // Supprimer une offre
  delete: (offerId) => api.delete(`/offers/${offerId}`),
  // Récupérer une offre spécifique
  getById: (offerId) => api.get(`/offers/${offerId}`),
}

// API pour les candidatures intelligentes
export const applicationsApi = {
  // Récupérer les candidatures pour une offre
  getForOffer: (offerId) => api.get(`/offers/${offerId}/applications`),
  // Récupérer les candidatures du chauffeur connecté
  myApplications: () => api.get('/applications/my'),
  // Récupérer les candidatures reçues par l'employeur
  receivedApplications: () => api.get('/applications/received'),
  
  // Postuler à une offre avec analyse intelligente
  apply: (offerId, data) => api.post(`/applications/${offerId}`, data),
  
  // Mettre à jour l'ID de conversation d'une candidature
  updateConversation: (applicationId, conversationId) => 
    api.patch(`/applications/${applicationId}/conversation`, { conversationId }),
  
  // Mettre à jour le statut d'une candidature avec workflow
  updateStatus: (applicationId, status, reason) => 
    api.patch(`/applications/${applicationId}/status`, { status, reason }),
  
  // Envoyer une proposition finale (employeur)
  sendFinalOffer: (applicationId, offerData) => 
    api.post(`/applications/${applicationId}/final-offer`, offerData),
  
  // Accepter une candidature (chauffeur)
  accept: (applicationId, reason) => 
    api.patch(`/applications/${applicationId}/status`, { status: 'accepted', reason }),
  
  // Refuser une candidature (chauffeur)
  reject: (applicationId, reason) => 
    api.patch(`/applications/${applicationId}/status`, { status: 'rejected', reason }),
  
  // Retirer une candidature (chauffeur)
  withdraw: (applicationId, reason) => 
    api.patch(`/applications/${applicationId}/status`, { status: 'withdrawn', reason }),
  
  // Répondre à une offre directe (accepter/refuser)
  respondToDirectOffer: (offerId, response, message) => 
    api.post(`/applications/direct-offer/${offerId}/respond`, { response, message }),
}

// API pour les missions
export const missionsApi = {
  // Récupérer toutes les missions
  list: (params) => api.get('/missions', { params }),
  // Récupérer les missions de l'utilisateur connecté
  myMissions: () => api.get('/missions/my'),
  // Créer une nouvelle mission
  create: (data) => api.post('/missions', data),
  // Mettre à jour une mission
  update: (missionId, data) => api.put(`/missions/${missionId}`, data),
  // Terminer une mission
  complete: (missionId, data) => api.put(`/missions/${missionId}/complete`, data),
}

// API pour les notifications
export const notificationsApi = {
  // Récupérer les notifications de l'utilisateur
  list: () => api.get('/notifications'),
  // Marquer une notification comme lue
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  // Marquer toutes les notifications comme lues
  markAllAsRead: () => api.put('/notifications/read-all'),
  // Supprimer une notification
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
}

// API pour les statistiques
export const statsApi = {
  // Statistiques publiques (pas d'authentification requise)
  public: () => api.get('/stats/public'),
  // Statistiques du dashboard employeur
  employerStats: () => api.get('/stats/employer'),
  // Statistiques du dashboard chauffeur
  driverStats: () => api.get('/stats/driver'),
  // Statistiques générales (alias pour compatibilité)
  general: () => api.get('/stats/public'),
}

// API pour les véhicules
export const vehiclesApi = {
  // Récupérer les véhicules du chauffeur connecté
  myVehicles: () => api.get('/vehicles/my'),
  // Ajouter un véhicule
  create: (data) => api.post('/vehicles', data),
  // Mettre à jour un véhicule
  update: (vehicleId, data) => api.put(`/vehicles/${vehicleId}`, data),
  // Supprimer un véhicule
  delete: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
}

// Service pour récupérer le nombre de chauffeurs
export const driversService = {
  getCount: () => api.get('/drivers/count'),
  getAll: () => api.get('/drivers/public'), // Route publique sans authentification
  getAllAdmin: () => api.get('/drivers'), // Route admin avec authentification
  getById: (driverId) => api.get(`/drivers/${driverId}`), // Récupérer un chauffeur spécifique
}

// Service pour le chat
export const chatService = {
  // Conversations
  getConversations: () => api.get('/chat/conversations'),
  createOrGetConversation: (targetUserId, context = {}) => 
    api.post('/chat/conversations', { targetUserId, context }),
  markConversationAsRead: (conversationId) => 
    api.put(`/chat/conversations/${conversationId}/read`),
  
  // Messages
  getMessages: (conversationId, page = 1, limit = 50) => 
    api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (conversationId, content, type = 'text', metadata = {}) => 
    api.post(`/chat/conversations/${conversationId}/messages`, { content, type, metadata }),
}

// API pour les messages (système complet)
export const messagesApi = {
  // Conversations
  createOrGetConversation: (participantId, context = {}) => 
    api.post('/messages/conversations', { participantId, context }),
  getConversations: () => api.get('/messages/conversations'),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  deleteConversation: (conversationId) => api.delete(`/messages/conversations/${conversationId}`),
  
  // Messages
  getMessages: (conversationId, page = 1, limit = 50) => 
    api.get(`/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),
  send: (data) => api.post(`/messages/conversations/${data.conversationId}/messages`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // Compteur non lus
  getUnreadCount: () => api.get('/messages/unread-count'),
}

// Service de recherche intelligente
export const searchService = {
  // Recherche globale avec fuzzy matching
  global: (query) => api.get('/search/global', { params: { query } }),
  // Recherche rapide pour suggestions
  quick: (query) => api.get('/search/quick', { params: { query } }),
}

// Service employeur
export const employerService = {
  // Créer ou mettre à jour le profil employeur
  createOrUpdateProfile: (data) => api.post('/employer/profile', data),
  // Récupérer le profil employeur
  getProfile: () => api.get('/employer/profile'),
  // Supprimer le profil employeur
  deleteProfile: () => api.delete('/employer/profile'),
  // Upload de documents
  uploadDocuments: (data) => api.post('/employer/documents', data),
}

// Service d'authentification (alias pour compatibilité)
export const authService = {
  getProfile: () => api.get('/auth/me'),
  login: (email, password) => authApi.login({ email, password }),
  register: (userData) => authApi.register(userData),
  logout: () => authApi.logout(),
  updateRole: (role) => api.put('/auth/me/role', { role }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  sendVerificationCode: (email) => api.post('/auth/send-verification-code', { email }),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  resendVerificationCode: (email) => api.post('/auth/resend-verification-code', { email }),
}

export default api
