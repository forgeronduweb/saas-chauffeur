import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import TestConnection from './pages/TestConnection'
import DashboardPage from './pages/dashboard/DashboardPage'
import DriversPage from './pages/drivers/DriversPage'
import DriverDetailsPage from './pages/drivers/DriverDetailsPage'
import EmployersPage from './pages/employers/EmployersPage'
import EmployerDetailsPage from './pages/employers/EmployerDetailsPage'
import ApplicationsPage from './pages/applications/ApplicationsPage'
import ApplicationDetailsPage from './pages/applications/ApplicationDetailsPage'
import OffersPage from './pages/offers/OffersPage'
import OfferDetailsPage from './pages/offers/OfferDetailsPage'
import VehiclesManagement from './pages/VehiclesManagement'
import CreateVehicle from './pages/vehicles/CreateVehicle'
import EditVehicle from './pages/vehicles/EditVehicle'
import MissionsPage from './pages/missions/MissionsPage'
import ProductsPage from './pages/products/ProductsPage'
import BannersPage from './pages/banners/BannersPage'
import ReportsPage from './pages/reports/ReportsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Gestion des Chauffeurs */}
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/drivers/:driverId" element={<DriverDetailsPage />} />
              <Route path="/drivers-validation" element={<DriversPage />} />
              
              {/* Gestion des Employeurs */}
              <Route path="/employers" element={<EmployersPage />} />
              <Route path="/employers/:employerId" element={<EmployerDetailsPage />} />
              
              {/* Gestion des Candidatures */}
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:applicationId" element={<ApplicationDetailsPage />} />
              
              {/* Gestion des Offres */}
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offers/:id" element={<OfferDetailsPage />} />
              <Route path="/offers-moderation" element={<OffersPage />} />
              
              {/* Gestion des Véhicules */}
              <Route path="/vehicles" element={<VehiclesManagement />} />
              <Route path="/vehicles/create" element={<CreateVehicle />} />
              <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
              
              {/* Gestion des Missions */}
              <Route path="/missions" element={<MissionsPage />} />
              
              {/* Gestion des Produits */}
              <Route path="/products" element={<ProductsPage />} />
              
              {/* Gestion des Bannières */}
              <Route path="/banners" element={<BannersPage />} />
              
              {/* Gestion des Signalements */}
              <Route path="/reports" element={<ReportsPage />} />
              
              {/* Autres pages */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/test-connection" element={<TestConnection />} />
              
              {/* Pages futures */}
              <Route path="/transactions" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Gestion Financière
                  </h2>
                  <p className="text-gray-600">
                    Transactions et commissions - À venir
                  </p>
                </div>
              } />
              
              <Route path="/support" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Support Client
                  </h2>
                  <p className="text-gray-600">
                    Gestion des tickets - À venir
                  </p>
                </div>
              } />
              
              <Route path="/platform-config" element={
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Configuration
                  </h2>
                  <p className="text-gray-600">
                    Paramètres de la plateforme - À venir
                  </p>
                </div>
              } />
            </Route>
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Notifications Toast */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
