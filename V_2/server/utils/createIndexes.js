const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const Application = require('../models/Application');
const User = require('../models/User');

/**
 * Crée les index nécessaires pour optimiser les performances des requêtes
 * Cette fonction est appelée au démarrage du serveur
 */
const createIndexes = async () => {
  try {
    console.log('🔍 Création des index...');
    
    // Index pour le modèle Driver
    await Driver.collection.createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { 'location.coordinates': '2dsphere' } },
      { key: { isAvailable: 1 } }
    ]);

    // Index pour le modèle Offer
    await Offer.collection.createIndexes([
      { key: { employerId: 1 } },
      { key: { type: 1 } },
      { key: { status: 1 } },
      { key: { 'location.coordinates': '2dsphere' } },
      { key: { 'requirements.licenseType': 1 } },
      { key: { 'requirements.experience': 1 } },
      { key: { 'conditions.salary': 1 } },
      { key: { 'conditions.workType': 1 } }
    ]);

    // Index pour le modèle Application
    await Application.collection.createIndexes([
      { key: { offerId: 1 } },
      { key: { driverId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } }
    ]);

    // Index pour le modèle User
    await User.collection.createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { isVerified: 1 } },
      { key: { isActive: 1 } }
    ]);

    console.log('✅ Index créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
    // Ne pas lancer d'erreur pour ne pas bloquer le démarrage du serveur
  }
};

module.exports = { createIndexes };
