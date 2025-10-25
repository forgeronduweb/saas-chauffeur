import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';
import { DeleteIcon, CheckIcon, WarningIcon, LogoutIcon } from './ConfirmationIcons';

export default function ExampleUsage() {
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirmation();

  const handleDeleteOffer = async () => {
    const confirmed = await confirm({
      title: "Supprimer l'offre ?",
      message: "Êtes-vous sûr de vouloir supprimer cette offre ? Cette action ne peut pas être annulée.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
      icon: <DeleteIcon />
    });

    if (confirmed) {
      console.log("Offre supprimée !");
      // Logique de suppression ici
    }
  };

  const handleValidateProfile = async () => {
    const confirmed = await confirm({
      title: "Valider le profil ?",
      message: "Confirmer la validation de ce profil chauffeur ? Il sera immédiatement activé.",
      confirmText: "Valider",
      cancelText: "Annuler",
      type: "success",
      icon: <CheckIcon />
    });

    if (confirmed) {
      console.log("Profil validé !");
      // Logique de validation ici
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Se déconnecter ?",
      message: "Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.",
      confirmText: "Se déconnecter",
      cancelText: "Rester connecté",
      type: "warning",
      icon: <LogoutIcon color="#D97706" />
    });

    if (confirmed) {
      console.log("Déconnexion !");
      // Logique de déconnexion ici
    }
  };

  const handleArchiveOffer = async () => {
    const confirmed = await confirm({
      title: "Archiver l'offre ?",
      message: "Cette offre sera déplacée dans les archives et ne sera plus visible par les chauffeurs.",
      confirmText: "Archiver",
      cancelText: "Annuler",
      type: "warning",
      icon: <WarningIcon />
    });

    if (confirmed) {
      console.log("Offre archivée !");
      // Logique d'archivage ici
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Exemples d'utilisation du modal de confirmation</h2>
      
      <button 
        onClick={handleDeleteOffer}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Supprimer une offre (Danger)
      </button>
      
      <button 
        onClick={handleValidateProfile}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ml-4"
      >
        Valider un profil (Success)
      </button>
      
      <button 
        onClick={handleLogout}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition ml-4"
      >
        Se déconnecter (Warning)
      </button>
      
      <button 
        onClick={handleArchiveOffer}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition ml-4"
      >
        Archiver une offre (Warning)
      </button>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
    </div>
  );
}
