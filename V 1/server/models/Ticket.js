const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['complaint', 'payment_issue', 'technical', 'account_issue', 'fraud_report', 'other'],
      required: true
    },
    category: {
      type: String,
      enum: ['driver_issue', 'employer_issue', 'platform_issue', 'payment', 'technical', 'general'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
      default: 'open'
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [1000, 'La résolution ne peut pas dépasser 1000 caractères']
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    attachments: [{
      filename: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      mimetype: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    relatedMission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    relatedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    internalNotes: [{
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      note: {
        type: String,
        required: true,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    responses: [{
      responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      isAdminResponse: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
ticketSchema.index({ userId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ type: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual pour récupérer les informations de l'utilisateur
ticketSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations de l'admin assigné
ticketSchema.virtual('assignedAdmin', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Virtual pour calculer le temps de résolution
ticketSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt) return null;
  const diffTime = Math.abs(this.resolvedAt - this.createdAt);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours;
});

// Virtual pour vérifier si le ticket est en retard
ticketSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') return false;
  
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  
  // Définir les SLA selon la priorité
  const slaHours = {
    urgent: 2,
    high: 8,
    medium: 24,
    low: 72
  };
  
  return diffHours > slaHours[this.priority];
});

// Méthode pour assigner le ticket
ticketSchema.methods.assign = function(adminId) {
  this.assignedTo = adminId;
  this.status = 'in_progress';
  return this.save();
};

// Méthode pour résoudre le ticket
ticketSchema.methods.resolve = function(resolution, adminId) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.assignedTo = adminId;
  return this.save();
};

// Méthode pour fermer le ticket
ticketSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Méthode pour ajouter une réponse
ticketSchema.methods.addResponse = function(responderId, message, isAdmin = false) {
  this.responses.push({
    responderId: responderId,
    message: message,
    isAdminResponse: isAdmin
  });
  
  if (!isAdmin && this.status === 'waiting_response') {
    this.status = 'in_progress';
  }
  
  return this.save();
};

module.exports = mongoose.model('Ticket', ticketSchema);
