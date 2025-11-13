import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import CustomDropdown from '../../component/common/CustomDropdown';
import { applicationsApi } from '../../services/api';

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
      console.log('Mes candidatures:', response.data);
      
      // Transformer les données de l'API pour correspondre au format attendu
      const formattedApplications = response.data.map(application => {
        // Formater la localisation
        let location = 'Non spécifié';
        if (application.offer?.location) {
          if (typeof application.offer.location === 'string') {
            location = application.offer.location;
          } else if (application.offer.location.city) {
            location = application.offer.location.city;
          }
        }
        
        return {
          id: application._id,
          offerId: application.offer?._id || application.offerId,
          offerTitle: application.offer?.title || 'Offre',
          company: application.offer?.employer?.companyName || application.offer?.employer?.firstName + ' ' + application.offer?.employer?.lastName || 'Employeur',
          location: location,
          salary: application.offer?.salary || '0',
          appliedDate: application.createdAt || application.appliedDate,
          status: application.status // pending, accepted, rejected
        };
      });
      
      setApplications(formattedApplications);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      // En cas d'erreur, afficher un tableau vide
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { text: 'Acceptée', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejetée', color: 'bg-red-100 text-red-800' }
    };
    return badges[status] || badges.pending;
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

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
              <CustomDropdown
                value={filter}
                onChange={setFilter}
                placeholder="Filtrer par statut"
                options={[
                  { value: 'all', label: `Toutes (${applications.length})` },
                  { value: 'pending', label: `En attente (${applications.filter(a => a.status === 'pending').length})` },
                  { value: 'accepted', label: `Acceptées (${applications.filter(a => a.status === 'accepted').length})` },
                  { value: 'rejected', label: `Rejetées (${applications.filter(a => a.status === 'rejected').length})` }
                ]}
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
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl text-gray-900 mb-3">Aucune candidature</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Commencez votre recherche d'emploi. Explorez les offres disponibles et postulez aux postes qui vous intéressent.
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
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((application) => {
              const badge = getStatusBadge(application.status);
              return (
                <div
                  key={application.id}
                  className="bg-white rounded-lg border border-gray-200 transition-all overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base sm:text-lg lg:text-xl text-gray-900 mb-1">{application.offerTitle}</h3>
                            <p className="text-sm sm:text-base text-gray-600 font-medium">{application.company}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {application.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {parseInt(application.salary).toLocaleString()} FCFA / mois
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Postulé le {new Date(application.appliedDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-2 sm:gap-3">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${badge.color} self-start lg:self-auto`}>
                          {badge.text}
                        </span>
                        <button 
                          onClick={() => navigate(`/offre/${application.offerId}`)}
                          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          Voir l'offre
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <option value="all">Toutes ({applications.length})</option>
                    <option value="pending">En attente ({applications.filter(a => a.status === 'pending').length})</option>
                    <option value="accepted">Acceptées ({applications.filter(a => a.status === 'accepted').length})</option>
                    <option value="rejected">Rejetées ({applications.filter(a => a.status === 'rejected').length})</option>
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
