import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './component/ProtectedRoute'
import PublicRoute from './component/PublicRoute'
import HeroSection from './component/hero.jsx'
import Auth from './component/Auth.jsx'
import EmployerDashboard from './component/EmployerDashboard.jsx'
import SafeDriverDashboard from './component/SafeDriverDashboard.jsx'
import ChauffeursPage from './pages/ChauffeursPage.jsx'
import EmployeursPage from './pages/EmployeursPage.jsx'
import CommentCaMarchePage from './pages/CommentCaMarchePage.jsx'
import TestAPI from './pages/TestAPI.jsx'
import TestConnection from './pages/TestConnection.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Page d'accueil - redirige vers dashboard si connecté */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <HeroSection />
                </PublicRoute>
              } 
            />
            
            {/* Page d'authentification - redirige vers dashboard si connecté */}
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />
            
            {/* Pages publiques */}
            <Route path="/chauffeurs" element={<ChauffeursPage />} />
            <Route path="/employeurs" element={<EmployeursPage />} />
            <Route path="/comment-ca-marche" element={<CommentCaMarchePage />} />
            
            {/* Dashboard employeur */}
            <Route 
              path="/employer-dashboard" 
              element={
                <ProtectedRoute requiredRole="client">
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard chauffeur */}
            <Route 
              path="/driver-dashboard" 
              element={
                <ProtectedRoute requiredRole="driver">
                  <SafeDriverDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Page de test API */}
            <Route path="/test-api" element={<TestAPI />} />
            
            {/* Page de test de connexion */}
            <Route path="/test-connection" element={<TestConnection />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
