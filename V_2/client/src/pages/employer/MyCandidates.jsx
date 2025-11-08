import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
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
        console.log('Application complète:', application);
        console.log('driverProfileId:', application.driverProfileId);
        console.log('driver.driverProfileId:', application.driver?.driverProfileId);
        console.log('driverId._id:', application.driverId?._id);
        
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
      pending: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { text: 'Acceptée', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejetée', color: 'bg-red-100 text-red-800' }
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
            
            {/* Filtres avec radio buttons - Cachés sur mobile */}
            <form className="hidden sm:inline-flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button 
                type="button"
                onClick={() => setFilter('all')}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded transition-all duration-200"
                title="Réinitialiser"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="filter" 
                  value="all"
                  checked={filter === 'all'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="peer sr-only"
                />
                <span className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 inline-block peer-checked:bg-orange-500 peer-checked:text-white peer-checked:shadow-sm hover:bg-gray-50">
                  Toutes ({candidates.length})
                </span>
              </label>
              
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="filter" 
                  value="pending"
                  checked={filter === 'pending'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="peer sr-only"
                />
                <span className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 inline-block peer-checked:bg-orange-500 peer-checked:text-white peer-checked:shadow-sm hover:bg-gray-50">
                  En attente ({candidates.filter(c => c.status === 'pending').length})
                </span>
              </label>
              
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="filter" 
                  value="accepted"
                  checked={filter === 'accepted'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="peer sr-only"
                />
                <span className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 inline-block peer-checked:bg-orange-500 peer-checked:text-white peer-checked:shadow-sm hover:bg-gray-50">
                  Acceptées ({candidates.filter(c => c.status === 'accepted').length})
                </span>
              </label>
              
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="filter" 
                  value="rejected"
                  checked={filter === 'rejected'}
                  onChange={(e) => setFilter(e.target.value)}
                  className="peer sr-only"
                />
                <span className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 inline-block peer-checked:bg-orange-500 peer-checked:text-white peer-checked:shadow-sm hover:bg-gray-50">
                  Rejetées ({candidates.filter(c => c.status === 'rejected').length})
                </span>
              </label>
            </form>
          </div>
          <p className="text-gray-600 text-sm">Gérez les candidatures reçues pour vos offres d'emploi</p>
        </div>

        {/* Liste des candidatures */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg text-gray-900 mb-2">Aucune candidature</h3>
            <p className="text-gray-600">Vous n'avez pas encore reçu de candidatures pour vos offres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((candidate) => {
              const badge = getStatusBadge(candidate.status);
              return (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg border border-gray-200 transition-all overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Info candidat */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-500 text-base sm:text-lg font-semibold">
                            {candidate.driverName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base lg:text-lg text-gray-900 mb-1">
                            {candidate.driverName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Candidature pour : <span className="font-medium text-gray-900">{candidate.offerTitle}</span>
                          </p>
                          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              Permis {candidate.licenseType}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {candidate.experience}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status et actions */}
                      <div className="flex flex-col lg:items-end gap-2 sm:gap-3">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${badge.color} self-start lg:self-auto`}>
                          {badge.text}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {candidate.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleAccept(candidate.id)}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium"
                              >
                                Accepter
                              </button>
                              <button 
                                onClick={() => handleReject(candidate.id)}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {candidate.driverId ? (
                            <button 
                              onClick={() => navigate(`/driver/${candidate.driverId}`)}
                              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                            >
                              Voir profil
                            </button>
                          ) : (
                            <span className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-xs sm:text-sm text-center">
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
