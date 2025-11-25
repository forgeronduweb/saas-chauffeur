import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import ApplicationCard from '../../components/applications/ApplicationCard';
import { applicationsApi, messagesApi } from '../../services/api';

export default function MyApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/auth');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.myApplications();
      console.log('📋 Mes candidatures:', response.data);
      
      // Les données sont déjà dans le bon format grâce au nouveau contrôleur
      setApplications(response.data || []);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des candidatures:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des mises à jour de candidatures
  const handleApplicationUpdate = (updatedApplication) => {
    setApplications(prev => 
      prev.map(app => 
        app._id === updatedApplication._id ? updatedApplication : app
      )
    );
  };

  // Ouvrir la messagerie
  const handleOpenConversation = (conversationId) => {
    navigate(`/messages?conversation=${conversationId}`);
  };

  // Filtres avec tous les nouveaux statuts
  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      direct_offer: 0,
      pending: 0,
      in_negotiation: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      employer_rejected: 0
    };

    applications.forEach(app => {
      // Compter les offres directes
      if (app.status === 'direct_offer' || app.isDirectOffer) {
        counts.direct_offer++;
      } else if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(a => 
        filter === 'direct_offer' 
          ? a.status === 'direct_offer' || a.isDirectOffer 
          : a.status === filter
      );

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec filtres */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Mes candidatures</h1>
            
            {/* Bouton filtres mobile */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>
            
            {/* Dropdown personnalisé - Desktop uniquement */}
            <div className="hidden sm:block">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Toutes ({statusCounts.all})</option>
                <option value="direct_offer">Offres directes ({statusCounts.direct_offer})</option>
                <option value="pending">En attente ({statusCounts.pending})</option>
                <option value="in_negotiation">En négociation ({statusCounts.in_negotiation})</option>
                <option value="accepted">Acceptées ({statusCounts.accepted})</option>
                <option value="rejected">Refusées ({statusCounts.rejected})</option>
                <option value="withdrawn">Retirées ({statusCounts.withdrawn})</option>
                <option value="employer_rejected">Rejetées ({statusCounts.employer_rejected})</option>
              </select>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Suivez l'état de vos candidatures aux offres d'emploi</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl text-gray-900 mb-3">
              {filter === 'direct_offer' 
                ? 'Aucune offre directe pour le moment' 
                : 'Aucune candidature'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'direct_offer' 
                ? 'Les employeurs peuvent vous envoyer des offres directes qui apparaîtront ici.'
                : 'Commencez votre recherche d\'emploi. Explorez les offres disponibles et postulez aux postes qui vous intéressent.'}
            </p>
            <button
              onClick={() => navigate('/offres')}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Voir les offres disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                userRole="driver"
                onUpdate={handleApplicationUpdate}
                onOpenConversation={handleOpenConversation}
              />
            ))}
          </div>
        )}

        {/* Panneau filtres mobile */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 sm:hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filtres */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Statut
                  </label>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Toutes ({statusCounts.all})</option>
                    <option value="direct_offer">Offres directes ({statusCounts.direct_offer})</option>
                    <option value="pending">En attente ({statusCounts.pending})</option>
                    <option value="in_negotiation">En négociation ({statusCounts.in_negotiation})</option>
                    <option value="accepted">Acceptées ({statusCounts.accepted})</option>
                    <option value="rejected">Refusées ({statusCounts.rejected})</option>
                    <option value="withdrawn">Retirées ({statusCounts.withdrawn})</option>
                    <option value="employer_rejected">Rejetées ({statusCounts.employer_rejected})</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 pt-3">
                  <button 
                    onClick={() => setFilter('all')}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
