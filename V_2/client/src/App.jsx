import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PublicRoute from './component/PublicRoute'
import PrivateRoute from './component/PrivateRoute'
import HomePage from './pages/HomePage.jsx'
import DriversPage from './pages/DriversPage.jsx'
import DriverProfilePage from './pages/DriverProfilePage.jsx'
import OffersPage from './pages/OffersPage.jsx'
import OfferDetailPage from './pages/OfferDetailPage.jsx'
import CreateOfferPage from './pages/CreateOfferPage.jsx'
import MarketingVentePage from './pages/MarketingVentePage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import EditJobOfferPage from './pages/EditJobOfferPage.jsx'
import EditProductOfferPage from './pages/EditProductOfferPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import Auth from './component/Auth.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import RoleSelection from './pages/RoleSelection.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import VerifyEmailPage from './pages/VerifyEmailPage.jsx'
import TarifsPage from './pages/TarifsPage.jsx'
import DevenirPartenairePage from './pages/DevenirPartenairePage.jsx'
import FormationsPage from './pages/FormationsPage.jsx'
import CertificationsPage from './pages/CertificationsPage.jsx'
import CentreAidePage from './pages/CentreAidePage.jsx'
import ConditionsPage from './pages/ConditionsPage.jsx'
import ConfidentialitePage from './pages/ConfidentialitePage.jsx'
import AProposPage from './pages/AProposPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import MyCandidates from './pages/employer/MyCandidates.jsx'
import MyOffers from './pages/employer/MyOffers.jsx'
import MyProducts from './pages/employer/MyProducts.jsx'
import DriverMyProducts from './pages/driver/MyProducts.jsx'
import MyApplications from './pages/driver/MyApplications.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import TestNegotiation from './pages/TestNegotiation.jsx'
import TestDirectOffers from './pages/TestDirectOffers.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Page d'accueil publique */}
            <Route 
              path="/" 
              element={<HomePage />} 
            />

            {/* Page de recherche de chauffeurs */}
            <Route 
              path="/chauffeurs" 
              element={<DriversPage />} 
            />

            {/* Page de détails chauffeur protégée */}
            <Route 
              path="/driver/:id" 
              element={
                <PrivateRoute>
                  <DriverProfilePage />
                </PrivateRoute>
              } 
            />

            {/* Page des offres d'emploi publique */}
            <Route 
              path="/offres" 
              element={<OffersPage />} 
            />

            {/* Page de détails offre protégée */}
            <Route 
              path="/offre/:id" 
              element={
                <PrivateRoute>
                  <OfferDetailPage />
                </PrivateRoute>
              } 
            />

            {/* Page de création d'offre */}
            <Route 
              path="/publier-offre" 
              element={<CreateOfferPage />} 
            />

            {/* Page Marketing & Vente publique */}
            <Route 
              path="/marketing-vente" 
              element={<MarketingVentePage />} 
            />

            {/* Page de détails produit protégée */}
            <Route 
              path="/produit/:id" 
              element={
                <PrivateRoute>
                  <ProductDetailPage />
                </PrivateRoute>
              } 
            />

            {/* Page d'édition d'offre d'emploi */}
            <Route 
              path="/edit-job-offer/:id" 
              element={
                <PrivateRoute>
                  <EditJobOfferPage />
                </PrivateRoute>
              } 
            />

            {/* Page d'édition d'offre marketing/produit */}
            <Route 
              path="/edit-offer/:id" 
              element={
                <PrivateRoute>
                  <EditProductOfferPage />
                </PrivateRoute>
              } 
            />

            {/* Page d'authentification */}
            <Route 
              path="/auth" 
              element={<Auth />} 
            />
            
            {/* Callback Google OAuth */}
            <Route 
              path="/auth/callback" 
              element={<AuthCallback />} 
            />
            
            {/* Sélection de rôle après Google OAuth */}
            <Route 
              path="/role-selection" 
              element={<RoleSelection />} 
            />

            {/* Mot de passe oublié */}
            <Route 
              path="/forgot-password" 
              element={<ForgotPasswordPage />} 
            />

            {/* Réinitialisation du mot de passe */}
            <Route 
              path="/reset-password" 
              element={<ResetPasswordPage />} 
            />

            {/* Vérification d'email */}
            <Route 
              path="/verify-email" 
              element={<VerifyEmailPage />} 
            />

            {/* Page de profil utilisateur protégée */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              } 
            />
            
            {/* Pages publiques */}
            <Route path="/tarifs" element={<TarifsPage />} />
            <Route path="/devenir-partenaire" element={<DevenirPartenairePage />} />
            <Route path="/partenaire" element={<DevenirPartenairePage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/centre-aide" element={<CentreAidePage />} />
            <Route path="/aide" element={<CentreAidePage />} />
            <Route path="/conditions" element={<ConditionsPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/a-propos" element={<AProposPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Pages employeur protégées */}
            <Route 
              path="/employer/candidates" 
              element={
                <PrivateRoute>
                  <MyCandidates />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/offers" 
              element={
                <PrivateRoute>
                  <MyOffers />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/my-products" 
              element={
                <PrivateRoute>
                  <MyProducts />
                </PrivateRoute>
              } 
            />
            
            {/* Pages chauffeur protégées */}
            <Route 
              path="/driver/my-products" 
              element={
                <PrivateRoute>
                  <DriverMyProducts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/driver/applications" 
              element={
                <PrivateRoute>
                  <MyApplications />
                </PrivateRoute>
              } 
            />
            
            {/* Page de messagerie protégée (tous les utilisateurs) */}
            <Route 
              path="/messages" 
              element={
                <PrivateRoute>
                  <MessagesPage />
                </PrivateRoute>
              } 
            />
            
            {/* Page de test pour la détection de négociation */}
            <Route 
              path="/test-negotiation" 
              element={<TestNegotiation />} 
            />
            
            {/* Page de test pour les offres directes */}
            <Route 
              path="/test-direct-offers" 
              element={<TestDirectOffers />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
