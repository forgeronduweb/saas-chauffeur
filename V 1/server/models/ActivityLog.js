const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'L\'action ne peut pas dépasser 100 caractères']
    },
    resource: {
      type: String,
      required: true,
      enum: ['user', 'driver', 'offer', 'mission', 'application', 'vehicle', 'transaction', 'ticket', 'notification'],
      index: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info'
    },
    category: {
      type: String,
      enum: ['auth', 'crud', 'admin', 'payment', 'security', 'system'],
      required: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    sessionId: {
      type: String,
      trim: true
    },
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ category: 1 });
activityLogSchema.index({ severity: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ success: 1 });

// Index composé pour les requêtes fréquentes
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });

// Virtual pour récupérer les informations de l'utilisateur
activityLogSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Méthode statique pour logger une activité
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log:', error);
    return null;
  }
};

// Méthode statique pour logger une action CRUD
activityLogSchema.statics.logCRUD = async function(userId, action, resource, resourceId, changes = null, req = null) {
  const logData = {
    userId: userId,
    action: action,
    resource: resource,
    resourceId: resourceId,
    category: 'crud',
    changes: changes
  };

  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
    logData.sessionId = req.sessionID;
  }

  return this.logActivity(logData);
};

// Méthode statique pour logger une action admin
activityLogSchema.statics.logAdmin = async function(adminId, action, resource, resourceId, details = null, req = null) {
  const logData = {
    userId: adminId,
    action: action,
    resource: resource,
    resourceId: resourceId,
    category: 'admin',
    details: details,
    severity: 'warning' // Les actions admin sont importantes
  };

  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
    logData.sessionId = req.sessionID;
  }

  return this.logActivity(logData);
};

// Méthode statique pour logger une erreur de sécurité
activityLogSchema.statics.logSecurity = async function(userId, action, details, req = null) {
  const logData = {
    userId: userId,
    action: action,
    resource: 'user',
    resourceId: userId,
    category: 'security',
    severity: 'critical',
    details: details,
    success: false
  };

  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
    logData.sessionId = req.sessionID;
  }

  return this.logActivity(logData);
};

// Méthode statique pour nettoyer les anciens logs
activityLogSchema.statics.cleanup = async function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({ createdAt: { $lt: cutoffDate } });
  console.log(`Nettoyage des logs: ${result.deletedCount} entrées supprimées`);
  
  return result;
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
