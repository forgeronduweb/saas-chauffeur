import { useState, useEffect } from 'react';

export default function TestAPI() {
  const [results, setResults] = useState({
    envVars: {},
    apiTest: null,
    loading: false
  });

  useEffect(() => {
    // Récupérer les variables d'environnement
    const envVars = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV
    };
    
    setResults(prev => ({ ...prev, envVars }));
  }, []);

  const testAPI = async () => {
    setResults(prev => ({ ...prev, loading: true, apiTest: null }));
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    try {
      console.log('Testing API:', `${apiUrl}/health`);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        loading: false,
        apiTest: {
          success: true,
          status: response.status,
          data: data,
          url: `${apiUrl}/health`
        }
      }));
      
    } catch (error) {
      console.error('API Test Error:', error);
      
      setResults(prev => ({
        ...prev,
        loading: false,
        apiTest: {
          success: false,
          error: error.message,
          url: `${apiUrl}/health`
        }
      }));
    }
  };

  const testLogin = async () => {
    setResults(prev => ({ ...prev, loading: true }));
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loginIdentifier: 'test@test.com',
          password: 'wrongpassword'
        })
      });
      
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        loading: false,
        loginTest: {
          success: response.ok,
          status: response.status,
          data: data,
          url: `${apiBaseUrl}/auth/login`
        }
      }));
      
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        loginTest: {
          success: false,
          error: error.message,
          url: `${apiBaseUrl}/auth/login`
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test API Configuration</h1>
        
        {/* Variables d'environnement */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Variables d'environnement</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            {Object.entries(results.envVars).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="text-blue-600">{key}:</span> 
                <span className="ml-2">{value?.toString() || 'undefined'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Health Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Health Check</h2>
          <button
            onClick={testAPI}
            disabled={results.loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {results.loading ? 'Test en cours...' : 'Tester /health'}
          </button>
          
          {results.apiTest && (
            <div className="mt-4 p-4 rounded bg-gray-100">
              <div className="mb-2">
                <strong>URL testée:</strong> {results.apiTest.url}
              </div>
              {results.apiTest.success ? (
                <div className="text-green-600">
                  <strong>Succès</strong> (Status: {results.apiTest.status})
                  <pre className="mt-2 text-sm">{JSON.stringify(results.apiTest.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>Erreur:</strong> {results.apiTest.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Login */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Login Endpoint</h2>
          <button
            onClick={testLogin}
            disabled={results.loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {results.loading ? 'Test en cours...' : 'Tester /auth/login'}
          </button>
          
          {results.loginTest && (
            <div className="mt-4 p-4 rounded bg-gray-100">
              <div className="mb-2">
                <strong>URL testée:</strong> {results.loginTest.url}
              </div>
              {results.loginTest.success ? (
                <div className="text-green-600">
                  <strong>Endpoint accessible</strong> (Status: {results.loginTest.status})
                </div>
              ) : (
                <div className={results.loginTest.status === 401 ? "text-orange-600" : "text-red-600"}>
                  <strong>{results.loginTest.status === 401 ? 'Endpoint accessible (erreur d\'auth normale)' : 'Erreur:'}</strong> 
                  {results.loginTest.error || `Status ${results.loginTest.status}`}
                </div>
              )}
              {results.loginTest.data && (
                <pre className="mt-2 text-sm">{JSON.stringify(results.loginTest.data, null, 2)}</pre>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Instructions</h2>
          <div className="text-yellow-700 space-y-2">
            <p>1. Vérifiez que les variables d'environnement sont correctes</p>
            <p>2. Testez le health check pour vérifier la connexion au serveur</p>
            <p>3. Testez le login endpoint pour vérifier les routes API</p>
            <p>4. Si tout fonctionne ici mais pas sur Render, le problème vient des variables d'environnement sur Render</p>
          </div>
        </div>
      </div>
    </div>
  );
}
