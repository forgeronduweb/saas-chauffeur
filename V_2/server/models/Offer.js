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
        type: Date
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
    views: {
      type: Number,
      default: 0
    },
    messagesCount: {
      type: Number,
      default: 0
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }],
    requirementsList: [{
      type: String,
      trim: true
    }],
    benefits: [{
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
    },
    images: [{
      type: String,
      trim: true
    }],
    mainImage: {
      type: String,
      trim: true
    },
    additionalImages: [{
      type: String,
      trim: true
    }],
    // Champs spécifiques pour les offres marketing/produits
    category: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    brand: {
      type: String,
      trim: true
    },
    condition: {
      type: String,
      trim: true
    },
    deliveryOptions: {
      type: String,
      trim: true
    },
    // Caractéristiques structurées pour les offres marketing (menu déroulant)
    characteristics: {
      type: Map,
      of: String,
      default: new Map()
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

// Méthode pour incrémenter le compteur de vues
offerSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Méthode pour incrémenter le compteur de messages
offerSchema.methods.incrementMessagesCount = function() {
  this.messagesCount += 1;
  return this.save();
};

module.exports = mongoose.model('Offer', offerSchema);
