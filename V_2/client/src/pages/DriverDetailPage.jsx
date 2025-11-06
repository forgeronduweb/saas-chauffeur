import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { driversService, messagesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from '../component/common/SimpleHeader';
import ImageModal from '../component/common/ImageModal';

export default function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacting, setContacting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        // Charger directement le chauffeur par ID (optimisé)
        const response = await driversService.getById(id);
        
        if (response.data) {
          setDriver(response.data);
          setError(null);
        } else {
          setError('Chauffeur non trouvé');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Chauffeur non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chauffeur non trouvé</h2>
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader activeTab="chauffeurs" />

      {/* Contenu - Style fiche produit */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Colonne gauche - Photo */}
          <div>
            <div className="relative h-64 lg:h-[600px] bg-gray-100 rounded-lg overflow-hidden lg:sticky lg:top-24">
              {driver.profilePhotoUrl ? (
                <img 
                  src={driver.profilePhotoUrl} 
                  alt={`${driver.firstName} ${driver.lastName}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Informations */}
          <div>
            {/* En-tête */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 lg:mb-3">
                {driver.firstName} {driver.lastName}
              </h1>
              <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                <span className="text-sm sm:text-base lg:text-lg text-gray-900 font-medium">
                  {driver.rating ? driver.rating.toFixed(1) : '5.0'}/5
                </span>
                <span className="text-xs lg:text-lg text-gray-500">
                  ({driver.totalRides || 0} courses)
                </span>
              </div>
            </div>

            {/* Informations principales */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mb-6">
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between py-2 lg:py-3 border-b border-gray-200">
                  <span className="text-xs lg:text-lg text-gray-600">Expérience</span>
                  <span className="text-xs lg:text-lg font-medium text-gray-900">{driver.experience || 'Non spécifiée'}</span>
                </div>
                <div className="flex justify-between py-2 lg:py-3 border-b border-gray-200">
                  <span className="text-xs lg:text-lg text-gray-600">Type de véhicule</span>
                  <span className="text-xs lg:text-lg font-medium text-gray-900">{driver.vehicleType || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between py-2 lg:py-3 border-b border-gray-200">
                  <span className="text-xs lg:text-lg text-gray-600">Zone de travail</span>
                  <span className="text-xs lg:text-lg font-medium text-gray-900">{driver.workZone || 'Abidjan'}</span>
                </div>
                <div className="flex justify-between py-2 lg:py-3">
                  <span className="text-xs lg:text-lg text-gray-600">Permis</span>
                  <span className="text-xs lg:text-lg font-medium text-gray-900">Permis {driver.licenseType || 'B'}</span>
                </div>
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {user ? (
                <button
                  onClick={async () => {
                    try {
                      setContacting(true);
                      const response = await messagesApi.createOrGetConversation(
                        driver.userId._id || driver.userId,
                        { type: 'driver_inquiry', driverId: driver._id }
                      );
                      navigate(`/messages?conversation=${response.data.conversation._id}`);
                    } catch (error) {
                      console.error('Erreur:', error);
                      alert('Erreur lors de la création de la conversation');
                    } finally {
                      setContacting(false);
                    }
                  }}
                  disabled={contacting}
                  className="block w-full py-3 lg:py-4 bg-orange-500 text-white text-center text-sm lg:text-base font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {contacting ? 'Connexion...' : 'Envoyer un message'}
                </button>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block w-full py-3 lg:py-4 bg-orange-500 text-white text-center text-sm lg:text-base font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Contacter ce chauffeur
                  </Link>
                  <p className="text-xs lg:text-sm text-gray-500 text-center mt-2">
                    Créez un compte gratuit pour contacter ce chauffeur
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section Expériences professionnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 mt-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">Expériences professionnelles</h2>
          
          <div className="space-y-4 lg:space-y-6">
            {/* Expérience 1 */}
            <div className="border-l-2 border-gray-300 pl-4 lg:pl-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1">Chauffeur personnel</h3>
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Entreprise privée • 2020 - Présent</p>
              <p className="text-xs lg:text-sm text-gray-700">
                Transport quotidien de cadres d'entreprise, gestion des déplacements professionnels et personnels.
              </p>
            </div>

            {/* Expérience 2 */}
            <div className="border-l-2 border-gray-300 pl-4 lg:pl-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1">Chauffeur VTC</h3>
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Indépendant • 2018 - 2020</p>
              <p className="text-xs lg:text-sm text-gray-700">
                Service de transport de personnes via plateformes VTC, excellente connaissance d'Abidjan.
              </p>
            </div>

            {/* Expérience 3 */}
            <div className="border-l-2 border-gray-300 pl-4 lg:pl-6">
              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1">Chauffeur livreur</h3>
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Société de logistique • 2016 - 2018</p>
              <p className="text-xs lg:text-sm text-gray-700">
                Livraison de colis et documents, respect des délais, gestion des itinéraires optimaux.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal d'agrandissement d'image */}
      {showImageModal && driver.profilePhotoUrl && (
        <ImageModal
          imageUrl={driver.profilePhotoUrl}
          alt={`${driver.firstName} ${driver.lastName}`}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
