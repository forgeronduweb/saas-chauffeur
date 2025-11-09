const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema(
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
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    // Type d'employeur
    employerType: {
      type: String,
      enum: ['particulier', 'entreprise'],
      default: 'particulier'
    },
    // Informations entreprise
    companyName: {
      type: String,
      trim: true
    },
    companyType: {
      type: String,
      enum: ['sarl', 'sa', 'entreprise_individuelle', 'association', 'autre'],
      trim: true
    },
    companyLogo: {
      type: String
    },
    sector: {
      type: String,
      enum: [
        'transport',
        'logistique',
        'tourisme',
        'hotellerie',
        'evenementiel',
        'commerce',
        'services',
        'industrie',
        'autre'
      ],
      trim: true
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      trim: true
    },
    foundedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: 'Abidjan'
    },
    companyPhone: {
      type: String,
      trim: true
    },
    companyEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    website: {
      type: String,
      trim: true
    },
    siret: {
      type: String,
      trim: true
    },
    // Personne de contact
    contactPerson: {
      type: String,
      trim: true
    },
    contactPosition: {
      type: String,
      trim: true
    },
    // Documents
    companyRegistration: {
      type: String
    },
    idCard: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Statistiques
    totalOffers: {
      type: Number,
      default: 0
    },
    activeOffers: {
      type: Number,
      default: 0
    },
    totalHires: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index pour améliorer les performances
employerSchema.index({ userId: 1 });
employerSchema.index({ email: 1 });
employerSchema.index({ status: 1 });
employerSchema.index({ companyName: 1 });

// Méthode virtuelle pour le nom complet
employerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employer', employerSchema);
