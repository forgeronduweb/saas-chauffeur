import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    })
    
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network connectivity issue. Check if server is running and CORS is configured.')
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

// API pour les candidatures
export const applicationsApi = {
  // Récupérer les candidatures pour une offre
  getForOffer: (offerId) => api.get(`/offers/${offerId}/applications`),
  // Récupérer les candidatures du chauffeur connecté
  myApplications: () => api.get('/applications/my'),
  // Récupérer les candidatures reçues par l'employeur
  receivedApplications: () => api.get('/applications/received'),
  // Postuler à une offre
  apply: (offerId, data) => api.post(`/offers/${offerId}/apply`, data),
  // Accepter/refuser une candidature
  updateStatus: (applicationId, status) => api.put(`/applications/${applicationId}/status`, { status }),
  // Annuler une candidature (chauffeur)
  withdraw: (applicationId) => api.delete(`/applications/${applicationId}`),
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
  // Statistiques du dashboard employeur
  employerStats: () => api.get('/stats/employer'),
  // Statistiques du dashboard chauffeur
  driverStats: () => api.get('/stats/driver'),
  // Statistiques générales
  general: () => api.get('/stats/general'),
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

// API pour les messages (système simplifié)
export const messagesApi = {
  // Envoyer un message
  send: (data) => api.post('/messages/send', data),
  // Récupérer les conversations
  getConversations: () => api.get('/messages/conversations'),
  // Récupérer les messages d'une conversation
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages`),
  // Marquer une conversation comme lue
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
}

export default api


