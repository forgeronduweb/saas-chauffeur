import { useState } from 'react';
import CreateOffer from './CreateOffer';
import EditOffer from './EditOffer';
import { offersApi } from '../../services/api';

export default function MyOffers({ myOffers, showCreateForm, setShowCreateForm, onOfferCreated, refreshData }) {
  const [editingOffer, setEditingOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour suspendre/activer une offre
  const handleToggleStatus = async (offer) => {
    if (loading) return;
    
    const newStatus = offer.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'activer' : 'suspendre';
    
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cette offre ?`)) {
      return;
    }

    setLoading(true);
    try {
      await offersApi.update(offer._id, { status: newStatus });
      
      // Actualiser les données
      if (refreshData) {
        refreshData();
      }
      
      alert(`Offre ${newStatus === 'active' ? 'activée' : 'suspendue'} avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du statut de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une offre
  const handleDelete = async (offer) => {
    if (loading) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    try {
      await offersApi.delete(offer._id);
      
      // Actualiser les données
      if (refreshData) {
        refreshData();
      }
      
      alert('Offre supprimée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour modifier une offre
  const handleEdit = (offer) => {
    setEditingOffer(offer);
  };

  // Fonction appelée après modification d'une offre
  const handleOfferUpdated = (updatedOffer) => {
    console.log('Offre modifiée:', updatedOffer);
    setEditingOffer(null);
    // Actualiser les données
    if (refreshData) {
      refreshData();
    }
  };
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mes annonces</h1>
        <p className="text-sm lg:text-base text-gray-600">Gérez vos offres d'emploi et créez de nouvelles annonces</p>
      </div>

      {/* Composant de création d'offre */}
      <CreateOffer 
        showCreateForm={showCreateForm}
        setShowCreateForm={setShowCreateForm}
        onOfferCreated={onOfferCreated}
      />

      {/* Composant de modification d'offre */}
      <EditOffer 
        offer={editingOffer}
        showEditForm={!!editingOffer}
        setShowEditForm={(show) => !show && setEditingOffer(null)}
        onOfferUpdated={handleOfferUpdated}
      />

      {/* Liste des offres */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Offres publiées</h3>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm lg:text-base w-full lg:w-auto"
            >
              Nouvelle offre
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {myOffers && myOffers.length > 0 ? myOffers.map(offer => (
            <div key={offer._id || offer.id} className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-base lg:text-lg font-medium text-gray-900">{offer.title}</h4>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">Type: {offer.type} • Créée le {offer.created}</p>
                  <div className="flex flex-col lg:flex-row lg:items-center mt-2 gap-2 lg:gap-4">
                    <span className={`px-2 py-1 text-xs rounded-full self-start ${
                      offer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {offer.status === 'active' ? 'Active' : 'En pause'}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-600">{offer.candidates} candidatures</span>
                  </div>
                </div>
                <div className="flex gap-2 lg:flex-row lg:gap-3">
                  {/* Bouton Modifier */}
                  <button 
                    onClick={() => handleEdit(offer)}
                    disabled={loading}
                    className="flex-1 lg:w-24 flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 text-xs lg:text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                    title="Modifier cette annonce"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="lg:hidden">Modifier</span>
                    <span className="hidden lg:inline truncate">Modifier</span>
                  </button>

                  {/* Bouton Suspendre/Activer */}
                  <button 
                    onClick={() => handleToggleStatus(offer)}
                    disabled={loading}
                    className={`flex-1 lg:w-24 flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg border transition-all duration-200 text-xs lg:text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 ${
                      offer.status === 'active' 
                        ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800 border-yellow-200 hover:border-yellow-300' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200 hover:border-green-300'
                    }`}
                    title={offer.status === 'active' ? 'Suspendre cette annonce' : 'Activer cette annonce'}
                  >
                    {offer.status === 'active' ? (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="lg:hidden">Pause</span>
                        <span className="hidden lg:inline truncate">Suspendre</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 5a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        <span className="lg:hidden">Activer</span>
                        <span className="hidden lg:inline truncate">Activer</span>
                      </>
                    )}
                  </button>

                  {/* Bouton Supprimer */}
                  <button 
                    onClick={() => handleDelete(offer)}
                    disabled={loading}
                    className="flex-1 lg:w-24 flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 text-xs lg:text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                    title="Supprimer définitivement cette annonce"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="lg:hidden">Suppr.</span>
                    <span className="hidden lg:inline truncate">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucune offre publiée</p>
              <p className="text-sm text-gray-400 mt-1">Créez votre première offre pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
