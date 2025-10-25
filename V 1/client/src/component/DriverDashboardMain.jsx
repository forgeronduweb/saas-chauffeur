import { useState, useEffect } from 'react';
import useAppData from '../hooks/useAppData';

// Import des composants du dashboard chauffeur
import DriverHeader from './driver/DriverHeader';
import DriverSidebar from './driver/DriverSidebar';
import DriverDashboard from './driver/DriverDashboard';
import AvailableOffers from './driver/AvailableOffers';
import MyApplications from './driver/MyApplications';
import DriverMissions from './driver/DriverMissions';
// import DriverPayments from './driver/DriverPayments'; // Paiements désactivés
import DriverNotifications from './driver/DriverNotifications';
import DriverSettings from './driver/DriverSettings';

export default function DriverDashboardMain() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Utilisation du hook pour les données dynamiques
  const {
    loading,
    error,
    availableOffers,
    myApplications,
    myMissions,
    notifications,
    stats,
    refreshData,
    clearError
  } = useAppData();

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error('Erreur dans le dashboard chauffeur:', error);
    }
  }, [error]);

  // Affichage d'erreur si nécessaire
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur Dashboard Chauffeur</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={refreshData}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Recharger la page
              </button>
              <button 
                onClick={clearError}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Continuer sans cette fonctionnalité
              </button>
              <button 
                onClick={() => {
                  console.log('Erreur détaillée:', error);
                  console.log('État complet:', { loading, availableOffers, myApplications, myMissions, notifications, stats });
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Afficher debug dans console
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paiements désactivés - gérés directement entre chauffeur et employeur


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DriverHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications || []}
        onNotificationClick={() => setActiveTab('notifications')}
        loading={loading}
      />

      <div className="flex pt-20">
        {/* Sidebar */}
        <DriverSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableOffers={availableOffers || []}
          myApplications={myApplications || []}
          activeMissions={myMissions || []}
          notifications={notifications || []}
        />

        {/* Contenu principal */}
        <main className="flex-1 ml-64 p-6">
          {/* Dashboard - Vue d'ensemble */}
          {activeTab === 'dashboard' && (
            <DriverDashboard 
              availableOffers={availableOffers || []}
              myApplications={myApplications || []}
              activeMissions={myMissions || []}
              notifications={notifications || []}
              stats={stats}
              loading={loading}
            />
          )}

          {/* Offres disponibles */}
          {activeTab === 'available-offers' && (
            <AvailableOffers 
              availableOffers={availableOffers || []} 
              loading={loading}
              refreshData={refreshData}
            />
          )}

          {/* Mes candidatures */}
          {activeTab === 'my-applications' && (
            <MyApplications 
              myApplications={myApplications || []} 
              loading={loading}
            />
          )}

          {/* Mes missions */}
          {activeTab === 'missions' && (
            <DriverMissions 
              activeMissions={myMissions || []} 
              loading={loading}
            />
          )}


          {/* Notifications */}
          {activeTab === 'notifications' && (
            <DriverNotifications 
              notifications={notifications || []} 
              loading={loading}
              onMarkAsRead={clearError}
            />
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <DriverSettings />
          )}
        </main>
      </div>
    </div>
  );
}
