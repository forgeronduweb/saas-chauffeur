import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Lock, Mail, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminExists, setAdminExists] = useState(true)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Vérifier si un admin existe au chargement
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await api.get('/auth/admin-exists')
        setAdminExists(response.data.exists)
      } catch (error) {
        console.error('Erreur vérification admin:', error)
        setAdminExists(true)
      } finally {
        setCheckingAdmin(false)
      }
    }
    checkAdminExists()
  }, [])

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData)
      
      if (result.success) {
        toast.success('Connexion réussie !')
      } else {
        setError(result.error || 'Identifiants incorrects')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Une erreur technique est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setIsCreatingAdmin(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsCreatingAdmin(false)
      return
    }

    try {
      const response = await api.post('/auth/setup-first-admin', {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      
      toast.success('Compte admin créé ! Vous pouvez maintenant vous connecter.')
      setAdminExists(true)
      setFormData({ email: formData.email, password: '', confirmPassword: '' })
    } catch (error) {
      console.error('Erreur:', error)
      setError(error.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  if (isLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Carte de connexion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center border-b border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {adminExists ? 'Administration GoDriver' : 'Configuration initiale'}
            </h1>
            <p className="text-gray-500 text-sm">
              {adminExists 
                ? 'Connectez-vous pour accéder au panneau d\'administration'
                : 'Créez votre compte administrateur'
              }
            </p>
          </div>

          <div className="p-6">
            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Formulaire de création admin (si aucun admin n'existe) */}
            {!adminExists ? (
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
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
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
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
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full py-3 px-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingAdmin ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Créer le compte admin
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Formulaire de connexion */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
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
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
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
                      className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {adminExists 
                ? 'Accès réservé aux administrateurs GoDriver'
                : 'Ce formulaire disparaîtra après la création du compte'
              }
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} GoDriver. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}

export default Login
