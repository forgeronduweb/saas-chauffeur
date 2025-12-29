import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Car } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: 'bahophilomeevrard@gmail.com',
    password: 'Philome98@'
  })

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData)
      
      if (result.success) {
        toast.success('Connexion réussie !', {
          description: `Bienvenue dans l'administration`
        })
      } else {
        toast.error('Erreur de connexion', {
          description: result.error || 'Identifiants incorrects'
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur technique', {
        description: 'Une erreur technique est survenue. Veuillez réessayer.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-medium mb-2">
              <span className="text-gray-900">GoDriver</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium tracking-wide">ADMINISTRATION</p>
          </div>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 px-6 py-8 text-center">
            <h1 className="text-2xl font-medium text-white mb-2">
              Connexion Admin
            </h1>
            <p className="text-gray-300 text-sm">
              Accédez au panneau d'administration
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@godriver.com"
                  className="pl-10 pr-4 py-3 w-full rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-4 py-3 w-full rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-800 text-white font-medium rounded hover:bg-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2024 GoDriver. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}

export default Login
