import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiFilter } from 'react-icons/ci';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import ApplicationCard from '../../components/applications/ApplicationCard';
import CustomDropdown from '../../component/common/CustomDropdown';
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

  // Filtres avec tous les statuts
  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: 0,
      in_negotiation: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
      employer_rejected: 0
    };

    applications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec filtres */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Mes candidatures</h1>
            
            {/* Bouton filtres mobile */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <CiFilter className="w-6 h-6" />
            </button>
            
            {/* Dropdown filtres - Desktop uniquement */}
            <div className="hidden lg:block">
              <CustomDropdown
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: `Toutes (${statusCounts.all})` },
                  { value: 'pending', label: `En attente (${statusCounts.pending})` },
                  { value: 'in_negotiation', label: `En négociation (${statusCounts.in_negotiation})` },
                  { value: 'accepted', label: `Acceptées (${statusCounts.accepted})` },
                  { value: 'rejected', label: `Refusées (${statusCounts.rejected})` },
                  { value: 'withdrawn', label: `Retirées (${statusCounts.withdrawn})` },
                  { value: 'employer_rejected', label: `Rejetées (${statusCounts.employer_rejected})` }
                ]}
                placeholder="Filtrer par statut"
                className="w-64"
              />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Suivez l'état de vos candidatures aux offres d'emploi</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-gray-900 mb-3">
              Aucune candidature
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Vous n'avez pas encore postulé à des offres d'emploi.
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

        {/* Modal Filtres Mobile */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 sm:hidden">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            ></div>
            
            {/* Modal Content - Bottom sheet qui monte assez haut */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <span className="text-gray-900">Filtrer par statut</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Liste des options */}
              <div className="py-2">
                {[
                  { value: 'all', label: `Toutes (${statusCounts.all})` },
                  { value: 'pending', label: `En attente (${statusCounts.pending})` },
                  { value: 'in_negotiation', label: `En négociation (${statusCounts.in_negotiation})` },
                  { value: 'accepted', label: `Acceptées (${statusCounts.accepted})` },
                  { value: 'rejected', label: `Refusées (${statusCounts.rejected})` },
                  { value: 'withdrawn', label: `Retirées (${statusCounts.withdrawn})` },
                  { value: 'employer_rejected', label: `Rejetées (${statusCounts.employer_rejected})` }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowMobileFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      filter === option.value 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
