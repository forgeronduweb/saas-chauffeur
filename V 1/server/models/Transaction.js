const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
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
    amount: {
      type: Number,
      required: true,
      min: [0, 'Le montant doit être positif']
    },
    commission: {
      type: Number,
      required: true,
      min: [0, 'La commission doit être positive']
    },
    platformFee: {
      type: Number,
      required: true,
      min: [0, 'Les frais de plateforme doivent être positifs']
    },
    driverEarnings: {
      type: Number,
      required: true,
      min: [0, 'Les gains du chauffeur doivent être positifs']
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'refunded', 'disputed'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: ['payment', 'refund', 'commission', 'bonus'],
      default: 'payment'
    },
    processedAt: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
      default: 'stripe'
    },
    stripeTransactionId: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances
transactionSchema.index({ missionId: 1 });
transactionSchema.index({ driverId: 1 });
transactionSchema.index({ employerId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual pour récupérer les informations de la mission
transactionSchema.virtual('mission', {
  ref: 'Mission',
  localField: 'missionId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations du chauffeur
transactionSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

// Virtual pour récupérer les informations de l'employeur
transactionSchema.virtual('employer', {
  ref: 'User',
  localField: 'employerId',
  foreignField: '_id',
  justOne: true
});

// Méthode pour marquer comme traité
transactionSchema.methods.markAsProcessed = function() {
  this.status = 'processed';
  this.processedAt = new Date();
  return this.save();
};

// Méthode pour marquer comme échoué
transactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.description = reason;
  return this.save();
};

// Méthode statique pour calculer les frais de commission
transactionSchema.statics.calculateFees = function(amount, commissionRate = 0.10) {
  const platformFee = Math.round(amount * commissionRate * 100) / 100;
  const driverEarnings = Math.round((amount - platformFee) * 100) / 100;
  
  return {
    amount: amount,
    commission: commissionRate,
    platformFee: platformFee,
    driverEarnings: driverEarnings
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
