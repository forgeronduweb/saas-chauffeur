const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [100, 'La clé ne peut pas dépasser 100 caractères']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    category: {
      type: String,
      enum: ['general', 'payment', 'notification', 'security', 'features', 'limits'],
      default: 'general'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    isEditable: {
      type: Boolean,
      default: true
    },
    validationRules: {
      min: Number,
      max: Number,
      regex: String,
      allowedValues: [mongoose.Schema.Types.Mixed]
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    },
    history: [{
      value: mongoose.Schema.Types.Mixed,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      reason: String
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
platformConfigSchema.index({ key: 1 });
platformConfigSchema.index({ category: 1 });
platformConfigSchema.index({ isPublic: 1 });

// Virtual pour récupérer les informations de l'utilisateur qui a mis à jour
platformConfigSchema.virtual('updatedByUser', {
  ref: 'User',
  localField: 'updatedBy',
  foreignField: '_id',
  justOne: true
});

// Méthode pour valider une valeur
platformConfigSchema.methods.validateValue = function(newValue) {
  const rules = this.validationRules;
  
  if (!rules) return { isValid: true };
  
  // Validation des nombres
  if (this.type === 'number') {
    if (rules.min !== undefined && newValue < rules.min) {
      return { isValid: false, error: `La valeur doit être supérieure ou égale à ${rules.min}` };
    }
    if (rules.max !== undefined && newValue > rules.max) {
      return { isValid: false, error: `La valeur doit être inférieure ou égale à ${rules.max}` };
    }
  }
  
  // Validation des chaînes
  if (this.type === 'string' && rules.regex) {
    const regex = new RegExp(rules.regex);
    if (!regex.test(newValue)) {
      return { isValid: false, error: 'La valeur ne respecte pas le format requis' };
    }
  }
  
  // Validation des valeurs autorisées
  if (rules.allowedValues && rules.allowedValues.length > 0) {
    if (!rules.allowedValues.includes(newValue)) {
      return { isValid: false, error: `La valeur doit être l'une des suivantes: ${rules.allowedValues.join(', ')}` };
    }
  }
  
  return { isValid: true };
};

// Méthode pour mettre à jour la valeur
platformConfigSchema.methods.updateValue = function(newValue, updatedBy, reason = null) {
  // Valider la nouvelle valeur
  const validation = this.validateValue(newValue);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Sauvegarder l'ancienne valeur dans l'historique
  this.history.push({
    value: this.value,
    updatedBy: this.updatedBy,
    updatedAt: this.updatedAt,
    reason: reason
  });
  
  // Mettre à jour
  this.value = newValue;
  this.updatedBy = updatedBy;
  this.version += 1;
  
  return this.save();
};

// Méthode statique pour obtenir une valeur de configuration
platformConfigSchema.statics.getValue = async function(key, defaultValue = null) {
  try {
    const config = await this.findOne({ key: key });
    return config ? config.value : defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la config ${key}:`, error);
    return defaultValue;
  }
};

// Méthode statique pour définir une valeur de configuration
platformConfigSchema.statics.setValue = async function(key, value, type, updatedBy, description = null, category = 'general') {
  try {
    let config = await this.findOne({ key: key });
    
    if (config) {
      await config.updateValue(value, updatedBy);
    } else {
      config = new this({
        key: key,
        value: value,
        type: type,
        description: description,
        category: category,
        updatedBy: updatedBy
      });
      await config.save();
    }
    
    return config;
  } catch (error) {
    console.error(`Erreur lors de la définition de la config ${key}:`, error);
    throw error;
  }
};

// Méthode statique pour initialiser les configurations par défaut
platformConfigSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'commission_rate',
      value: 0.10,
      type: 'number',
      description: 'Taux de commission de la plateforme (0.10 = 10%)',
      category: 'payment',
      validationRules: { min: 0, max: 0.5 }
    },
    {
      key: 'max_applications_per_offer',
      value: 50,
      type: 'number',
      description: 'Nombre maximum de candidatures par offre',
      category: 'limits',
      validationRules: { min: 1, max: 1000 }
    },
    {
      key: 'auto_approve_drivers',
      value: false,
      type: 'boolean',
      description: 'Approuver automatiquement les chauffeurs',
      category: 'features'
    },
    {
      key: 'maintenance_mode',
      value: false,
      type: 'boolean',
      description: 'Mode maintenance de la plateforme',
      category: 'general'
    },
    {
      key: 'support_email',
      value: 'support@chauffeurs.com',
      type: 'string',
      description: 'Email de support de la plateforme',
      category: 'general'
    },
    {
      key: 'notification_settings',
      value: {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true
      },
      type: 'object',
      description: 'Paramètres de notification',
      category: 'notification'
    }
  ];
  
  for (const config of defaults) {
    const existing = await this.findOne({ key: config.key });
    if (!existing) {
      await this.create(config);
      console.log(`Configuration initialisée: ${config.key}`);
    }
  }
};

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
