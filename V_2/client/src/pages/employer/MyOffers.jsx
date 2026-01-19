import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { offersApi } from '../../services/api';

export default function MyOffers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'employer') {
      navigate('/auth');
      return;
    }
    fetchOffers();
  }, [user, navigate]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await offersApi.myOffers();
      console.log('Mes offres:', response.data);
      
      // Filtrer uniquement les offres d'emploi (exclure les offres marketing)
      const jobOffers = response.data.filter(offer => 
        offer.type !== 'product' && offer.type !== 'Autre'
      );
      
      // Transformer les données de l'API
      const formattedOffers = jobOffers.map(offer => ({
        id: offer._id,
        title: offer.title,
        type: offer.type,
        location: offer.location?.city || offer.location?.address || 'Non spécifié',
        salary: offer.conditions?.salary || '0',
        salaryType: offer.conditions?.salaryType || 'mensuel',
        status: offer.isActive ? 'active' : 'closed',
        createdDate: offer.createdAt,
        applicationsCount: offer.applicationsCount || 0,
        viewsCount: offer.viewsCount || 0,
        isDirect: !!offer.isDirect,
        targetDriverName: offer.targetDriver
          ? `${offer.targetDriver.firstName} ${offer.targetDriver.lastName}`
          : null
      }));
      
      setOffers(formattedOffers);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      // En cas d'erreur, afficher un tableau vide
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleEdit = (offerId) => {
    navigate(`/edit-job-offer/${offerId}`);
  };

  const openDeleteModal = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return; // Empêcher la fermeture pendant le chargement
    setShowDeleteModal(false);
    setOfferToDelete(null);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (!offerToDelete || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await offersApi.delete(offerToDelete.id);
      // Rafraîchir la liste
      await fetchOffers();
      setShowDeleteModal(false);
      setOfferToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Impossible de supprimer l\'offre');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <main className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base lg:text-lg text-gray-900">Mes annonces</h1>
          <p className="text-gray-600 text-sm">Gérez vos offres d'emploi publiées</p>
        </div>

        {/* Liste des offres */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg border border-gray-200 transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Info offre */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-base sm:text-lg text-gray-900 mb-2">{offer.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {offer.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            offer.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {offer.status === 'active' ? 'Active' : 'Fermée'}
                          </span>
                          {offer.isDirect && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                              Offre directe
                              {offer.targetDriverName && (
                                <>
                                  {' · '}
                                  {offer.targetDriverName}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {offer.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {parseInt(offer.salary).toLocaleString()} FCFA / {offer.salaryType}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Publié le {new Date(offer.createdDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{offer.applicationsCount}</span> candidatures
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{offer.viewsCount}</span> vues
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/offre/${offer.id}`)}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                      >
                        Voir détails
                      </button>
                      {!offer.isDirect && (
                        <button 
                          onClick={() => handleEdit(offer.id)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          Modifier
                        </button>
                      )}
                      <button 
                        onClick={() => openDeleteModal(offer)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune annonce à afficher pour le moment</p>
          </div>
        )}
      </main>


      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer l'offre"
        subtitle="Cette action est définitive"
        message={`Êtes-vous certain de vouloir supprimer l'offre "${offerToDelete?.title}" ? Cette action supprimera définitivement l'offre et toutes les candidatures associées.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
