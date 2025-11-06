import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SimpleHeader from '../component/common/SimpleHeader';
import { offersApi, applicationsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);


  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        console.log('Chargement de l\'offre avec ID:', id);
        
        // Charger directement l'offre par ID (optimisé)
        const response = await offersApi.getById(id);
        console.log('Réponse API:', response);
        
        if (response.data) {
          console.log('Offre trouvée:', response.data);
          setOffer(response.data);
          
          // Récupérer les informations de l'employeur si disponible
          if (response.data.employerId && typeof response.data.employerId === 'object') {
            // L'employerId est populé avec les données de l'employeur
            setEmployer(response.data.employerId);
            console.log('Employeur trouvé:', response.data.employerId);
          } else if (response.data.employer) {
            setEmployer(response.data.employer);
          } else {
            console.log('Aucune donnée employeur trouvée');
          }
          
          // Vérifier si le chauffeur a déjà postulé
          if (user && user.role === 'driver') {
            try {
              const applicationsResponse = await applicationsApi.myApplications();
              const hasAlreadyApplied = applicationsResponse.data?.some(
                app => app.offerId === id || app.offer?._id === id
              );
              setHasApplied(hasAlreadyApplied);
              console.log('A déjà postulé:', hasAlreadyApplied);
            } catch (appError) {
              console.log('Erreur lors de la vérification des candidatures:', appError);
            }
          }
          
          setError(null);
        } else {
          console.error('Aucune offre trouvée avec l\'ID:', id);
          setError('Offre non trouvée');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Impossible de charger l\'offre');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id, user]);

  const handleApply = async () => {
    if (!user || user.role !== 'driver') {
      navigate('/auth');
      return;
    }

    setApplying(true);
    try {
      console.log('Envoi de la candidature pour l\'offre:', id);
      const response = await applicationsApi.apply(id, {
        message: 'Je suis intéressé par cette offre'
      });
      console.log('Réponse de la candidature:', response);
      setHasApplied(true);
      alert('Votre candidature a été envoyée avec succès !');
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse erreur:', error.response);
      console.error('Message du serveur:', error.response?.data?.message);
      console.error('Données complètes:', error.response?.data);
      console.error('Détails de l\'erreur:', error.response?.data?.details);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message;
      
      if (error.response?.status === 409 || errorMessage?.includes('déjà postulé')) {
        setHasApplied(true);
        alert('Vous avez déjà postulé à cette offre');
      } else if (error.response?.status === 404) {
        alert('Offre non trouvée. Elle a peut-être été supprimée.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Vous devez être connecté en tant que chauffeur pour postuler.');
        navigate('/auth');
      } else if (errorMessage) {
        alert(`Erreur: ${errorMessage}`);
      } else if (error.message === 'Network Error') {
        alert('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
      } else {
        alert('Erreur lors de l\'envoi de votre candidature. Veuillez réessayer.');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offre non trouvée</h2>
          <Link to="/offres" className="text-gray-600 hover:text-gray-900">
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader activeTab="offres" />

      {/* Contenu - Style fiche produit */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Détails de l'offre */}
          <div className="lg:col-span-2">
            {/* En-tête */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3">
                {offer.title}
              </h1>
              <div className="mb-4">
                <p className="text-sm sm:text-base text-gray-900 font-medium mb-1">
                  {offer.company || 'Entreprise'}
                </p>
                {(employer || offer.employer) && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    Publié par : {employer ? `${employer.firstName} ${employer.lastName}` : (offer.employer?.firstName ? `${offer.employer.firstName} ${offer.employer.lastName}` : offer.employer)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs lg:text-lg font-medium rounded">
                  {offer.contractType || offer.type || 'CDI'}
                </span>
                {offer.type && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs lg:text-lg font-medium rounded">
                    {offer.type}
                  </span>
                )}
                {(offer.conditions?.workType || offer.workType) && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs lg:text-lg font-medium rounded">
                    {offer.conditions?.workType?.replace('_', ' ') || offer.workType}
                  </span>
                )}
                <span className="text-xs lg:text-lg text-gray-500">
                  Publié le {new Date(offer.createdAt || offer.postedDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Description du poste</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{offer.description}</p>
            </div>

            {/* Exigences */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Profil recherché</h2>
              <ul className="space-y-2">
                {/* Afficher les exigences selon la structure */}
                {(offer.requirementsList && Array.isArray(offer.requirementsList)) ? (
                  offer.requirementsList.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{req}</span>
                    </li>
                  ))
                ) : Array.isArray(offer.requirements) ? (
                  offer.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{req}</span>
                    </li>
                  ))
                ) : offer.requirements ? (
                  <>
                    {offer.requirements.licenseType && (
                      <li className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Permis de conduire catégorie {offer.requirements.licenseType}</span>
                      </li>
                    )}
                    {offer.requirements.experience && (
                      <li className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Expérience: {offer.requirements.experience}</span>
                      </li>
                    )}
                    {offer.requirements.vehicleType && (
                      <li className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Véhicule: {offer.requirements.vehicleType}</span>
                      </li>
                    )}
                    {offer.requirements.zone && (
                      <li className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Zone: {offer.requirements.zone}</span>
                      </li>
                    )}
                  </>
                ) : null}
              </ul>
            </div>

            {/* Avantages */}
            {offer.benefits && Array.isArray(offer.benefits) && offer.benefits.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Avantages</h2>
                <ul className="space-y-2">
                  {offer.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>{benefit}</span>
                  </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Colonne latérale - Informations et action */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {/* Informations clés */}
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs lg:text-lg text-gray-500 mb-1">Localisation</p>
                    <p className="text-xs lg:text-lg font-medium text-gray-900">
                      {offer.location?.address && offer.location?.city 
                        ? `${offer.location.address}, ${offer.location.city}`
                        : offer.location?.city || offer.location || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-lg text-gray-500 mb-1">Salaire</p>
                    <p className="text-xs lg:text-lg font-medium text-gray-900">
                      {offer.salaryRange || (offer.conditions?.salary ? `${offer.conditions.salary.toLocaleString()} FCFA` : offer.salary || 'À négocier')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-lg text-gray-500 mb-1">Type de véhicule</p>
                    <p className="text-xs lg:text-lg font-medium text-gray-900">
                      {offer.requirements?.vehicleType || offer.vehicleType || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-lg text-gray-500 mb-1">Expérience requise</p>
                    <p className="text-xs lg:text-lg font-medium text-gray-900">
                      {offer.requirements?.experience || offer.experience || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs lg:text-lg text-gray-500 mb-1">Permis</p>
                    <p className="text-xs lg:text-lg font-medium text-gray-900">
                      Permis {offer.requirements?.licenseType || offer.licenseType || 'B'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="space-y-3">
                {!user ? (
                  <>
                    <Link
                      to="/auth"
                      className="block w-full py-3 bg-orange-500 text-white text-center font-medium rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Postuler à cette offre
                    </Link>
                    <p className="text-xs text-gray-500 text-center">
                      Connectez-vous pour postuler
                    </p>
                  </>
                ) : user.role !== 'driver' ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      Seuls les chauffeurs peuvent postuler aux offres
                    </p>
                  </div>
                ) : hasApplied ? (
                  <button
                    disabled
                    className="w-full py-3 bg-green-100 text-green-700 text-center font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Candidature envoyée
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-3 bg-orange-500 text-white text-center font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Envoi en cours...' : 'Postuler à cette offre'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
