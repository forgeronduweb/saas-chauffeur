const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Référence à l'offre
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  
  // Référence au chauffeur qui postule
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Référence à l'employeur qui a publié l'offre
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Statut de la candidature
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Message de motivation du chauffeur
  coverLetter: {
    type: String,
    trim: true
  },
  
  // Disponibilité proposée
  availability: {
    type: String,
    trim: true
  },
  
  // Prétention salariale
  salaryExpectation: {
    type: String,
    trim: true
  },
  
  // Date de candidature
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Date de réponse de l'employeur
  respondedAt: {
    type: Date
  },
  
  // Raison du rejet (si applicable)
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Notes de l'employeur
  employerNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
applicationSchema.index({ offerId: 1, driverId: 1 }, { unique: true });
applicationSchema.index({ employerId: 1, status: 1 });
applicationSchema.index({ driverId: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
