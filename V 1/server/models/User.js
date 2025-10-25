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
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['client', 'driver', 'admin'], 
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
      match: [/^[0-9\s\-\+\(\)]+$/, 'Format de téléphone invalide']
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
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.passwordHash;
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


