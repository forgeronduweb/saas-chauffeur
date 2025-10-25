import { useState } from 'react';
import Modal from '../common/Modal';
import MessageModal from '../common/MessageModal';
import { messagesApi } from '../../services/api';

export default function DriverProfileModal({ isOpen, onClose, application }) {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  if (!application || !application.driver) return null;

  const { driver, offer, message, createdAt, status } = application;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return 'Inconnu';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil du chauffeur"
      size="lg"
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Informations personnelles */}
        <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
          <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <svg className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations personnelles
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
              <p className="text-sm lg:text-base text-gray-900 font-medium">{driver.firstName || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
              <p className="text-sm lg:text-base text-gray-900 font-medium">{driver.lastName || 'Non renseigné'}</p>
            </div>
            
            {driver.rating && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Évaluation</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm lg:text-base text-gray-900 font-medium">{driver.rating}/5</span>
                  <span className="text-sm text-gray-500">({driver.totalRides || 0} missions)</span>
                </div>
              </div>
            )}
            
            {driver.workZone && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Zone de travail</label>
                <p className="text-sm lg:text-base text-gray-900 font-medium">{driver.workZone}</p>
              </div>
            )}
            
            {driver.vehicleType && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type de véhicule</label>
                <p className="text-sm lg:text-base text-gray-900 font-medium">{driver.vehicleType}</p>
              </div>
            )}
            
            {driver.vehicleBrand && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Marque du véhicule</label>
                <p className="text-sm lg:text-base text-gray-900 font-medium">{driver.vehicleBrand}</p>
              </div>
            )}
            
            {driver.specialties && driver.specialties.length > 0 && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Spécialités</label>
                <div className="flex flex-wrap gap-2">
                  {driver.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations sur la candidature */}
        <div className="bg-blue-50 rounded-lg p-3 lg:p-4">
          <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center">
            <svg className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Détails de la candidature
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Offre</label>
              <p className="text-gray-900 font-medium">{offer?.title || 'Offre non disponible'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date de candidature</label>
                <p className="text-gray-900 font-medium">
                  {new Date(createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {offer?.location && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Lieu de mission</label>
                <p className="text-gray-900 font-medium">
                  {offer.location.city}
                  {offer.location.address && `, ${offer.location.address}`}
                </p>
              </div>
            )}

            {offer?.salary && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Salaire proposé</label>
                <p className="text-gray-900 font-medium">{offer.salary} FCFA</p>
              </div>
            )}
          </div>
        </div>

        {/* Informations supplémentaires du chauffeur */}
        {(driver.experience || driver.licenseType || driver.availability) && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informations professionnelles
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driver.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Expérience</label>
                  <p className="text-gray-900 font-medium">{driver.experience}</p>
                </div>
              )}
              {driver.licenseType && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type de permis</label>
                  <p className="text-gray-900 font-medium">{driver.licenseType}</p>
                </div>
              )}
              {driver.availability && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Disponibilité</label>
                  <p className="text-gray-900 font-medium">{driver.availability}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Fermer
        </button>
        
        {/* Bouton de messagerie interne */}
        <button
          onClick={() => setIsMessageModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Envoyer un message
        </button>
      </div>

      {/* Modale de messagerie */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipient={driver}
        onSend={async (messageData) => {
          try {
            console.log('📤 Préparation envoi du message');
            console.log('Driver object:', driver);
            console.log('Application object:', application);
            console.log('Message data:', messageData);
            
            const payload = {
              recipientId: driver._id,
              message: messageData.message,
              applicationId: application._id
            };
            
            console.log('📦 Payload à envoyer:', payload);
            
            // Envoyer le message via l'API
            const response = await messagesApi.send(payload);
            
            console.log('✅ Réponse API:', response.data);
            
            // Afficher un message de succès
            alert(`Message envoyé avec succès à ${driver.firstName} ${driver.lastName} !\n\nLe chauffeur recevra une notification.`);
          } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
            throw error; // Pour que MessageModal gère l'erreur
          }
        }}
      />
    </Modal>
  );
}
