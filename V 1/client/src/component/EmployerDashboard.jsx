import { useState, useEffect } from 'react';
import useAppData from '../hooks/useAppData';
import useUnreadMessages from '../hooks/useUnreadMessages';

// Import des composants du dashboard
import Header from './dashboard/Header';
import Sidebar from './dashboard/Sidebar';
import Dashboard from './dashboard/Dashboard';
import DriverSearch from './dashboard/DriverSearch';
import MyOffers from './dashboard/MyOffers';
import Candidates from './dashboard/Candidates';
import Missions from './dashboard/Missions';
import Settings from './dashboard/Settings';
import EmployerProfile from './dashboard/EmployerProfile';
import Notifications from './dashboard/Notifications';
import MobileBottomNav from './mobile/MobileBottomNav';
import Chat from './chat/Chat';
import EmbeddedChat from './chat/EmbeddedChat';

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState('search-drivers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState(null);
  const [chatOtherParticipant, setChatOtherParticipant] = useState(null);
  
  // Hook pour gérer les messages non lus
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  
  // Utilisation du hook pour les données dynamiques
  const {
    loading,
    error,
    drivers: availableDrivers,
    myOffers,
    receivedApplications,
    myMissions,
    notifications,
    stats,
    refreshData,
    clearError
  } = useAppData();

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error('Erreur dans le dashboard:', error);
      // Vous pouvez ajouter ici une notification d'erreur
    }
  }, [error]);

  // Écouter les événements de création d'offre et de chat
  useEffect(() => {
    const handleOpenCreateOffer = (event) => {
      console.log('Événement openCreateOffer reçu:', event.detail);
      setActiveTab('my-offers');
      setShowCreateForm(true);
    };

    const handleChangeTab = (event) => {
      console.log('Événement changeTab reçu:', event.detail);
      setActiveTab(event.detail.tab);
      if (event.detail.showCreateForm) {
        setShowCreateForm(true);
      }
    };

    const handleOpenChat = (event) => {
      console.log('Événement openChat reçu:', event.detail);
      setChatConversationId(event.detail.conversationId);
      setChatOtherParticipant(event.detail.otherParticipant);
      setIsChatOpen(true);
    };

    const handleOpenMessages = () => {
      console.log('Événement openMessages reçu');
      setActiveTab('messages');
    };

    window.addEventListener('openCreateOffer', handleOpenCreateOffer);
    window.addEventListener('changeTab', handleChangeTab);
    window.addEventListener('openChat', handleOpenChat);
    window.addEventListener('openMessages', handleOpenMessages);

    return () => {
      window.removeEventListener('openCreateOffer', handleOpenCreateOffer);
      window.removeEventListener('changeTab', handleChangeTab);
      window.removeEventListener('openChat', handleOpenChat);
      window.removeEventListener('openMessages', handleOpenMessages);
    };
  }, []);

  // Gérer l'URL avec hash pour l'onglet
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== activeTab) {
      setActiveTab(hash);
      if (hash === 'my-offers') {
        // Vérifier s'il y a des données de recrutement
        const recruitData = localStorage.getItem('recruitmentData');
        if (recruitData) {
          setShowCreateForm(true);
        }
      }
    }
  }, [activeTab]);

  // Fonction appelée après création d'une offre
  const handleOfferCreated = (newOffer) => {
    console.log('Nouvelle offre créée:', newOffer);
    // Actualiser les données
    refreshData();
  };

  // Fonction pour gérer le clic sur le logo
  const handleLogoClick = () => {
    setActiveTab('search-drivers');
  };

  // Fonction pour gérer le clic sur "Mon profil"
  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  // Fonction pour gérer le clic sur "Paramètres"
  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  // Fonction pour gérer le clic sur "Messages" - Aller à l'onglet messages
  const handleMessagesClick = () => {
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications || []}
        onNotificationClick={() => setActiveTab('notifications')}
        onLogoClick={handleLogoClick}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
        onMessagesClick={handleMessagesClick}
        unreadMessagesCount={unreadMessagesCount}
        userRole="client"
        loading={loading}
      />

      <div className="flex pt-20">
        {/* Sidebar - Desktop uniquement */}
        <div className="hidden lg:block">
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            myOffers={myOffers || []}
            availableDrivers={availableDrivers || []}
            activeMissions={myMissions || []}
            receivedApplications={receivedApplications || []}
            unreadMessagesCount={unreadMessagesCount}
            onMessagesClick={handleMessagesClick}
          />
        </div>

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-6 pb-32 lg:pb-6">
          {/* Rechercher des chauffeurs */}
          {activeTab === 'search-drivers' && (
            <DriverSearch 
              availableDrivers={availableDrivers || []} 
              loading={loading}
              refreshData={refreshData}
            />
          )}

          {/* Mes annonces */}
          {activeTab === 'my-offers' && (
            <MyOffers 
              myOffers={myOffers || []}
              showCreateForm={showCreateForm}
              setShowCreateForm={setShowCreateForm}
              onOfferCreated={handleOfferCreated}
              loading={loading}
              refreshData={refreshData}
            />
          )}

          {/* Candidatures reçues */}
          {activeTab === 'candidates' && (
            <Candidates 
              receivedApplications={receivedApplications || []}
              loading={loading}
              refreshData={refreshData}
            />
          )}

          {/* Missions en cours */}
          {activeTab === 'missions' && (
            <Missions activeMissions={myMissions || []} loading={loading} />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Notifications 
              notifications={notifications || []} 
              loading={loading}
              onMarkAsRead={clearError}
            />
          )}

          {/* Profil */}
          {activeTab === 'profile' && (
            <EmployerProfile />
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <Settings />
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="h-[500px] lg:h-[600px]">
              <div className="bg-white rounded-lg shadow h-full flex flex-col">
                {/* Header de la messagerie */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Messagerie</h2>
                  <p className="text-sm text-gray-600">Vos conversations avec les chauffeurs</p>
                </div>
                
                {/* Contenu du chat intégré */}
                <div className="flex-1 flex">
                  <EmbeddedChat
                    initialConversationId={chatConversationId}
                    initialOtherParticipant={chatOtherParticipant}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Navigation mobile */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole="client"
        menuItems={[
          {
            id: 'search-drivers',
            label: 'Chauffeurs',
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            badge: availableDrivers?.length || 0
          },
          {
            id: 'my-offers',
            label: 'Annonces',
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            badge: myOffers?.length || 0
          },
          {
            id: 'candidates',
            label: 'Candidats',
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-3-3h-1m-1-3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM3 20v-2a7 7 0 017-7h1m7 0a7 7 0 017 7v2" />
              </svg>
            ),
            badge: receivedApplications?.filter(app => app.status === 'pending').length || 0
          },
          {
            id: 'missions',
            label: 'Missions',
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            ),
            badge: myMissions?.filter(m => m.status === 'active').length || 0
          }
        ]}
      />

      {/* Composant Chat */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialConversationId={chatConversationId}
        initialOtherParticipant={chatOtherParticipant}
      />
    </div>
  );
}
