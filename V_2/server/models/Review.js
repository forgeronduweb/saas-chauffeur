const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Référence au produit/offre
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  
  // Référence à l'utilisateur qui laisse l'avis
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Note de 1 à 5 étoiles
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Commentaire textuel
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Statut de modération
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approuvé pour l'instant
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
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

// Middleware pour mettre à jour updatedAt
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Empêcher qu'un utilisateur laisse plusieurs avis sur le même produit
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
