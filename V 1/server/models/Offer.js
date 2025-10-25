const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
    },
    type: {
      type: String,
      required: true,
      enum: ['Personnel', 'Livraison', 'VTC', 'Transport', 'Autre'],
      default: 'Personnel'
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requirements: {
      licenseType: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        default: 'B'
      },
      experience: {
        type: String,
        enum: ['Débutant', '1-3 ans', '3-5 ans', '5+ ans'],
        default: '1-3 ans'
      },
      vehicleType: {
        type: String,
        enum: ['berline', 'suv', 'utilitaire', 'moto', 'van', 'autre']
      },
      zone: {
        type: String,
        required: true,
        trim: true
      }
    },
    conditions: {
      salary: {
        type: Number,
        min: [0, 'Le salaire doit être positif']
      },
      salaryType: {
        type: String,
        enum: ['horaire', 'journalier', 'mensuel', 'mission'],
        default: 'horaire'
      },
      workType: {
        type: String,
        enum: ['temps_plein', 'temps_partiel', 'ponctuel', 'weekend'],
        default: 'temps_plein'
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
      }
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'completed'],
      default: 'active'
    },
    location: {
      address: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    applicationCount: {
      type: Number,
      default: 0
    },
    maxApplications: {
      type: Number,
      default: 50
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    isDirect: {
      type: Boolean,
      default: false
    },
    targetDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    tags: [{
      type: String,
      trim: true
    }],
    contactInfo: {
      phone: String,
      email: String,
      preferredContact: {
        type: String,
        enum: ['phone', 'email', 'platform'],
        default: 'platform'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
offerSchema.index({ employerId: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ 'requirements.zone': 1 });
offerSchema.index({ type: 1 });
offerSchema.index({ createdAt: -1 });

// Virtual pour récupérer les informations de l'employeur
offerSchema.virtual('employer', {
  ref: 'User',
  localField: 'employerId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour calculer si l'offre est récente (moins de 7 jours)
offerSchema.virtual('isRecent').get(function() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return this.createdAt > weekAgo;
});

// Méthode pour vérifier si l'offre peut recevoir plus de candidatures
offerSchema.methods.canReceiveApplications = function() {
  return this.status === 'active' && this.applicationCount < this.maxApplications;
};

// Middleware pour incrémenter le compteur de candidatures
offerSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Offer', offerSchema);
