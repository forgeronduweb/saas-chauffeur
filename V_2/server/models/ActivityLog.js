const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Type d'activité
  activityType: {
    type: String,
    enum: [
      'login',
      'logout',
      'profile_update',
      'offer_created',
      'offer_updated',
      'offer_deleted',
      'application_sent',
      'application_received',
      'application_accepted',
      'application_rejected',
      'message_sent',
      'message_received',
      'document_uploaded',
      'password_changed',
      'account_suspended',
      'account_reactivated',
      'notification_sent',
      'page_view',
      'search',
      'other'
    ],
    required: true
  },
  
  // Description de l'activité
  description: {
    type: String,
    required: true
  },
  
  // Détails supplémentaires
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Adresse IP
  ipAddress: {
    type: String
  },
  
  // User Agent (navigateur, appareil)
  userAgent: {
    type: String
  },
  
  // Durée de session (pour login/logout)
  sessionDuration: {
    type: Number, // en minutes
    default: null
  },
  
  // Référence à une ressource liée (optionnel)
  relatedResource: {
    resourceType: {
      type: String,
      enum: ['offer', 'application', 'message', 'driver', 'employer', 'notification']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1 });
activityLogSchema.index({ createdAt: -1 });

// Méthode statique pour logger une activité
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = await this.create({
      userId: data.userId,
      activityType: data.activityType,
      description: data.description,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionDuration: data.sessionDuration,
      relatedResource: data.relatedResource
    });
    return log;
  } catch (error) {
    console.error('Erreur lors du logging d\'activité:', error);
    return null;
  }
};

// Méthode statique pour obtenir les activités d'un utilisateur
activityLogSchema.statics.getUserActivities = async function(userId, options = {}) {
  const { limit = 50, page = 1, activityType } = options;
  
  const filter = { userId };
  if (activityType) {
    filter.activityType = activityType;
  }
  
  const activities = await this.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
    
  const total = await this.countDocuments(filter);
  
  return {
    activities,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
