const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Contexte de la conversation (offre, candidature, etc.)
  context: {
    type: {
      type: String,
      enum: ['offer_application', 'direct_contact', 'driver_inquiry', 'product_inquiry'],
      default: 'direct_contact'
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    }
  },
  
  // Dernier message pour affichage rapide
  lastMessage: {
    content: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'system', 'attachment'],
      default: 'text'
    }
  },
  
  // Compteur de messages non lus par participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // Statut de la conversation
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Utilisateurs bloqués
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Métadonnées
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ updatedAt: -1 });

// Méthode pour vérifier si un utilisateur est participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Méthode pour obtenir l'autre participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Méthode pour incrémenter le compteur de non lus
conversationSchema.methods.incrementUnread = function(userId) {
  const count = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), count + 1);
  return this.save();
};

// Méthode pour réinitialiser le compteur de non lus
conversationSchema.methods.resetUnread = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
