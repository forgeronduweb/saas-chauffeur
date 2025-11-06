const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('../models/Offer');

async function checkOffers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const offersCount = await Offer.countDocuments();

    console.log('📊 OFFRES DANS LA BASE DE DONNÉES:');
    console.log('================================');
    console.log(`Total: ${offersCount} offres\n`);

    if (offersCount === 0) {
      console.log('⚠️  AUCUNE OFFRE dans la base de données!');
      console.log('Les offres affichées sont des DONNÉES DE TEST.\n');
    } else {
      console.log('✅ Offres trouvées dans la BD:\n');
      const offers = await Offer.find().limit(8);
      offers.forEach((o, i) => {
        console.log(`${i + 1}. ${o.title}`);
        console.log(`   📍 ${o.location || 'Lieu non spécifié'}`);
        console.log(`   💰 ${o.salary || 'Salaire non spécifié'}`);
        console.log(`   📅 ${o.workType || 'Type non spécifié'}\n`);
      });
      console.log('✅ Les offres affichées proviennent de votre BASE DE DONNÉES!\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

checkOffers();
