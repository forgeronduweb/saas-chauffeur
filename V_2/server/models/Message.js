const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.Mixed, // Accepte ObjectId ou string pour les conversations temporaires
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  type: {
    type: String,
    enum: ['text', 'system', 'attachment', 'voice'],
    default: 'text'
  },
  
  // Pour les pièces jointes
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'pdf']
    },
    url: String,
    name: String,
    size: Number
  }],
  
  // Métadonnées (pour messages système)
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Statut de lecture
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message supprimé
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
  // Message modifié
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date
}, {
  timestamps: true
});

// Index pour recherche rapide
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

// Méthode pour marquer comme lu
messageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(r => r.userId.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthode pour vérifier si lu par un utilisateur
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.userId.toString() === userId.toString());
};

module.exports = mongoose.model('Message', messageSchema);
