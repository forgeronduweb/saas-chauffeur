const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['employer', 'driver', 'client'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
    },
    type: {
      type: String,
      enum: ['text', 'system', 'offer_link', 'contact_info'],
      default: 'text'
    },
    metadata: {
      offerTitle: String,
      offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
      },
      contactInfo: {
        phone: String,
        email: String
      }
    },
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
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual pour vérifier si le message est lu par un utilisateur
messageSchema.virtual('isReadBy').get(function() {
  return (userId) => {
    return this.readBy.some(read => read.userId.toString() === userId.toString());
  };
});

// Méthode pour marquer comme lu par un utilisateur
messageSchema.methods.markAsReadBy = function(userId) {
  const alreadyRead = this.readBy.find(read => read.userId.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this;
};

// Méthode pour éditer le message
messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this;
};

// Méthode pour supprimer le message (soft delete)
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'Ce message a été supprimé';
  return this;
};

// Middleware pour mettre à jour la conversation après chaque nouveau message
messageSchema.post('save', async function(message) {
  if (message.isNew && !message.isDeleted) {
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      conversation.updateLastMessage(message.content, message.senderId);
      await conversation.save();
    }
  }
});

module.exports = mongoose.model('Message', messageSchema);
