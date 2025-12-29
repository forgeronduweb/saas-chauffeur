const Notification = require('../models/Notification');

// Configuration des types de notifications avec leurs priorités et messages par défaut
const notificationConfig = {
  // OFFRES ET CANDIDATURES
  new_offer: {
    priority: 'important',
    getTitle: () => 'Nouvelle offre disponible',
    getMessage: (data) => `Une nouvelle offre "${data.offerTitle}" correspond à votre profil`,
    getActionText: () => 'Voir l\'offre',
    getActionUrl: (data) => `/driver-dashboard/offers/${data.offerId}`
  },
  
  urgent_offer: {
    priority: 'urgent',
    getTitle: () => 'Offre urgente !',
    getMessage: (data) => `Offre urgente : "${data.offerTitle}" - Besoin immédiat`,
    getActionText: () => 'Postuler maintenant',
    getActionUrl: (data) => `/driver-dashboard/offers/${data.offerId}`
  },
  
  application_accepted: {
    priority: 'urgent',
    getTitle: () => 'Candidature acceptée',
    getMessage: (data) => `Félicitations ! Votre candidature pour "${data.offerTitle}" a été acceptée`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/driver-dashboard/applications/${data.applicationId}`
  },
  
  application_rejected: {
    priority: 'important',
    getTitle: () => 'Candidature refusée',
    getMessage: (data) => `Votre candidature pour "${data.offerTitle}" n'a pas été retenue`,
    getActionText: () => 'Voir d\'autres offres',
    getActionUrl: () => '/driver-dashboard/offers'
  },
  
  new_application: {
    priority: 'important',
    getTitle: () => 'Nouvelle candidature',
    getMessage: (data) => `${data.driverName} a postulé pour "${data.offerTitle}"`,
    getActionText: () => 'Voir la candidature',
    getActionUrl: (data) => `/dashboard/candidates`
  },
  
  application_withdrawn: {
    priority: 'info',
    getTitle: () => 'Candidature retirée',
    getMessage: (data) => `${data.driverName} a retiré sa candidature pour "${data.offerTitle}"`,
    getActionText: () => 'Voir les candidatures',
    getActionUrl: () => '/dashboard/candidates'
  },
  
  // MESSAGES ET COMMUNICATION
  new_message: {
    priority: 'urgent',
    getTitle: () => 'Nouveau message',
    getMessage: (data) => `${data.senderName} vous a envoyé un message`,
    getActionText: () => 'Lire le message',
    getActionUrl: (data) => `/messages/${data.conversationId}`
  },
  
  contact_request: {
    priority: 'important',
    getTitle: () => 'Demande de coordonnées',
    getMessage: (data) => `${data.employerName} demande vos coordonnées`,
    getActionText: () => 'Répondre',
    getActionUrl: (data) => `/messages/${data.conversationId}`
  },
  
  interview_request: {
    priority: 'urgent',
    getTitle: () => 'Demande d\'entretien',
    getMessage: (data) => `${data.employerName} souhaite vous rencontrer pour un entretien`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/messages/${data.conversationId}`
  },
  
  // PROFIL ET COMPTE
  profile_validated: {
    priority: 'info',
    getTitle: () => 'Profil validé',
    getMessage: () => 'Votre profil a été validé ! Vous pouvez maintenant postuler aux offres',
    getActionText: () => 'Voir mon profil',
    getActionUrl: () => '/driver-dashboard/profile'
  },
  
  profile_incomplete: {
    priority: 'reminder',
    getTitle: () => 'Profil incomplet',
    getMessage: () => 'Complétez votre profil pour augmenter vos chances d\'être recruté',
    getActionText: () => 'Compléter mon profil',
    getActionUrl: () => '/driver-dashboard/profile'
  },
  
  document_expiring: {
    priority: 'important',
    getTitle: () => 'Document bientôt expiré',
    getMessage: (data) => `Votre ${data.documentType} expire le ${data.expiryDate}`,
    getActionText: () => 'Mettre à jour',
    getActionUrl: () => '/driver-dashboard/profile'
  },
  
  document_expired: {
    priority: 'urgent',
    getTitle: () => 'Document expiré',
    getMessage: (data) => `Votre ${data.documentType} a expiré. Veuillez le renouveler`,
    getActionText: () => 'Mettre à jour',
    getActionUrl: () => '/driver-dashboard/profile'
  },
  
  driver_profile_updated: {
    priority: 'info',
    getTitle: () => 'Profil chauffeur mis à jour',
    getMessage: (data) => `${data.driverName} a mis à jour son profil`,
    getActionText: () => 'Voir le profil',
    getActionUrl: (data) => `/dashboard/drivers/${data.driverId}`
  },
  
  new_driver_available: {
    priority: 'important',
    getTitle: () => 'Nouveau chauffeur disponible',
    getMessage: (data) => `Un nouveau chauffeur correspondant à vos critères est disponible`,
    getActionText: () => 'Voir le profil',
    getActionUrl: (data) => `/dashboard/drivers/${data.driverId}`
  },
  
  // MISSIONS
  mission_confirmed: {
    priority: 'important',
    getTitle: () => 'Mission confirmée',
    getMessage: (data) => `Votre mission "${data.missionTitle}" est confirmée`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  mission_cancelled: {
    priority: 'urgent',
    getTitle: () => 'Mission annulée',
    getMessage: (data) => `La mission "${data.missionTitle}" a été annulée`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  mission_modified: {
    priority: 'important',
    getTitle: () => 'Mission modifiée',
    getMessage: (data) => `La mission "${data.missionTitle}" a été modifiée`,
    getActionText: () => 'Voir les changements',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  mission_reminder: {
    priority: 'reminder',
    getTitle: () => 'Rappel de mission',
    getMessage: (data) => `Votre mission "${data.missionTitle}" commence dans ${data.timeUntil}`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  mission_completed: {
    priority: 'info',
    getTitle: () => 'Mission terminée',
    getMessage: (data) => `La mission "${data.missionTitle}" est terminée`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  // PAIEMENTS ET ÉVALUATIONS
  payment_received: {
    priority: 'info',
    getTitle: () => 'Paiement reçu',
    getMessage: (data) => `Vous avez reçu ${data.amount} FCFA pour la mission "${data.missionTitle}"`,
    getActionText: () => 'Voir les détails',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  new_rating: {
    priority: 'info',
    getTitle: () => 'Nouvelle évaluation',
    getMessage: (data) => `${data.employerName} vous a évalué : ${data.rating}/5`,
    getActionText: () => 'Voir l\'évaluation',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  rating_request: {
    priority: 'reminder',
    getTitle: () => 'Demande d\'évaluation',
    getMessage: (data) => `Évaluez votre expérience avec ${data.name}`,
    getActionText: () => 'Évaluer',
    getActionUrl: (data) => `/missions/${data.missionId}`
  },
  
  // OFFRES (EMPLOYEUR)
  offer_published: {
    priority: 'info',
    getTitle: () => 'Offre publiée',
    getMessage: (data) => `Votre offre "${data.offerTitle}" a été publiée avec succès`,
    getActionText: () => 'Voir l\'offre',
    getActionUrl: (data) => `/dashboard/offers/${data.offerId}`
  },
  
  offer_expired: {
    priority: 'reminder',
    getTitle: () => 'Offre expirée',
    getMessage: (data) => `Votre offre "${data.offerTitle}" a expiré`,
    getActionText: () => 'Republier',
    getActionUrl: (data) => `/dashboard/offers/${data.offerId}`
  },
  
  offer_no_applications: {
    priority: 'reminder',
    getTitle: () => 'Aucune candidature',
    getMessage: (data) => `Votre offre "${data.offerTitle}" n'a reçu aucune candidature`,
    getActionText: () => 'Modifier l\'offre',
    getActionUrl: (data) => `/dashboard/offers/${data.offerId}`
  },
  
  // SYSTÈME
  system_message: {
    priority: 'info',
    getTitle: (data) => data.title || 'Message système',
    getMessage: (data) => data.message,
    getActionText: (data) => data.actionText,
    getActionUrl: (data) => data.actionUrl
  },
  
  security_alert: {
    priority: 'urgent',
    getTitle: () => 'Alerte de sécurité',
    getMessage: (data) => data.message,
    getActionText: () => 'Vérifier',
    getActionUrl: () => '/settings/security'
  },
  
  activity_reminder: {
    priority: 'reminder',
    getTitle: () => 'Nous vous avons manqué !',
    getMessage: () => 'De nouvelles opportunités vous attendent',
    getActionText: () => 'Voir les offres',
    getActionUrl: () => '/driver-dashboard/offers'
  },
  
  promotion: {
    priority: 'info',
    getTitle: (data) => data.title || 'Nouveauté',
    getMessage: (data) => data.message,
    getActionText: (data) => data.actionText,
    getActionUrl: (data) => data.actionUrl
  },

  // SIGNALEMENTS (ADMIN)
  new_report: {
    priority: 'urgent',
    getTitle: () => 'Nouveau signalement',
    getMessage: (data) => `Nouveau signalement: ${data.reason} sur ${data.targetType}`,
    getActionText: () => 'Traiter',
    getActionUrl: () => '/reports'
  },

  report_resolved: {
    priority: 'info',
    getTitle: () => 'Signalement traité',
    getMessage: (data) => `Votre signalement a été traité: ${data.status}`,
    getActionText: () => 'Voir',
    getActionUrl: () => '/'
  },

  content_action: {
    priority: 'urgent',
    getTitle: () => 'Action sur votre contenu',
    getMessage: (data) => data.message || `Une action a été prise sur votre ${data.targetType}`,
    getActionText: () => 'Voir',
    getActionUrl: () => '/'
  }
};

