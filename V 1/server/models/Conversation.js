const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['employer', 'driver', 'client'],
        required: true
      },
      name: {
        type: String,
        required: true
      },
      avatar: String
    }],
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    isActive: {
      type: Boolean,
      default: true
    },
    context: {
      type: {
        type: String,
        enum: ['profile_contact', 'offer_application', 'direct_offer', 'general'],
        default: 'general'
      },
      relatedId: {
        type: mongoose.Schema.Types.ObjectId
      },
      title: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ updatedAt: -1 });

// Virtual pour récupérer les messages
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId'
});

// Méthode pour ajouter un participant
conversationSchema.methods.addParticipant = function(userId, role, name, avatar) {
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({ userId, role, name, avatar });
  }
  return this;
};

// Méthode pour mettre à jour le dernier message
conversationSchema.methods.updateLastMessage = function(content, senderId) {
  this.lastMessage = {
    content: content.substring(0, 100), // Limiter à 100 caractères
    senderId,
    timestamp: new Date()
  };
  
  // Incrémenter le compteur de messages non lus pour les autres participants
  this.participants.forEach(participant => {
    if (participant.userId.toString() !== senderId.toString()) {
      const currentCount = this.unreadCount.get(participant.userId.toString()) || 0;
      this.unreadCount.set(participant.userId.toString(), currentCount + 1);
    }
  });
  
  return this;
};

// Méthode pour marquer comme lu
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this;
};

// Méthode statique pour trouver ou créer une conversation
conversationSchema.statics.findOrCreate = async function(participant1, participant2, context = {}) {
  const participants = [participant1, participant2].sort((a, b) => 
    a.userId.toString().localeCompare(b.userId.toString())
  );
  
  let conversation = await this.findOne({
    'participants.userId': { $all: [participant1.userId, participant2.userId] }
  });
  
  if (!conversation) {
    conversation = new this({
      participants,
      context,
      unreadCount: new Map()
    });
    await conversation.save();
  }
  
  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
