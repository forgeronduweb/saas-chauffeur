const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: false,
      trim: true,
      validate: {
        validator: function(v) {
          // Accepter les chaînes vides ou les numéros valides
          return !v || v === '' || /^[0-9\s\-\+\(\)]+$/.test(v);
        },
        message: 'Format de téléphone invalide'
      }
    },
    
    // Informations du permis
    licenseType: { 
      type: String, 
      enum: ['B', 'B+7h', 'C', 'D', 'A', 'A1', 'A2'],
      required: true
    },
    licenseNumber: { 
      type: String,
      trim: true
    },
    licenseDate: { 
      type: Date,
      required: true
    },
    vtcCard: { 
      type: String,
      trim: true
    },
    
    // Expérience
    experience: { 
      type: String, 
      enum: ['<1', '1-3', '3-5', '5-10', '10+'],
      required: true
    },
    
    // Véhicule
    vehicleType: { 
      type: String, 
      trim: true
    },
    vehicleBrand: { 
      type: String,
      trim: true
    },
    vehicleYear: { 
      type: Number,
      min: [1990, 'Année du véhicule trop ancienne'],
      max: [new Date().getFullYear() + 1, 'Année du véhicule invalide']
    },
    vehicleSeats: { 
      type: Number,
      min: [1, 'Le véhicule doit avoir au moins 1 place'],
      max: [9, 'Nombre de places trop élevé']
    },
    
    // Zone de travail et spécialités
    workZone: { 
      type: String,
      trim: true
    },
    specialties: [{ 
      type: String,
      enum: [
        'transport_personnel', 
        'livraison', 
        'vtc', 
        'demenagement', 
        'transport_groupe', 
        'longue_distance',
        'evenementiel',
        'medical'
      ]
    }],
    
    // Statut et disponibilité
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    isAvailable: { 
      type: Boolean, 
      default: false
    },
    
    // Évaluations
    rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0
    },
    totalRides: { 
      type: Number, 
      default: 0
    },
    totalEarnings: { 
      type: Number, 
      default: 0
    },
    
    // Expérience professionnelle
    workExperience: [{
      company: { 
        type: String, 
        trim: true,
        maxlength: [100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères']
      },
      location: { 
        type: String, 
        trim: true,
        maxlength: [100, 'Le lieu ne peut pas dépasser 100 caractères']
      },
      position: { 
        type: String, 
        trim: true,
        maxlength: [100, 'Le poste ne peut pas dépasser 100 caractères']
      },
      startDate: { 
        type: String, // Format YYYY-MM
        validate: {
          validator: function(v) {
            // Permettre les chaînes vides ou le format YYYY-MM
            return !v || /^\d{4}-\d{2}$/.test(v);
          },
          message: 'Format de date invalide (YYYY-MM attendu)'
        }
      },
      endDate: { 
        type: String, // Format YYYY-MM, optionnel (en cours si vide)
        validate: {
          validator: function(v) {
            // Permettre les chaînes vides ou le format YYYY-MM
            return !v || /^\d{4}-\d{2}$/.test(v);
          },
          message: 'Format de date invalide (YYYY-MM attendu)'
        }
      },
      description: { 
        type: String, 
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
      }
    }],
    
    // Photo de profil
    profilePhotoUrl: {
      type: String,
      trim: true
    },
    
    // Documents
    documents: {
      licensePhoto: { type: String },
      identityPhoto: { type: String },
      vehicleRegistration: { type: String },
      insurance: { type: String },
      vtcCardPhoto: { type: String }
    },
    
    // Coordonnées GPS actuelles (pour la géolocalisation)
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    lastLocationUpdate: { type: Date }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index géospatial pour la recherche par proximité
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ userId: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ isAvailable: 1 });

// Virtual pour le nom complet
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual pour calculer l'âge du permis
driverSchema.virtual('licenseAge').get(function() {
  if (!this.licenseDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.licenseDate);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
});

module.exports = mongoose.model('Driver', driverSchema);


