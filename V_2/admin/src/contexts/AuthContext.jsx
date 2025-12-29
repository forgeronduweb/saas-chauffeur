import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Ici, vous pourriez vérifier la validité du token avec l'API
      setIsAuthenticated(true)
      setUser({ email: 'admin@forgeron.dev', role: 'admin' })
    }
    setIsLoading(false)
  }

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      const response = await apiService.login(credentials)
      const { token, user } = response.data.data || response.data

      if (!token) throw new Error("Token d'authentification manquant")

      localStorage.setItem('admin_token', token)
      setIsAuthenticated(true)
      setUser(user || { email: credentials.email, role: 'admin' })
      toast.success('Connexion réussie !')
      return { success: true }
    } catch (error) {
      const apiMessage = error.response?.data?.error || error.response?.data?.message
      const message = apiMessage || error.message || 'Erreur de connexion'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      setIsAuthenticated(false)
      setUser(null)
      toast.success('Déconnexion réussie')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Déconnecter quand même localement
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
