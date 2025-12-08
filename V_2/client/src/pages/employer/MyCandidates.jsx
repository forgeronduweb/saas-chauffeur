import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import CustomDropdown from '../../component/common/CustomDropdown';
import { applicationsApi } from '../../services/api';

export default function MyCandidates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'employer') {
      navigate('/auth');
      return;
    }
    fetchCandidates();
  }, [user, navigate]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.receivedApplications();
      console.log('Candidatures reçues:', response.data);
      console.log('Premier candidat:', response.data[0]);
      
      // Transformer les données de l'API pour correspondre au format attendu
      const formattedCandidates = response.data.map(application => {
        return {
          id: application._id,
          driverId: application.driverProfileId || application.driver?.driverProfileId || application.driverId?._id || null,
          driverName: application.driver ? `${application.driver.firstName} ${application.driver.lastName}` : (application.driverId ? `${application.driverId.firstName} ${application.driverId.lastName}` : 'Chauffeur'),
          driverPhoto: application.driver?.profilePhotoUrl || application.driverId?.profilePhotoUrl || null,
          offerTitle: application.offer?.title || application.offerId?.title || 'Offre',
          appliedDate: application.createdAt || application.appliedDate,
          status: application.status, // pending, accepted, rejected
          experience: application.driver?.experience || application.driverId?.experience || 'Non spécifié',
          licenseType: application.driver?.licenseType || application.driverId?.licenseType || 'N/A',
          phone: application.driver?.phone || application.driverId?.phone || 'Non disponible'
        };
      });
      
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      // En cas d'erreur, afficher un tableau vide
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', color: 'bg-orange-50 text-orange-600 border border-orange-500' },
      accepted: { text: 'Acceptée', color: 'bg-orange-50 text-orange-600 border border-orange-500' },
      rejected: { text: 'Rejetée', color: 'bg-orange-50 text-orange-600 border border-orange-500' }
    };
    return badges[status] || badges.pending;
  };

  const filteredCandidates = filter === 'all' 
    ? candidates 
    : candidates.filter(c => c.status === filter);

  const handleAccept = async (candidateId) => {
    try {
      await applicationsApi.updateStatus(candidateId, 'accepted');
      // Rafraîchir la liste
      fetchCandidates();
      alert('Candidature acceptée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur lors de l\'acceptation de la candidature');
    }
  };

  const handleReject = async (candidateId) => {
    if (window.confirm('Êtes-vous sûr de vouloir refuser cette candidature ?')) {
      try {
        await applicationsApi.updateStatus(candidateId, 'rejected');
        // Rafraîchir la liste
        fetchCandidates();
        alert('Candidature rejetée');
      } catch (error) {
        console.error('Erreur lors du rejet:', error);
        alert('Erreur lors du rejet de la candidature');
      }
    }
  };

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
                  { value: 'all', label: `Toutes (${candidates.length})` },
                  { value: 'pending', label: `En attente (${candidates.filter(c => c.status === 'pending').length})` },
                  { value: 'accepted', label: `Acceptées (${candidates.filter(c => c.status === 'accepted').length})` },
                  { value: 'rejected', label: `Rejetées (${candidates.filter(c => c.status === 'rejected').length})` }
                ]}
              />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Gérez les candidatures reçues pour vos offres d'emploi</p>
        </div>

        {/* Liste des candidatures */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            
            <h3 className="text-2xl text-gray-900 mb-3">Aucune candidature</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore reçu de candidatures. Publiez des offres d'emploi attractives pour attirer les meilleurs chauffeurs.
            </p>
            
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((candidate) => {
              const badge = getStatusBadge(candidate.status);
              const cardClasses = "bg-white rounded-lg border border-gray-200 transition-all overflow-hidden";
              
              return (
                <div
                  key={candidate.id}
                  className={cardClasses}
                >
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Info candidat */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-500 text-sm sm:text-base">
                            {candidate.driverName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base text-gray-900 mb-1">
                            {candidate.driverName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed">
                            Candidature pour : <span className="text-gray-900">{candidate.offerTitle}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">Permis {candidate.licenseType}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">{candidate.experience}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status et actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs self-start ${badge.color}`}>
                          {badge.text}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {candidate.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleAccept(candidate.id)}
                                className="flex-1 sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                Accepter
                              </button>
                              <button 
                                onClick={() => handleReject(candidate.id)}
                                className="flex-1 sm:w-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {candidate.driverId ? (
                            <button 
                              onClick={() => navigate(`/driver/${candidate.driverId}`)}
                              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Voir profil
                            </button>
                          ) : (
                            <span className="w-full sm:w-auto px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-sm text-center">
                              Profil indisponible
                            </span>
                          )}
                        </div>
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
                <h3 className="text-base text-gray-900">Filtres</h3>
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
                  <label className="block text-xs text-gray-700 mb-1.5">
                    Statut
                  </label>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Toutes ({candidates.length})</option>
                    <option value="pending">En attente ({candidates.filter(c => c.status === 'pending').length})</option>
                    <option value="accepted">Acceptées ({candidates.filter(c => c.status === 'accepted').length})</option>
                    <option value="rejected">Rejetées ({candidates.filter(c => c.status === 'rejected').length})</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 pt-3">
                  <button 
                    onClick={() => setFilter('all')}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
