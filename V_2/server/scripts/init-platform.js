const mongoose = require('mongoose');
require('dotenv').config();

const PlatformConfig = require('../models/PlatformConfig');

async function initializePlatform() {
  try {
    console.log('🚀 Initialisation de la plateforme...');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Initialiser les configurations par défaut
    await PlatformConfig.initializeDefaults();
    console.log('✅ Configurations par défaut initialisées');

    console.log('\n🎉 Plateforme initialisée avec succès !');
    console.log('\n📋 Configurations disponibles :');
    
    const configs = await PlatformConfig.find().sort({ category: 1, key: 1 });
    configs.forEach(config => {
      console.log(`   ${config.key}: ${JSON.stringify(config.value)} (${config.category})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter l'initialisation
initializePlatform();
