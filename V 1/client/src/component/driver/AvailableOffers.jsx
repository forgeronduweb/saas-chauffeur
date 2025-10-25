import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import OfferDetailsModal from './OfferDetailsModal';
import CustomSelect from '../common/CustomSelect';
import { applicationsApi } from '../../services/api';

export default function AvailableOffers({ availableOffers, loading, refreshData }) {
  const [applying, setApplying] = useState(null);
  const [appliedOffers, setAppliedOffers] = useState(() => {
    // Charger les offres postulées depuis le localStorage
    const saved = localStorage.getItem('appliedOffers');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState('all');
  
  // Filtrer les offres
  const filteredOffers = availableOffers?.filter(offer => {
    // Filtre par ville
    if (selectedCity !== 'all') {
      const offerCity = offer.location?.city || offer.requirements?.zone || '';
      if (!offerCity.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
    }
    
    // Filtre par type
    if (selectedType !== 'all') {
      if (offer.type !== selectedType) {
        return false;
      }
    }
    
    // Filtre par horaire
    if (selectedSchedule !== 'all') {
      const workType = offer.conditions?.workType || '';
      if (!workType.toLowerCase().includes(selectedSchedule.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  }) || [];

  // Sauvegarder les offres postulées dans le localStorage quand elles changent
  useEffect(() => {
    localStorage.setItem('appliedOffers', JSON.stringify([...appliedOffers]));
  }, [appliedOffers]);

  // Fonction pour réinitialiser les candidatures (optionnel, pour le développement)
  const resetAppliedOffers = () => {
    setAppliedOffers(new Set());
    localStorage.removeItem('appliedOffers');
  };

  // Fonction pour afficher les détails d'une offre
  const handleShowDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  // Fonction pour postuler à une offre
  const handleApply = async (offer) => {
    if (applying) return;

    setApplying(offer._id);
    
    // Marquer immédiatement l'offre comme postulée dans l'interface
    setAppliedOffers(prev => new Set([...prev, offer._id]));
    
    try {
      // Préparer les données de candidature avec tous les champs requis
      const applicationData = {
        message: `Je suis intéressé par votre offre "${offer.title}". Je pense avoir le profil adapté pour cette mission.`,
        availability: {
          startDate: new Date().toISOString(), // Date de disponibilité immédiate
          schedule: 'Flexible'
        },
        experience: {
          years: '1-3 ans'
        }
      };

      // Envoyer la candidature
      await applicationsApi.apply(offer._id, applicationData);
      
      alert('Candidature envoyée avec succès !');
      
      // Actualiser les données si possible
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error('Erreur:', error);
      
      // En cas d'erreur, retirer l'offre de la liste des candidatures
      setAppliedOffers(prev => {
        const newSet = new Set(prev);
        newSet.delete(offer._id);
        return newSet;
      });
      
      let errorMessage = 'Erreur lors de l\'envoi de la candidature';
      
      if (error.response?.data?.details) {
        errorMessage += ':\n' + error.response.data.details.join('\n');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div>
      {/* Version Mobile */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Offres disponibles
              {appliedOffers.size > 0 && (
                <span className="ml-3 text-sm text-green-600">
                  ({appliedOffers.size} postulée{appliedOffers.size > 1 ? 's' : ''})
                </span>
              )}
            </h1>
            
            {/* Bouton de debug temporaire */}
            {appliedOffers.size > 0 && (
              <button
                onClick={resetAppliedOffers}
                className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
              >
                Réinitialiser les candidatures (debug)
              </button>
            )}
          </div>
          
          {/* Bouton filtres mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">Découvrez les missions qui correspondent à votre profil</p>
      </div>

      {/* Version Desktop - Titre + Filtres + Bouton sur la même ligne */}
      <div className="hidden lg:block mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Offres disponibles
              {appliedOffers.size > 0 && (
                <span className="ml-3 text-sm text-green-600">
                  ({appliedOffers.size} postulée{appliedOffers.size > 1 ? 's' : ''})
                </span>
              )}
            </h1>
          </div>
          
          {/* Filtres Desktop */}
          <div className="flex items-center gap-3">
            <div className="w-48">
              <CustomSelect
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="Toutes les villes"
                options={[
                  { value: 'all', label: 'Toutes les villes' },
                  { value: 'Abidjan', label: 'Abidjan' },
                  { value: 'Bouaké', label: 'Bouaké' },
                  { value: 'Yamoussoukro', label: 'Yamoussoukro' },
                  { value: 'San-Pédro', label: 'San-Pédro' },
                  { value: 'Daloa', label: 'Daloa' },
                  { value: 'Korhogo', label: 'Korhogo' },
                  { value: 'Man', label: 'Man' },
                  { value: 'Gagnoa', label: 'Gagnoa' },
                  { value: 'Divo', label: 'Divo' },
                  { value: 'Abengourou', label: 'Abengourou' }
                ]}
              />
            </div>
            <div className="w-56">
              <CustomSelect
                value={selectedType}
                onChange={setSelectedType}
                placeholder="Tous les types"
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'Chauffeur personnel', label: 'Chauffeur personnel' },
                  { value: 'Livraison', label: 'Livraison' },
                  { value: 'Transport VIP', label: 'Transport VIP' },
                  { value: 'Transport scolaire', label: 'Transport scolaire' },
                  { value: "Transport d'entreprise", label: "Transport d'entreprise" },
                  { value: 'Taxi/VTC', label: 'Taxi/VTC' },
                  { value: 'Transport de marchandises', label: 'Transport de marchandises' }
                ]}
              />
            </div>
            <div className="w-44">
              <CustomSelect
                value={selectedSchedule}
                onChange={setSelectedSchedule}
                placeholder="Tous les horaires"
                options={[
                  { value: 'all', label: 'Tous les horaires' },
                  { value: 'Temps plein', label: 'Temps plein' },
                  { value: 'Temps partiel', label: 'Temps partiel' },
                  { value: 'Ponctuel', label: 'Ponctuel' },
                  { value: 'Week-end', label: 'Week-end' },
                  { value: 'Nuit', label: 'Nuit' },
                  { value: 'Flexible', label: 'Flexible' }
                ]}
              />
            </div>
            
            {/* Bouton actualiser */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
        
        {/* Sous-titre et compteur */}
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-600">Découvrez les missions qui correspondent à votre profil</p>
          <p className="text-sm text-gray-600">
            {filteredOffers?.length || 0} offre{(filteredOffers?.length || 0) !== 1 ? 's' : ''} disponible{(filteredOffers?.length || 0) !== 1 ? 's' : ''}
            {(selectedCity !== 'all' || selectedType !== 'all' || selectedSchedule !== 'all') && (
              <span className="text-xs text-gray-500 ml-2">(sur {availableOffers?.length || 0} au total)</span>
            )}
          </p>
        </div>
      </div>

      {/* Filtres conditionnels */}
      {showFilters && (
        <div className="lg:hidden bg-white rounded-lg shadow p-4 mb-6">
          <div className="space-y-3">
            <CustomSelect
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Toutes les villes"
              options={[
                { value: 'all', label: 'Toutes les villes' },
                { value: 'Abidjan', label: 'Abidjan' },
                { value: 'Bouaké', label: 'Bouaké' },
                { value: 'Yamoussoukro', label: 'Yamoussoukro' },
                { value: 'San-Pédro', label: 'San-Pédro' },
                { value: 'Daloa', label: 'Daloa' },
                { value: 'Korhogo', label: 'Korhogo' },
                { value: 'Man', label: 'Man' },
                { value: 'Gagnoa', label: 'Gagnoa' },
                { value: 'Divo', label: 'Divo' },
                { value: 'Abengourou', label: 'Abengourou' }
              ]}
            />
            <CustomSelect
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Tous les types"
              options={[
                { value: 'all', label: 'Tous les types' },
                { value: 'Chauffeur personnel', label: 'Chauffeur personnel' },
                { value: 'Livraison', label: 'Livraison' },
                { value: 'Transport VIP', label: 'Transport VIP' },
                { value: 'Transport scolaire', label: 'Transport scolaire' },
                { value: "Transport d'entreprise", label: "Transport d'entreprise" },
                { value: 'Taxi/VTC', label: 'Taxi/VTC' },
                { value: 'Transport de marchandises', label: 'Transport de marchandises' }
              ]}
            />
            <CustomSelect
              value={selectedSchedule}
              onChange={setSelectedSchedule}
              placeholder="Tous les horaires"
              options={[
                { value: 'all', label: 'Tous les horaires' },
                { value: 'Temps plein', label: 'Temps plein' },
                { value: 'Temps partiel', label: 'Temps partiel' },
                { value: 'Ponctuel', label: 'Ponctuel' },
                { value: 'Week-end', label: 'Week-end' },
                { value: 'Nuit', label: 'Nuit' },
                { value: 'Flexible', label: 'Flexible' }
              ]}
            />
            
            {/* Bouton actualiser mobile dans les filtres */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 justify-center transition-colors font-medium"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Actualisation...' : 'Actualiser les offres'}
            </button>
          </div>
        </div>
      )}


      {/* Liste des offres */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4 lg:p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                    <div className="h-5 lg:h-6 bg-gray-200 rounded w-1/2 lg:w-1/3"></div>
                    <div className="h-4 lg:h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-3 bg-gray-200 rounded w-20"></div>
                    ))}
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2 lg:ml-6">
                  <div className="h-8 bg-gray-200 rounded flex-1 lg:w-20"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1 lg:w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOffers?.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map(offer => (
            <div key={offer._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">{offer.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {offer.type}
                        </span>
                        {offer.isDirect && (
                          <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded-full font-medium border border-purple-200">
                            OFFRE DIRECTE
                          </span>
                        )}
                        {offer.isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm lg:text-base text-gray-600 mb-3">{offer.description}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4 text-sm">
                      <div className="flex justify-between lg:block">
                        <span className="text-gray-500">Zone:</span>
                        <span className="ml-1 font-medium">{offer.location?.city || offer.requirements?.zone}</span>
                      </div>
                      <div className="flex justify-between lg:block">
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-1 font-medium">{offer.conditions?.workType || 'Non spécifié'}</span>
                      </div>
                      {offer.conditions?.salary && (
                        <div className="flex justify-between lg:block">
                          <span className="text-gray-500">Salaire:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {offer.conditions.salary} FCFA
                            {offer.conditions.salaryType && (
                              <span className="text-gray-500">
                                {offer.conditions.salaryType === 'horaire' && '/h'}
                                {offer.conditions.salaryType === 'journalier' && '/j'}
                                {offer.conditions.salaryType === 'mensuel' && '/m'}
                                {offer.conditions.salaryType === 'fixe' && ''}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between lg:block">
                        <span className="text-gray-500">Publié:</span>
                        <span className="ml-1 font-medium">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {offer.requirements && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Exigences: </span>
                        <span className="text-sm text-gray-700">
                          Permis {offer.requirements.licenseType}, {offer.requirements.experience} d'expérience
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:ml-6">
                    {appliedOffers.has(offer._id) ? (
                      <button 
                        disabled
                        className="flex-1 lg:flex-none px-4 py-2 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Déjà postulé
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(offer)}
                        disabled={applying === offer._id}
                        className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying === offer._id ? 'Envoi...' : 'Postuler'}
                      </button>
                    )}
                    <button 
                      onClick={() => handleShowDetails(offer)}
                      className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Aucune offre disponible"
          description="Aucune offre ne correspond actuellement à vos critères. De nouvelles offres apparaissent régulièrement."
          action={refreshData}
          actionText="Actualiser"
        />
      )}

      {/* Modale des détails de l'offre */}
      <OfferDetailsModal 
        offer={selectedOffer}
        showModal={showDetailsModal}
        setShowModal={setShowDetailsModal}
        onApply={refreshData}
      />

    </div>
  );
}
