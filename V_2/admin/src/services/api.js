import axios from 'axios'

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log('API Request:', config.method?.toUpperCase(), config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log('API Response:', response.status, response.data)
    }
    return response
  },
  (error) => {
    // Rediriger vers la page de connexion si non autorisé
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Services API
export const apiService = {
  // Authentification
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  logout: () => {
    localStorage.removeItem('admin_token')
    return Promise.resolve()
  },

  // Véhicules (pour l'admin)
  getVehicles: () => api.get('/vehicles'),
  getVehicle: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

  // Missions (pour l'admin)
  getMissions: () => api.get('/missions'),
  getMission: (id) => api.get(`/missions/${id}`),
  updateMission: (id, data) => api.put(`/missions/${id}`, data),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // Santé de l'API
  healthCheck: () => axios.get(`${API_URL}/health`),

  // Routes Admin
  // Dashboard
  getAdminDashboard: () => api.get('/admin/dashboard/stats'),
  
  // Gestion des chauffeurs admin
  getAdminDrivers: (params = {}) => api.get('/admin/drivers', { params }),
  updateDriverStatus: (driverId, data) => api.put(`/admin/drivers/${driverId}/status`, data),
  sendNotificationToDriver: (driverId, data) => api.post(`/admin/drivers/${driverId}/notify`, data),
  
  // Gestion des employeurs admin
  getAdminEmployers: (params = {}) => api.get('/admin/employers', { params }),
  updateEmployerStatus: (employerId, data) => api.put(`/admin/employers/${employerId}/status`, data),
  
  // Gestion des candidatures admin
  getAdminApplications: (params = {}) => api.get('/admin/applications', { params }),
  
  // Gestion des missions admin
  getMissions: (params = {}) => api.get('/admin/missions', { params }),
  
  // Gestion des véhicules admin
  getVehicles: (params = {}) => api.get('/admin/vehicles', { params }),
  
  // Gestion des offres admin
  getAdminOffers: (params = {}) => api.get('/admin/offers', { params }),
  getAdminOffer: (offerId) => api.get(`/admin/offers/${offerId}`),
  moderateOffer: (offerId, data) => api.put(`/admin/offers/${offerId}/moderate`, data),
  
  // Gestion des transactions
  getAdminTransactions: (params = {}) => api.get('/admin/transactions', { params }),
  
  // Gestion des tickets de support
  getAdminTickets: (params = {}) => api.get('/admin/tickets', { params }),
  assignTicket: (ticketId, data) => api.put(`/admin/tickets/${ticketId}/assign`, data),
  
  // Configuration de la plateforme
  getPlatformConfigs: (params = {}) => api.get('/admin/configs', { params }),
  updatePlatformConfig: (configId, data) => api.put(`/admin/configs/${configId}`, data),

  // Gestion des signalements
  getReports: (params = {}) => api.get('/reports', { params }),
  getReportsPendingCount: () => api.get('/reports/pending-count'),
  updateReportStatus: (reportId, data) => api.put(`/reports/${reportId}`, data),
}

// Utilitaires
export const apiUtils = {
  isApiAvailable: async () => {
    try {
      await apiService.healthCheck()
      return true
    } catch (error) {
      console.error('API non disponible:', error.message)
      return false
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token')
  },

  getApiUrl: () => API_URL,
  getApiBaseUrl: () => API_BASE_URL,
}

export default api
