const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    proposedSalary: {
      type: Number,
      min: [0, 'Le salaire proposé doit être positif']
    },
    availability: {
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
    experience: {
      years: {
        type: String,
        enum: ['Débutant', '1-3 ans', '3-5 ans', '5+ ans']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [300, 'La description d\'expérience ne peut pas dépasser 300 caractères']
      }
    },
    documents: [{
      type: {
        type: String,
        enum: ['license', 'insurance', 'vehicle_registration', 'other'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    employerNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
applicationSchema.index({ offerId: 1 });
applicationSchema.index({ driverId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Index composé pour éviter les candidatures en double
applicationSchema.index({ offerId: 1, driverId: 1 }, { unique: true });

// Virtual pour récupérer les informations de l'offre
applicationSchema.virtual('offer', {
  ref: 'Offer',
  localField: 'offerId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations du chauffeur
applicationSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer le profil chauffeur complet
applicationSchema.virtual('driverProfile', {
  ref: 'Driver',
  localField: 'driverId',
  foreignField: 'userId',
  justOne: true
});

// Méthode pour vérifier si la candidature peut être modifiée
applicationSchema.methods.canBeModified = function() {
  return this.status === 'pending';
};

// Méthode pour accepter la candidature
applicationSchema.methods.accept = function(reviewerId, notes) {
  this.status = 'accepted';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) this.employerNotes = notes;
  return this.save();
};

// Méthode pour rejeter la candidature
applicationSchema.methods.reject = function(reviewerId, notes) {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  if (notes) this.employerNotes = notes;
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
