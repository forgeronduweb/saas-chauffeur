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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 mt-2">Gérez les candidatures reçues pour vos offres d'emploi</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({candidates.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente ({candidates.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'accepted'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acceptées ({candidates.filter(c => c.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'rejected'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejetées ({candidates.filter(c => c.status === 'rejected').length})
            </button>
          </div>
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
      </main>
    </div>
  );
}
