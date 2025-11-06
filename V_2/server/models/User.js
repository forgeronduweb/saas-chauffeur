const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide']
    },
    passwordHash: { type: String, required: false },
    googleId: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    authProvider: { 
      type: String, 
      enum: ['local', 'google'], 
      default: 'local' 
    },
    profilePhotoUrl: { 
      type: String 
    },
    needsRoleSelection: {
      type: Boolean,
      default: false
    },
    role: { 
      type: String, 
      enum: ['client', 'driver', 'employer', 'admin'], 
      default: 'client' 
    },
    firstName: { 
      type: String, 
      trim: true,
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    lastName: { 
      type: String, 
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    phone: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          // Accepter les chaînes vides ou les numéros valides
          return !v || v === '' || /^[0-9\s\-\+\(\)]+$/.test(v);
        },
        message: 'Format de téléphone invalide'
      }
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isEmailVerified: { 
      type: Boolean, 
      default: false 
    },
    lastLogin: { 
      type: Date 
    },
    profilePicture: { 
      type: String 
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    emailVerificationCode: {
      type: String
    },
    emailVerificationExpires: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.emailVerificationCode;
        delete ret.emailVerificationExpires;
        return ret;
      }
    }
  }
);

// Index pour améliorer les performances de recherche
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'Utilisateur';
});

module.exports = mongoose.model('User', userSchema);


