const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'new_offer',
        'urgent_offer',
        'application_accepted',
        'application_rejected',
        'profile_validation',
        'document_expiring',
        'payment_received',
        'mission_update',
        'mission_completed',
        'rating_received',
        'driver_profile_updated',
        'admin_message'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index pour optimiser les requêtes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