/**
 * Créer et envoyer une notification
 * @param {String} userId - ID de l'utilisateur destinataire
 * @param {String} type - Type de notification
 * @param {Object} data - Données pour personnaliser la notification
 */
async function createNotification(userId, type, data = {}) {
  try {
    const config = notificationConfig[type];
    
    if (!config) {
      console.error(`Type de notification inconnu: ${type}`);
      return null;
    }
    
    const notification = await Notification.create({
      userId,
      type,
      title: typeof config.getTitle === 'function' ? config.getTitle(data) : config.getTitle,
      message: typeof config.getMessage === 'function' ? config.getMessage(data) : config.getMessage,
      priority: config.priority,
      actionText: config.getActionText ? config.getActionText(data) : undefined,
      actionUrl: config.getActionUrl ? config.getActionUrl(data) : undefined,
      data
    });
    
    console.log(`✅ Notification créée: ${type} pour user ${userId}`);
    return notification;
    
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
}

/**
 * Créer des notifications pour plusieurs utilisateurs
 */
async function createBulkNotifications(userIds, type, data = {}) {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => createNotification(userId, type, data))
    );
    
    console.log(`✅ ${notifications.length} notifications créées`);
    return notifications;
    
  } catch (error) {
    console.error('Erreur lors de la création des notifications en masse:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  notificationConfig
};
