import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';
import { DeleteIcon, CheckIcon, WarningIcon, InfoIcon } from './ConfirmationIcons';

export default function TestConfirmation() {
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirmation();

  const testSuccess = async () => {
    const result = await confirm({
      title: "Message envoyé !",
      message: "Votre message a été envoyé à Philomé Évrard Baho. Il/elle le recevra dans sa messagerie.",
      confirmText: "OK",
      cancelText: "",
      type: "success",
      icon: <CheckIcon />
    });
    console.log('Résultat:', result);
  };

  const testError = async () => {
    const result = await confirm({
      title: "Erreur d'envoi",
      message: "Erreur lors de l'envoi du message.\n\nVeuillez réessayer ou contacter le support.",
      confirmText: "OK",
      cancelText: "",
      type: "danger",
      icon: <WarningIcon color="#DC2626" />
    });
    console.log('Résultat:', result);
  };

  const testDelete = async () => {
    const result = await confirm({
      title: "Supprimer l'offre ?",
      message: "Êtes-vous sûr de vouloir supprimer cette offre ?\nCette action ne peut pas être annulée.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
      icon: <DeleteIcon />
    });
    console.log('Résultat:', result);
  };

  const testInfo = async () => {
    const result = await confirm({
      title: "Information",
      message: "Ceci est un message d'information pour tester le modal.",
      confirmText: "Compris",
      cancelText: "Fermer",
      type: "info",
      icon: <InfoIcon />
    });
    console.log('Résultat:', result);
  };

  return (
    <div className="p-8 space-y-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test du système de confirmation</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testSuccess}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition block"
        >
          Test Message de Succès (comme l'envoi de message)
        </button>
        
        <button 
          onClick={testError}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition block"
        >
          Test Message d'Erreur
        </button>
        
        <button 
          onClick={testDelete}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition block"
        >
          Test Confirmation de Suppression
        </button>
        
        <button 
          onClick={testInfo}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition block"
        >
          Test Message d'Information
        </button>
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
    </div>
  );
}
