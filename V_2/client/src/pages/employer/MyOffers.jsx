import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import CustomDropdown from '../../component/common/CustomDropdown';
import { offersApi } from '../../services/api';

export default function MyOffers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, closed
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      
      // Transformer les données de l'API
      const formattedOffers = response.data.map(offer => ({
        id: offer._id,
        title: offer.title,
        type: offer.type,
        location: offer.location?.city || offer.location?.address || 'Non spécifié',
        salary: offer.conditions?.salary || '0',
        salaryType: offer.conditions?.salaryType || 'mensuel',
        status: offer.isActive ? 'active' : 'closed',
        createdDate: offer.createdAt,
        applicationsCount: offer.applicationsCount || 0,
        viewsCount: offer.viewsCount || 0
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

  const filteredOffers = filter === 'all' 
    ? offers 
    : offers.filter(o => o.status === filter);

  const handleEdit = (offerId) => {
    navigate(`/edit-job-offer/${offerId}`);
  };

  const openDeleteModal = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;

    try {
      await offersApi.delete(offerToDelete.id);
      // Rafraîchir la liste
      await fetchOffers();
      setShowDeleteModal(false);
      setOfferToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Impossible de supprimer l\'offre');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec filtres */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Mes annonces</h1>
            
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
                  { value: 'all', label: `Toutes (${offers.length})` },
                  { value: 'active', label: `Actives (${offers.filter(o => o.status === 'active').length})` },
                  { value: 'closed', label: `Fermées (${offers.filter(o => o.status === 'closed').length})` }
                ]}
              />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Gérez vos offres d'emploi publiées</p>
        </div>

        {/* Liste des offres */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl text-gray-900 mb-3">Aucune annonce</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Commencez à recruter les meilleurs chauffeurs. Créez votre première offre d'emploi et trouvez le candidat idéal.
            </p>
            <button
              onClick={() => navigate('/publier-offre?type=job')}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première annonce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOffers.map((offer) => (
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
                      <button 
                        onClick={() => handleEdit(offer.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                      >
                        Modifier
                      </button>
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
        )}
      </main>

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
                  <option value="all">Toutes ({offers.length})</option>
                  <option value="active">Actives ({offers.filter(o => o.status === 'active').length})</option>
                  <option value="closed">Fermées ({offers.filter(o => o.status === 'closed').length})</option>
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

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={closeDeleteModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 w-[90vw] max-w-[460px] border border-gray-200">
            {/* Icône */}
            <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            {/* Titre */}
            <h3 className="text-gray-900 mt-4 text-xl">
              Supprimer cette offre ?
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mt-2 text-center">
              Êtes-vous sûr de vouloir supprimer l'offre "{offerToDelete?.title}" ? Cette action est irréversible.
            </p>

            {/* Boutons */}
            <div className="flex gap-3 mt-6 w-full">
              <button
                onClick={closeDeleteModal}
                className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-100 active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 text-sm hover:bg-red-700 active:scale-95 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
