const mongoose = require('mongoose');
const Driver = require('../models/Driver');
require('dotenv').config();

const checkDriverPhoto = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const drivers = await Driver.find().select('firstName lastName profilePhotoUrl');
    
    console.log(`📋 Total chauffeurs: ${drivers.length}\n`);
    
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.firstName} ${driver.lastName}`);
      console.log(`   Photo: ${driver.profilePhotoUrl ? '✅ OUI' : '❌ NON'}`);
      if (driver.profilePhotoUrl) {
        console.log(`   URL: ${driver.profilePhotoUrl.substring(0, 50)}...`);
      }
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Terminé !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkDriverPhoto();
