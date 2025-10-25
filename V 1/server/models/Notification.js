const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        // Offres et candidatures
        'new_offer',
        'urgent_offer',
        'application_accepted',
        'application_rejected',
        'application_pending',
        'new_application',
        'application_withdrawn',
        'application_reminder',
        
        // Messages et communication
        'new_message',
        'contact_request',
        'interview_request',
        'driver_response',
        
        // Profil et compte
        'profile_validated',
        'profile_incomplete',
        'document_expiring',
        'document_expired',
        'update_required',
        'driver_profile_updated',
        'new_driver_available',
        'favorite_driver_available',
        
        // Missions
        'mission_confirmed',
        'mission_cancelled',
        'mission_modified',
        'mission_reminder',
        'mission_completed',
        'driver_late',
        
        // Paiements et évaluations
        'payment_received',
        'new_rating',
        'rating_request',
        
        // Offres (employeur)
        'offer_published',
        'offer_expired',
        'offer_no_applications',
        
        // Système
        'system_message',
        'security_alert',
        'activity_reminder',
        'promotion'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    actionUrl: {
      type: String,
      trim: true
    },
    actionText: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['urgent', 'important', 'info', 'reminder'],
      default: 'info'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Méthode pour marquer comme lue
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Méthode statique pour créer une notification
notificationSchema.statics.createNotification = function(userId, type, title, message, data = {}) {
  return this.create({
    userId,
    type,
    title,
    message,
    data
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
