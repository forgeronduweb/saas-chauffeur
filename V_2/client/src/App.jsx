import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PublicRoute from './component/PublicRoute'
import PrivateRoute from './component/PrivateRoute'
import ToastContainer from './components/common/Toast'
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
import NotificationsPage from './pages/NotificationsPage.jsx'
import AccountSuspendedPage from './pages/AccountSuspendedPage.jsx'
import MyCandidates from './pages/employer/MyCandidates.jsx'
import MyOffers from './pages/employer/MyOffers.jsx'
import MyProducts from './pages/employer/MyProducts.jsx'
import DriverMyProducts from './pages/driver/MyProducts.jsx'
import MyApplications from './pages/driver/MyApplications.jsx'
import TestNegotiation from './pages/TestNegotiation.jsx'
import Statistics from './pages/dashboard/Statistics.jsx'
import Earnings from './pages/dashboard/Earnings.jsx'

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

            {/* Page de détails offre publique (candidature nécessite connexion) */}
            <Route 
              path="/offre/:id" 
              element={<OfferDetailPage />} 
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

            {/* Page de détails produit publique (contact nécessite connexion) */}
            <Route 
              path="/produit/:id" 
              element={<ProductDetailPage />} 
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
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/compte-suspendu" element={<AccountSuspendedPage />} />
            
            {/* Pages d'inscription spécifiques */}
            <Route path="/inscription-chauffeur" element={<RoleSelection />} />
            <Route path="/inscription-employeur" element={<RoleSelection />} />
            
            {/* Pages avec redirections */}
            <Route path="/creer-offre" element={<CreateOfferPage />} />
            <Route path="/create-offer" element={<CreateOfferPage />} />
            <Route path="/chauffeurs" element={<DriversPage />} />
            
            {/* Pages avec alias pour le footer */}
            <Route 
              path="/mes-candidatures" 
              element={
                <PrivateRoute>
                  <MyApplications />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profil-chauffeur" 
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mes-offres" 
              element={
                <PrivateRoute>
                  <MyOffers />
                </PrivateRoute>
              } 
            />
            
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
            
            {/* Page de test pour la détection de négociation */}
            <Route 
              path="/test-negotiation" 
              element={<TestNegotiation />} 
            />
            
            {/* Pages dashboard */}
            <Route 
              path="/dashboard/statistics" 
              element={
                <PrivateRoute>
                  <Statistics />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/dashboard/earnings" 
              element={
                <PrivateRoute>
                  <Earnings />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
        
        {/* Composant Toast global pour les notifications */}
        <ToastContainer />
      </Router>
    </AuthProvider>
  )
}

export default App
