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

      <main className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base lg:text-lg text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 text-sm">Gérez les candidatures reçues pour vos offres d'emploi</p>
        </div>

        {/* Liste des candidatures */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : candidates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {candidates.map((candidate) => {
              const badge = {
                pending: { text: 'En attente', color: 'bg-orange-50 text-orange-600 border border-orange-500' },
                accepted: { text: 'Acceptée', color: 'bg-orange-50 text-orange-600 border border-orange-500' },
                rejected: { text: 'Rejetée', color: 'bg-orange-50 text-orange-600 border border-orange-500' }
              }[candidate.status] || { text: 'En attente', color: 'bg-orange-50 text-orange-600 border border-orange-500' };
              
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune candidature à afficher pour le moment</p>
          </div>
        )}

      </main>
    </div>
  );
}
