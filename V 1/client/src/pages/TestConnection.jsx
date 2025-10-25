import { useState } from 'react'
import { runConnectionTests } from '../utils/testConnection'

export default function TestConnection() {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRunTests = async () => {
    setIsLoading(true)
    try {
      const results = await runConnectionTests()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({
        error: error.message,
        tests: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '✗'
  }

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test de Connexion API
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Cette page permet de tester la connectivité entre le client et le serveur API.
              Utilisez-la pour diagnostiquer les problèmes de connexion.
            </p>
            
            <button
              onClick={handleRunTests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {isLoading ? 'Test en cours...' : 'Lancer les tests'}
            </button>
          </div>

          {testResults && (
            <div className="space-y-6">
              {/* Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">API URL:</span>
                    <div className="text-gray-600 break-all">{testResults.apiUrl}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">API Base URL:</span>
                    <div className="text-gray-600 break-all">{testResults.apiBaseUrl}</div>
                  </div>
                </div>
              </div>

              {/* Résultats des tests */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Résultats des Tests
                </h2>
                
                {testResults.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="text-red-800 font-medium">Erreur générale:</div>
                    <div className="text-red-600 text-sm mt-1">{testResults.error}</div>
                  </div>
                )}

                <div className="space-y-4">
                  {testResults.tests.map((test, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        test.status === 'success' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {getStatusIcon(test.status)} {test.name}
                        </h3>
                        <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                          {test.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">URL:</span> {test.url}
                      </div>

                      {test.status === 'success' && test.data && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Réponse:</div>
                          <pre className="bg-white border rounded p-2 text-xs overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {test.status === 'error' && test.error && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-red-700 mb-1">Erreur:</div>
                          <div className="bg-white border border-red-200 rounded p-2 text-xs">
                            <div><strong>Message:</strong> {test.error.message}</div>
                            {test.error.code && <div><strong>Code:</strong> {test.error.code}</div>}
                            {test.error.status && <div><strong>Status:</strong> {test.error.status}</div>}
                            {test.error.data && (
                              <div>
                                <strong>Data:</strong>
                                <pre className="mt-1">{JSON.stringify(test.error.data, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Résumé
                </h2>
                <div className="text-blue-800">
                  {testResults.tests.filter(t => t.status === 'success').length} / {testResults.tests.length} tests réussis
                </div>
                
                {testResults.tests.every(t => t.status === 'success') ? (
                  <div className="text-green-600 font-medium mt-2">
                    Tous les tests sont passés ! La connexion API fonctionne.
                  </div>
                ) : (
                  <div className="text-orange-600 font-medium mt-2">
                    Certains tests ont échoué. Vérifiez les erreurs ci-dessus.
                  </div>
                )}
              </div>

              {/* Conseils de dépannage */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                  Conseils de Dépannage
                </h2>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• Vérifiez que le serveur est déployé et en cours d'exécution</li>
                  <li>• Vérifiez les variables d'environnement CORS sur Render</li>
                  <li>• Vérifiez que les URLs dans .env.production sont correctes</li>
                  <li>• Consultez les logs du serveur sur Render pour plus de détails</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
