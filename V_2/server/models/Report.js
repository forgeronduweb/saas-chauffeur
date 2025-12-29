const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Type de contenu signalé
  targetType: {
    type: String,
    enum: ['offer', 'product', 'driver', 'employer'],
    required: true
  },
  // ID du contenu signalé
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  // Utilisateur qui signale
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Raison du signalement
  reason: {
    type: String,
    enum: [
      'spam',
      'inappropriate',
      'fraud',
      'misleading',
      'harassment',
      'other'
    ],
    required: true
  },
  // Description détaillée
  description: {
    type: String,
    maxlength: 1000
  },
  // Statut du signalement
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  // Notes de l'admin
  adminNotes: {
    type: String
  },
  // Admin qui a traité le signalement
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour éviter les signalements en double
reportSchema.index({ targetType: 1, targetId: 1, reporterId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
