const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // Référence à l'offre boostée
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  
  // Référence à l'utilisateur qui boost
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type de boost
  type: {
    type: String,
    enum: ['featured', 'premium', 'urgent', 'custom'],
    required: true
  },
  
  // Durée du boost en jours
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 45
  },
  
  // Prix payé pour le boost
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Date de début du boost
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // Date de fin du boost
  endDate: {
    type: Date,
    required: true
  },
  
  // Statut du boost
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Texte publicitaire personnalisé
  boostText: {
    type: String,
    maxlength: 200
  },
  
  // URL de l'image publicitaire
  boostImageUrl: {
    type: String
  },
  
  // Statistiques du boost
  stats: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    contacts: {
      type: Number,
      default: 0
    }
  },
  
  // Informations de paiement
  payment: {
    transactionId: String,
    method: {
      type: String,
      enum: ['card', 'mobile_money', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les requêtes
promotionSchema.index({ offerId: 1 });
promotionSchema.index({ userId: 1 });
promotionSchema.index({ status: 1, endDate: 1 });
promotionSchema.index({ type: 1, status: 1 });

// Middleware pour mettre à jour updatedAt
promotionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour vérifier si le boost est actif
promotionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Méthode pour calculer le temps restant
promotionSchema.methods.getRemainingTime = function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = this.endDate - now;
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))); // en jours
};

module.exports = mongoose.model('Promotion', promotionSchema);
