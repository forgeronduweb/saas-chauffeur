import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { driversApi } from '../../services/api';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { CheckIcon, WarningIcon } from './ConfirmationIcons';

// Style pour masquer la barre de défilement
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function DriverProfileModal({ isOpen, onClose, driverId }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  
  // Hook pour les confirmations personnalisées
  const { confirm, isOpen: isConfirmOpen, config, handleConfirm, handleCancel } = useConfirmation();
  const [sendingMessage, setSendingMessage] = useState(false);

  // Charger les données du chauffeur quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && driverId) {
      loadDriverProfile();
    }
  }, [isOpen, driverId]);

  const loadDriverProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await driversApi.getProfile(driverId);
      setDriver(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Impossible de charger le profil du chauffeur');
    } finally {
      setLoading(false);
    }
  };

  // Fermer la modal
  const handleClose = () => {
    setDriver(null);
    setError(null);
    setShowConfirmModal(false);
    setShowMessageModal(false);
    setMessageContent('');
    setSendingMessage(false);
    onClose();
  };

  // Ouvrir la modal de rédaction de message
  const handleContact = () => {
    if (!driver) return;
    
    // Ouvrir la modal avec une zone de texte vide
    setMessageContent('');
    setShowMessageModal(true);
  };

  // Envoyer le message au chauffeur
  const sendMessage = async () => {
    if (!driver || !messageContent.trim() || sendingMessage) return;
    
    setSendingMessage(true);
    
    try {
      // Importer le service chat
      const { chatService } = await import('../../services/api');
      
      console.log('Driver data:', driver); // Debug
      console.log('Driver userId:', driver.userId); // Debug spécifique
      console.log('Driver _id:', driver._id); // Debug spécifique
      
      // Vérifier que nous avons les données nécessaires
      if (!driver.userId) {
        console.error('userId manquant dans les données du chauffeur');
        throw new Error('ID utilisateur du chauffeur manquant. Veuillez redémarrer le serveur.');
      }
      
      // Créer ou récupérer la conversation
      const context = {
        type: 'profile_contact',
        title: `Contact avec ${driver.firstName} ${driver.lastName}`,
        relatedId: driver._id
      };
      
      console.log('Creating conversation with userId:', driver.userId, context); // Debug
      
      const response = await chatService.createOrGetConversation(driver.userId, context);
      const conversation = response.data;
      
      console.log('Conversation created:', conversation); // Debug
      
      // Envoyer le message
      await chatService.sendMessage(conversation._id, messageContent.trim());
      
      // Fermer les modals
      setShowMessageModal(false);
      handleClose();
      
      // Afficher un message de succès avec notre modal personnalisé (auto-fermeture)
      await confirm({
        title: "Message envoyé !",
        message: `Votre message a été envoyé à ${driver.firstName} ${driver.lastName}. Il/elle le recevra dans sa messagerie.`,
        type: "success",
        icon: <CheckIcon />,
        autoClose: true,
        autoCloseDelay: 2500
      });
      
    } catch (error) {
      console.error('Erreur détaillée lors de l\'envoi du message:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Erreur lors de l\'envoi du message.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Afficher l'erreur avec notre modal personnalisé
      await confirm({
        title: "Erreur d'envoi",
        message: `${errorMessage}\n\nVeuillez réessayer ou contacter le support.`,
        confirmText: "OK",
        cancelText: "",
        type: "danger",
        icon: <WarningIcon color="#DC2626" />
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Ouvrir la modal de confirmation pour recruter
  const handleRecruit = () => {
    setShowConfirmModal(true);
  };

  // Confirmer le recrutement - Envoi d'offre directe
  const confirmRecruit = async () => {
    if (!driver) return;
    
    try {
      // Créer une offre directe automatiquement
      const directOfferData = {
        title: `Offre personnalisée pour ${driver.firstName} ${driver.lastName}`,
        description: `Bonjour ${driver.firstName},

Je suis intéressé(e) par votre profil de chauffeur professionnel. Voici pourquoi :

✅ Votre expérience : ${driver.experience || 'Profil expérimenté'}
✅ Votre zone de travail : ${driver.workZone || 'Zone compatible'}
✅ Votre évaluation : ${driver.rating || 'N/A'}/5 étoiles
✅ Vos courses effectuées : ${driver.totalRides || 0} missions

 OFFRE DIRECTE - Cette proposition vous est destinée exclusivement.

Je souhaiterais discuter avec vous d'une opportunité de collaboration. 

Êtes-vous disponible pour échanger sur les détails de cette mission ?

Cordialement`,
        type: 'Personnel',
        requirements: {
          licenseType: 'B',
          experience: driver.experience?.includes('10+') || driver.experience?.includes('5+') ? '5+ ans' : 
                     driver.experience?.includes('3-5') ? '3-5 ans' :
                     driver.experience?.includes('1-3') ? '1-3 ans' : '1-3 ans',
          zone: driver.workZone || 'À définir'
        },
        conditions: {
          salaryType: 'mission',
          workType: 'ponctuel',
          startDate: new Date().toISOString().split('T')[0] // Date d'aujourd'hui
        },
        location: {
          city: driver.workZone || 'À définir'
        },
        contactInfo: {
          preferredContact: 'platform'
        },
        isUrgent: false,
        isDirect: true, // Flag pour indiquer que c'est une offre directe
        targetDriverId: driver._id, // ID du chauffeur ciblé
        tags: ['offre-directe', 'personnalisée']
      };

      // Appeler l'API pour créer l'offre directe
      console.log('Données de l\'offre directe à envoyer:', directOfferData);
      const { offersApi } = await import('../../services/api');
      const response = await offersApi.create(directOfferData);

      const result = response.data;
      console.log('Offre directe créée:', result);
      console.log('targetDriverId envoyé:', directOfferData.targetDriverId);
      
      // Fermer les modals
      setShowConfirmModal(false);
      handleClose();
      
      // Afficher un message de succès
      alert(`✅ Offre directe envoyée à ${driver.firstName} ${driver.lastName} !\n\nIl/elle la verra dans ses "Offres disponibles" avec la mention "OFFRE DIRECTE".`);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'offre directe:', error);
      alert('❌ Erreur lors de l\'envoi de l\'offre directe. Veuillez réessayer.');
    }
  };

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Profil du chauffeur"
        size="lg"
      >
        <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto scrollbar-hide">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {driver && (
              <div className="space-y-6">
                {/* Photo de profil et nom */}
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {driver.profilePhotoUrl ? (
                        <img
                          src={driver.profilePhotoUrl}
                          alt={`${driver.firstName} ${driver.lastName}`}
                          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center border-4 border-indigo-100 shadow-lg">
                          <span className="text-white text-2xl font-bold">
                            {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Indicateur de disponibilité */}
                      <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-3 border-white ${
                        driver.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`} title={driver.isAvailable ? 'Disponible maintenant' : 'Non disponible'}>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {driver.firstName} {driver.lastName}
                  </h2>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    driver.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      driver.isAvailable ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    {driver.isAvailable ? 'Disponible maintenant' : 'Non disponible'}
                  </div>
                </div>

                {/* Informations clés qui incitent au contact */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 space-y-4">
                  {/* Évaluation et expérience */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (driver.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-semibold text-gray-900">{driver.rating || 0}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{driver.totalRides || 0}</div>
                      <div className="text-sm text-gray-600">courses effectuées</div>
                    </div>
                  </div>

                  {/* Informations essentielles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Expérience</div>
                      <div className="font-semibold text-gray-900">{driver.experience || 'Non spécifié'}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Zone</div>
                      <div className="font-semibold text-gray-900">{driver.workZone || 'Non spécifié'}</div>
                    </div>
                  </div>

                  {/* Expériences professionnelles récentes */}
                  {driver.workExperience && driver.workExperience.length > 0 ? (
                    <div className="col-span-2 p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 mb-3 text-center">Expériences récentes</div>
                      <div className="space-y-3 max-h-32 overflow-y-auto">
                        {driver.workExperience.slice(0, 3).map((exp, index) => (
                          <div key={index} className="border-l-3 border-indigo-200 pl-3">
                            <div className="font-semibold text-gray-900 text-sm">
                              {exp.position || 'Chauffeur'}
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{exp.company || 'Entreprise'}</span>
                              {exp.location && ` • ${exp.location}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {exp.startDate && exp.endDate ? 
                                `${new Date(exp.startDate + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })} - ${new Date(exp.endDate + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}` : 
                               exp.startDate ? 
                                `Depuis ${new Date(exp.startDate + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}` : 
                               'Période non précisée'}
                            </div>
                            {exp.description && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {exp.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {driver.workExperience.length > 3 && (
                        <div className="text-center mt-2">
                          <span className="text-xs text-indigo-600 font-medium">
                            +{driver.workExperience.length - 3} autres expériences
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="col-span-2 text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Expériences</div>
                      <div className="text-sm text-gray-500">Aucune expérience renseignée</div>
                    </div>
                  )}

                  {/* Spécialités */}
                  {driver.specialties && driver.specialties.length > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Spécialités</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {driver.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact direct */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Intéressé par ce profil ?</h3>
                    <p className="text-sm text-gray-600">Contactez directement ce chauffeur professionnel</p>
                  </div>
                  
                  {/* Informations de contact */}
                  {(driver.email || driver.phone) && (
                    <div className="space-y-2 mb-4">
                      {driver.email && (
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {driver.email}
                        </div>
                      )}
                      {driver.phone && (
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {driver.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Boutons d'action améliorés */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleContact}
                    className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contacter maintenant
                  </button>
                  
                  <button
                    onClick={handleRecruit}
                    className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Offre directe
                  </button>
                </div>
              </div>
            )}
        </div>
      </Modal>

      {/* Modal de confirmation pour le recrutement */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Créer une offre"
        size="md"
      >
        <div className="text-center space-y-4">
          {driver && (
            <>
              <div className="flex justify-center mb-4">
                {driver.profilePhotoUrl ? (
                  <img
                    src={driver.profilePhotoUrl}
                    alt={`${driver.firstName} ${driver.lastName}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center border-2 border-indigo-100">
                    <span className="text-white text-lg font-bold">
                      {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                Envoyer une offre directe à {driver.firstName} {driver.lastName} ?
              </h3>
              
              <p className="text-sm text-gray-600">
                Une offre personnalisée sera automatiquement créée et envoyée directement à ce chauffeur. Il la recevra dans ses "Offres disponibles" avec la mention "OFFRE DIRECTE".
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-3 text-left border border-indigo-200">
                <div className="text-xs text-indigo-600 mb-2 font-medium">🎯 Message personnalisé qui sera envoyé :</div>
                <div className="text-xs text-gray-700 bg-white p-2 rounded border italic">
                  "Bonjour {driver.firstName}, je suis intéressé(e) par votre profil de chauffeur professionnel. 
                  Votre expérience ({driver.experience || 'N/A'}) et votre zone ({driver.workZone || 'N/A'}) 
                  correspondent parfaitement à mes besoins. Cette offre vous est destinée exclusivement..."
                </div>
                <div className="text-xs text-indigo-600 mt-2">
                  ✅ Le chauffeur pourra postuler directement depuis ses offres disponibles
                </div>
              </div>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmRecruit}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Envoyer l'offre directe
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de rédaction de message */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Envoyer un message"
        size="md"
      >
        <div className="space-y-4">
          {driver && (
            <>
              <div className="flex items-center mb-4">
                <div className="flex justify-center mr-3">
                  {driver.profilePhotoUrl ? (
                    <img
                      src={driver.profilePhotoUrl}
                      alt={`${driver.firstName} ${driver.lastName}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center border-2 border-indigo-100">
                      <span className="text-white text-sm font-bold">
                        {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Message pour {driver.firstName} {driver.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {driver.workZone} • {driver.experience}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre message
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Rédigez votre message..."
                  disabled={sendingMessage}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {messageContent.length}/1000 caractères
                  </span>
                  {messageContent.length > 1000 && (
                    <span className="text-xs text-red-500">
                      Message trop long
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setShowMessageModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={sendingMessage}
            >
              Annuler
            </button>
            <button
              onClick={sendMessage}
              disabled={!messageContent.trim() || messageContent.length > 1000 || sendingMessage}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {sendingMessage ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Envoi...
                </div>
              ) : (
                'Envoyer le message'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation personnalisé */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
    </>
  );
}
