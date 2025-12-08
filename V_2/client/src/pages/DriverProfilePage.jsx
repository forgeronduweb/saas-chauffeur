import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { messagesApi, driversApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from '../component/common/SimpleHeader';
import ChatModal from '../component/messaging/ChatModal';
import DirectOfferModal from '../components/offers/DirectOfferModal';
import { MapPin, Phone, Mail, Star, Award, Calendar, Car, Shield, Briefcase, CheckCircle, MessageCircle } from 'lucide-react';

// Fonction pour formater les dates YYYY-MM en format lisible
const formatMonthYear = (dateString) => {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Fonction pour calculer l'expérience totale en années
const calculateTotalExperience = (workExperiences) => {
  if (!workExperiences || workExperiences.length === 0) return 0;
  
  let totalMonths = 0;
  const now = new Date();
  
  workExperiences.forEach(exp => {
    if (!exp.startDate) return;
    
    const startDate = new Date(exp.startDate + '-01');
    const endDate = exp.endDate ? new Date(exp.endDate + '-01') : now;
    
    // Calculer la différence en mois
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  // Convertir en années (arrondi à 1 décimale)
  return Math.round(totalMonths / 12 * 10) / 10;
};

export default function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDirectOfferModal, setShowDirectOfferModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        const response = await driversApi.getProfile(id);
        
        if (response.data) {
          console.log('Données du chauffeur:', response.data);
          console.log('workExperience:', response.data.workExperience);
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

  const [currentConversation, setCurrentConversation] = useState(null);

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Créer ou récupérer la conversation avec le chauffeur
      // IMPORTANT: Utiliser driver.userId (ID User) et non driver._id (ID Driver)
      const response = await messagesApi.createOrGetConversation(driver.userId, {
        type: 'driver_contact',
        driverId: driver._id,
        driverName: `${driver.firstName} ${driver.lastName}`
      });

      // L'API retourne { conversation, messages }
      const conversation = response.data.conversation || response.data;
      setCurrentConversation(conversation);
      setShowChatModal(true);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      
      if (!user) {
        console.error("Aucun utilisateur connecté");
        return;
      }

      // Créer une conversation temporaire avec les informations disponibles
      const tempConversation = {
        _id: `temp-${user.id || user._id}-${driver.userId}`,
        participants: [
          { 
            _id: user.id || user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhotoUrl: user.profilePhotoUrl,
            companyName: user.companyName
          },
          { 
            _id: driver.userId, 
            firstName: driver.firstName,
            lastName: driver.lastName,
            profilePhotoUrl: driver.profilePhotoUrl,
            companyName: driver.companyName
          }
        ],
        lastMessage: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemporary: true // Ajout d'un flag pour indiquer que c'est une conversation temporaire
      };
      
      console.log('Création d\'une conversation temporaire:', tempConversation);
      setCurrentConversation(tempConversation);
      setShowChatModal(true);
    }
  };

  const handleDirectOfferSuccess = (offer) => {
    console.log('✅ Offre directe créée avec succès:', offer);
    // Optionnel : rediriger vers la page des offres de l'employeur
    // navigate('/employer/my-offers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-900 mb-4">Chauffeur non trouvé</h2>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale du profil */}
        <div className="bg-white border border-gray-200 overflow-hidden mb-8">
          {/* En-tête avec photo et infos principales */}
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Photo de profil */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {(() => {
                    console.log('Photo URL:', driver.profilePhotoUrl);
                    console.log('FirstName:', driver.firstName);
                    console.log('LastName:', driver.lastName);
                    return driver.profilePhotoUrl ? (
                      <img 
                        src={driver.profilePhotoUrl} 
                        alt={`${driver.firstName} ${driver.lastName}`}
                        className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white flex items-center justify-center border-2 border-orange-500">
                        <span className="text-orange-500 text-7xl lg:text-8xl font-semibold">
                          {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h1 className="text-xl lg:text-3xl text-gray-900 mb-3">
                      {driver.firstName} {driver.lastName}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {driver.isAvailable && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Disponible
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Shield className="w-4 h-4" />
                        Permis {driver.licenseType || 'B'}
                      </span>
                      {(() => {
                        const totalYears = calculateTotalExperience(driver.workExperience);
                        if (totalYears > 0) {
                          return (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              <Award className="w-4 h-4" />
                              {totalYears} {totalYears === 1 ? 'an' : 'ans'}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Bouton de contact */}
                  {!user ? (
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full lg:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Se connecter pour contacter
                    </button>
                  ) : (
                    <button
                      onClick={handleContact}
                      className="w-full lg:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Envoyer un message
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {driver.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm text-gray-900">{driver.phone}</p>
                  </div>
                </div>
              )}
              {driver.workZone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Zone de travail</p>
                    <p className="text-sm text-gray-900">{driver.workZone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations sur le véhicule */}
            {driver.vehicleType && (
              <div className="bg-white border border-gray-200 p-6 lg:p-8">
                <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <span className="section-title">Véhicule</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="text-gray-900">{driver.vehicleType}</p>
                  </div>
                  {driver.vehicleBrand && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Marque</p>
                      <p className="text-gray-900">{driver.vehicleBrand}</p>
                    </div>
                  )}
                  {driver.vehicleYear && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Année</p>
                      <p className="text-gray-900">{driver.vehicleYear}</p>
                    </div>
                  )}
                  {driver.vehicleSeats && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Places</p>
                      <p className="text-gray-900">{driver.vehicleSeats} places</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Spécialités */}
            {driver.specialties && driver.specialties.length > 0 && (
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg text-gray-900 mb-4">Spécialités</h3>
                <div className="flex flex-wrap gap-2">
                  {driver.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courses effectuées</span>
                  <span className="text-xl lg:text-2xl text-orange-500">{driver.totalRides || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Années d'expérience</span>
                  <span className="text-xl lg:text-2xl text-orange-500">
                    {calculateTotalExperience(driver.workExperience) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taux d'acceptation</span>
                  <span className="text-xl lg:text-2xl text-orange-500">98%</span>
                </div>
              </div>
            </div>

            {/* Langues */}
            {driver.languages && driver.languages.length > 0 && (
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-lg text-gray-900 mb-4">Langues parlées</h3>
                <div className="space-y-2">
                  {driver.languages.map((language, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{language}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expériences professionnelles - En bas */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mt-6 lg:mt-8">
          <h2 className="text-base sm:text-lg lg:text-xl !text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <span className="section-title">Expériences professionnelles</span>
          </h2>
          {driver.workExperience && driver.workExperience.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {driver.workExperience.map((exp, index) => (
                <div 
                  key={index} 
                  className="relative pl-6 sm:pl-8 pb-4 sm:pb-6 border-l-2 border-orange-200 last:pb-0 hover:border-orange-400 transition-colors"
                >
                  {/* Point de la timeline */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full ring-4 ring-white shadow-sm"></div>
                  
                  {/* Contenu de l'expérience */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-orange-50 transition-colors">
                    {/* Poste */}
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                      {exp.position || exp.title}
                    </h3>
                    
                    {/* Entreprise et dates */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                      {/* Entreprise */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <div className="p-1 bg-white rounded">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        </div>
                        <span className="font-medium">{exp.company}</span>
                      </div>
                      
                      {/* Dates */}
                      {(exp.startDate || exp.endDate) && (
                        <>
                          <span className="hidden sm:inline text-gray-400">•</span>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                            <span>
                              {exp.startDate && exp.endDate 
                                ? `${formatMonthYear(exp.startDate)} - ${formatMonthYear(exp.endDate)}`
                                : exp.startDate 
                                ? (
                                  <>
                                    {formatMonthYear(exp.startDate)} - <span className="text-green-600 font-medium">Présent</span>
                                  </>
                                )
                                : formatMonthYear(exp.endDate)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Description */}
                    {exp.description && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 pl-0 sm:pl-6">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-500">Aucune expérience professionnelle renseignée</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal d'offre directe */}
      <DirectOfferModal
        isOpen={showDirectOfferModal}
        onClose={() => setShowDirectOfferModal(false)}
        driver={driver}
        onSuccess={handleDirectOfferSuccess}
      />
      
      {showChatModal && driver && currentConversation && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          conversation={currentConversation}
          onBack={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}
