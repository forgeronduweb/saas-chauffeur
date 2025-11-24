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
  
  // Statut de la candidature avec workflow intelligent
  status: {
    type: String,
    enum: [
      'pending',                    // Candidature envoyée, en attente
      'in_negotiation',            // Discussion en cours via messagerie
      'awaiting_final_decision',   // Proposition finale envoyée, décision requise
      'accepted',                  // Candidature acceptée par le chauffeur
      'rejected',                  // Candidature refusée par le chauffeur
      'withdrawn',                 // Candidature retirée par le chauffeur
      'employer_rejected'          // Candidature refusée par l'employeur
    ],
    default: 'pending'
  },
  
  // Message initial du chauffeur
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Analyse automatique du message
  messageAnalysis: {
    needsConversation: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    detectedKeywords: [{
      type: String
    }],
    reason: {
      type: String
    }
  },
  
  // Référence à la conversation (si créée)
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    default: null
  },
  
  // Indique si une conversation a été créée
  hasConversation: {
    type: Boolean,
    default: false
  },
  
  // Message de motivation du chauffeur (legacy - à supprimer progressivement)
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
  
  // Historique des changements de statut
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String
    }
  }],
  
  // Date de candidature
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Date de réponse de l'employeur
  respondedAt: {
    type: Date
  },
  
  // Date de la décision finale du chauffeur
  finalDecisionAt: {
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
  },
  
  // Proposition finale de l'employeur
  finalOffer: {
    salary: {
      type: Number
    },
    startDate: {
      type: Date
    },
    conditions: {
      type: String
    },
    sentAt: {
      type: Date
    }
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
