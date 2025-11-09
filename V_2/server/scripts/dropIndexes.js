const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer tous les index de Driver
    await Driver.collection.dropIndexes();
    console.log('✅ Index Driver supprimés');

    await mongoose.connection.close();
    console.log('✅ Terminé ! Redémarrez le serveur.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

dropIndexes();
