// Utilitaire pour tester la connexion à l'API
import { apiUtils } from '../services/api.js'

export const testApiConnection = async () => {
  const results = {
    apiUrl: apiUtils.getApiUrl(),
    apiBaseUrl: apiUtils.getApiBaseUrl(),
    tests: []
  }

  console.log('🔍 Testing API connection...')
  console.log('API URL:', results.apiUrl)
  console.log('API Base URL:', results.apiBaseUrl)

  // Test 1: Health check
  try {
    console.log('📡 Testing health endpoint...')
    const healthResponse = await apiUtils.healthCheck()
    results.tests.push({
      name: 'Health Check',
      status: 'success',
      data: healthResponse.data,
      url: `${results.apiUrl}/health`
    })
    console.log('✅ Health check successful:', healthResponse.data)
  } catch (error) {
    results.tests.push({
      name: 'Health Check',
      status: 'error',
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      },
      url: `${results.apiUrl}/health`
    })
    console.error('❌ Health check failed:', error.message)
  }

  // Test 2: Debug config
  try {
    console.log('🔧 Testing debug config endpoint...')
    const configResponse = await fetch(`${results.apiUrl}/debug/config`)
    const configData = await configResponse.json()
    results.tests.push({
      name: 'Debug Config',
      status: 'success',
      data: configData,
      url: `${results.apiUrl}/debug/config`
    })
    console.log('✅ Debug config successful:', configData)
  } catch (error) {
    results.tests.push({
      name: 'Debug Config',
      status: 'error',
      error: {
        message: error.message,
        code: error.code
      },
      url: `${results.apiUrl}/debug/config`
    })
    console.error('❌ Debug config failed:', error.message)
  }

  // Test 3: CORS preflight
  try {
    console.log('🌐 Testing CORS preflight...')
    const corsResponse = await fetch(`${results.apiBaseUrl}/auth/me`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    })
    results.tests.push({
      name: 'CORS Preflight',
      status: 'success',
      data: {
        status: corsResponse.status,
        headers: Object.fromEntries(corsResponse.headers.entries())
      },
      url: `${results.apiBaseUrl}/auth/me`
    })
    console.log('✅ CORS preflight successful')
  } catch (error) {
    results.tests.push({
      name: 'CORS Preflight',
      status: 'error',
      error: {
        message: error.message,
        code: error.code
      },
      url: `${results.apiBaseUrl}/auth/me`
    })
    console.error('❌ CORS preflight failed:', error.message)
  }

  return results
}

// Fonction pour afficher les résultats de manière lisible
export const displayTestResults = (results) => {
  console.log('\n📊 API Connection Test Results:')
  console.log('================================')
  console.log(`API URL: ${results.apiUrl}`)
  console.log(`API Base URL: ${results.apiBaseUrl}`)
  console.log('\nTest Results:')
  
  results.tests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}:`)
    console.log(`   Status: ${test.status}`)
    console.log(`   URL: ${test.url}`)
    
    if (test.status === 'success') {
      console.log('   ✅ Success')
      if (test.data) {
        console.log('   Data:', test.data)
      }
    } else {
      console.log('   ❌ Error')
      console.log('   Error:', test.error)
    }
  })
  
  const successCount = results.tests.filter(t => t.status === 'success').length
  const totalCount = results.tests.length
  
  console.log(`\n📈 Summary: ${successCount}/${totalCount} tests passed`)
  
  if (successCount === totalCount) {
    console.log('🎉 All tests passed! API connection is working.')
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.')
  }
}

// Fonction pour exécuter les tests et afficher les résultats
export const runConnectionTests = async () => {
  try {
    const results = await testApiConnection()
    displayTestResults(results)
    return results
  } catch (error) {
    console.error('💥 Failed to run connection tests:', error)
    throw error
  }
}
