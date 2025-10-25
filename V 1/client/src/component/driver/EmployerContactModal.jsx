import { useState } from 'react';
import Modal from '../common/Modal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { CheckIcon, WarningIcon } from '../common/ConfirmationIcons';
import ConfirmationModal from '../common/ConfirmationModal';
import { contactService } from '../../services/api';

export default function EmployerContactModal({ isOpen, onClose, employer }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    phone: '',
    availability: 'immediate'
  });
  const [sending, setSending] = useState(false);
  const { confirm, isConfirmOpen, config, handleConfirm, handleCancel } = useConfirmation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      await confirm({
        title: "Champs requis",
        message: "Veuillez remplir le sujet et le message avant d'envoyer.",
        confirmText: "OK",
        cancelText: "",
        type: "danger",
        icon: <WarningIcon color="#DC2626" />
      });
      return;
    }

    setSending(true);
    
    try {
      // Envoyer le message via l'API
      await contactService.contactEmployer(employer._id, {
        subject: formData.subject,
        message: formData.message,
        phone: formData.phone,
        availability: formData.availability
      });
      
      // Fermer la modal
      onClose();
      
      // Reset du formulaire
      setFormData({
        subject: '',
        message: '',
        phone: '',
        availability: 'immediate'
      });
      
      // Message de succès
      await confirm({
        title: "Message envoyé !",
        message: `Votre message a été envoyé à ${employer?.companyName}. Ils vous contacteront bientôt.`,
        type: "success",
        icon: <CheckIcon />,
        autoClose: true,
        autoCloseDelay: 3000
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      
      let errorMessage = "Une erreur s'est produite lors de l'envoi de votre message.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      await confirm({
        title: "Erreur d'envoi",
        message: `${errorMessage}\n\nVeuillez réessayer ou contacter le support.`,
        confirmText: "OK",
        cancelText: "",
        type: "danger",
        icon: <WarningIcon color="#DC2626" />
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setFormData({
        subject: '',
        message: '',
        phone: '',
        availability: 'immediate'
      });
      onClose();
    }
  };

  if (!employer) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={`Contacter ${employer.companyName}`}>
        <div className="space-y-6">
          {/* Informations de l'employeur */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {employer.companyName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{employer.companyName}</h3>
                <p className="text-sm text-gray-600">{employer.sector} • {employer.location}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{employer.description}</p>
            {employer.activeOffers > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {employer.activeOffers} offre{employer.activeOffers > 1 ? 's' : ''} active{employer.activeOffers > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Formulaire de contact */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sujet */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choisissez un sujet</option>
                <option value="candidature-spontanee">Candidature spontanée</option>
                <option value="demande-information">Demande d'information</option>
                <option value="collaboration">Proposition de collaboration</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* Téléphone (optionnel) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Votre numéro de téléphone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Disponibilité */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilité
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="immediate">Immédiate</option>
                <option value="1-week">Dans la semaine</option>
                <option value="2-weeks">Dans 2 semaines</option>
                <option value="1-month">Dans le mois</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Présentez-vous et expliquez pourquoi vous souhaitez travailler avec cette entreprise..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.message.length}/1000 caractères
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={sending || !formData.subject.trim() || !formData.message.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {sending ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le message'
                )}
              </button>
            </div>
          </form>

          {/* Note informative */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Conseil :</strong> Personnalisez votre message en mentionnant des éléments spécifiques à l'entreprise pour augmenter vos chances de réponse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
    </>
  );
}
