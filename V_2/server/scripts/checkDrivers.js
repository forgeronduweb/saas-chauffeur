const mongoose = require('mongoose');
require('dotenv').config();

const Driver = require('../models/Driver');
const Offer = require('../models/Offer');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const driversCount = await Driver.countDocuments();
    const offersCount = await Offer.countDocuments();

    console.log('📊 ÉTAT DE LA BASE DE DONNÉES:');
    console.log('================================');
    console.log(`Chauffeurs: ${driversCount}`);
    console.log(`Offres: ${offersCount}\n`);

    if (driversCount === 0) {
      console.log('⚠️  AUCUN CHAUFFEUR dans la base de données!');
      console.log('Les chauffeurs affichés sont des DONNÉES DE TEST.\n');
      console.log('💡 Pour ajouter des vraies données, exécutez:');
      console.log('   node scripts/seedStats.js\n');
    } else {
      console.log('✅ Chauffeurs trouvés dans la BD:\n');
      const drivers = await Driver.find().limit(5);
      drivers.forEach((d, i) => {
        console.log(`${i + 1}. ${d.firstName} ${d.lastName} - ${d.workZone} (${d.vehicleType})`);
      });
      console.log('\n✅ Les chauffeurs affichés proviennent de votre BASE DE DONNÉES!\n');
    }

    if (offersCount === 0) {
      console.log('⚠️  AUCUNE OFFRE dans la base de données!');
      console.log('Les offres affichées sont des DONNÉES DE TEST.\n');
    } else {
      console.log(`✅ ${offersCount} offre(s) dans la base de données\n`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

checkDatabase();
