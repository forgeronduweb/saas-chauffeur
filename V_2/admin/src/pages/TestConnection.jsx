import { useState, useEffect } from 'react'
import { apiService, apiUtils } from '../services/api'

const TestConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [apiData, setApiData] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      setError(null)

      // Test de la santé de l'API
      const isAvailable = await apiUtils.isApiAvailable()
      console.log('API disponible:', isAvailable)

      if (!isAvailable) {
        throw new Error('API non disponible')
      }

      // Test des différentes routes
      const tests = {
        health: null,
        drivers: null,
        vehicles: null,
        rides: null,
        offers: null,
        applications: null,
        missions: null,
        notifications: null,
        stats: null
      }

      // Test health check
      try {
        const healthResponse = await apiService.healthCheck()
        tests.health = { status: 'success', data: healthResponse.data }
      } catch (err) {
        tests.health = { status: 'error', error: err.message }
      }

      // Test des routes principales
      const routes = [
        { name: 'drivers', method: apiService.getDrivers },
        { name: 'vehicles', method: apiService.getVehicles },
        { name: 'rides', method: apiService.getRides },
        { name: 'offers', method: apiService.getOffers },
        { name: 'applications', method: apiService.getApplications },
        { name: 'missions', method: apiService.getMissions },
        { name: 'notifications', method: apiService.getNotifications }
      ]

      for (const route of routes) {
        try {
          const response = await route.method()
          tests[route.name] = { 
            status: 'success', 
            data: response.data,
            count: Array.isArray(response.data) ? response.data.length : 1
          }
        } catch (err) {
          tests[route.name] = { status: 'error', error: err.message }
        }
      }

      // Test des statistiques (nécessite authentification)
      try {
        const statsResponse = await apiService.getGeneralStats()
        tests.stats = { status: 'success', data: statsResponse.data }
      } catch (err) {
        tests.stats = { status: 'error', error: err.message }
      }

      setApiData(tests)
      setConnectionStatus('success')

    } catch (err) {
      setError(err.message)
      setConnectionStatus('error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-orange-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Test de Communication API</h1>
        <p className="text-gray-600">
          Test de la communication entre l'admin et le serveur backend
        </p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>API URL:</strong> {apiUtils.getApiUrl()}
          </div>
          <div>
            <strong>API Base URL:</strong> {apiUtils.getApiBaseUrl()}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Statut de la connexion</h2>
          <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
            {getStatusIcon(connectionStatus)} {connectionStatus.toUpperCase()}
          </span>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Erreur:</strong> {error}
          </div>
        )}
      </div>

      {Object.keys(apiData).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Résultats des tests</h2>
          
          {Object.entries(apiData).map(([endpoint, result]) => (
            <div key={endpoint} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-lg capitalize">{endpoint}</h3>
                <span className={`font-medium ${getStatusColor(result.status)}`}>
                  {getStatusIcon(result.status)} {result.status}
                </span>
              </div>
              
              {result.error && (
                <div className="text-red-600 text-sm mb-2">
                  <strong>Erreur:</strong> {result.error}
                </div>
              )}
              
              {result.data && (
                <div className="text-sm text-gray-600">
                  {result.count !== undefined && (
                    <div><strong>Nombre d'éléments:</strong> {result.count}</div>
                  )}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-orange-600 hover:text-orange-700">
                      Voir les données
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          disabled={connectionStatus === 'testing'}
        >
          {connectionStatus === 'testing' ? 'Test en cours...' : 'Relancer le test'}
        </button>
      </div>
    </div>
  )
}

export default TestConnection
