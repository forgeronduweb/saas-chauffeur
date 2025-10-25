const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['Personnel', 'Livraison', 'VTC', 'Transport', 'Autre'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    schedule: {
      type: String,
      trim: true
    },
    location: {
      startAddress: {
        type: String,
        trim: true
      },
      endAddress: {
        type: String,
        trim: true
      },
      startCoordinates: {
        latitude: Number,
        longitude: Number
      },
      endCoordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    payment: {
      amount: {
        type: Number,
        required: true,
        min: [0, 'Le montant doit être positif']
      },
      type: {
        type: String,
        enum: ['horaire', 'journalier', 'mensuel', 'mission'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
      },
      paidAt: {
        type: Date
      }
    },
    contact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
    },
    rating: {
      driverRating: {
        type: Number,
        min: 1,
        max: 5
      },
      employerRating: {
        type: Number,
        min: 1,
        max: 5
      },
      driverComment: {
        type: String,
        trim: true,
        maxlength: [300, 'Le commentaire ne peut pas dépasser 300 caractères']
      },
      employerComment: {
        type: String,
        trim: true,
        maxlength: [300, 'Le commentaire ne peut pas dépasser 300 caractères']
      }
    },
    completedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancelReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
missionSchema.index({ driverId: 1 });
missionSchema.index({ employerId: 1 });
missionSchema.index({ status: 1 });
missionSchema.index({ startDate: 1 });
missionSchema.index({ createdAt: -1 });

// Virtual pour récupérer les informations de l'offre
missionSchema.virtual('offer', {
  ref: 'Offer',
  localField: 'offerId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations du chauffeur
missionSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations de l'employeur
missionSchema.virtual('employer', {
  ref: 'User',
  localField: 'employerId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour calculer la durée de la mission
missionSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Méthode pour marquer la mission comme terminée
missionSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.payment.status = 'pending'; // En attente de paiement
  return this.save();
};

// Méthode pour annuler la mission
missionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.payment.status = 'cancelled';
  return this.save();
};

// Méthode pour marquer le paiement comme effectué
missionSchema.methods.markAsPaid = function() {
  this.payment.status = 'paid';
  this.payment.paidAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Mission', missionSchema);
