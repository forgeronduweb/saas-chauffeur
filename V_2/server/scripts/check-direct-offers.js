const mongoose = require('mongoose');
require('dotenv').config();

async function checkDirectOffers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Offer = require('../models/Offer');
    const Driver = require('../models/Driver');
    
    console.log('🔍 Diagnostic des offres directes...\n');
    
    // 1. Vérifier les offres directes récentes
    const directOffers = await Offer.find({ isDirect: true })
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`📊 ${directOffers.length} offres directes trouvées:\n`);
    
    for (const offer of directOffers) {
      console.log(`Offre: ${offer.title}`);
      console.log(`  - ID: ${offer._id}`);
      console.log(`  - targetDriverId: ${offer.targetDriverId}`);
      console.log(`  - isDirect: ${offer.isDirect}`);
      console.log(`  - status: ${offer.status}`);
      console.log(`  - Créée: ${offer.createdAt.toISOString()}`);
      
      // Vérifier si le chauffeur existe
      if (offer.targetDriverId) {
        const driver = await Driver.findById(offer.targetDriverId);
        if (driver) {
          console.log(`  ✅ Chauffeur trouvé: ${driver.firstName} ${driver.lastName}`);
        } else {
          console.log(`  ❌ Chauffeur NOT FOUND avec ID: ${offer.targetDriverId}`);
        }
      } else {
        console.log(`  ⚠️  Pas de targetDriverId défini`);
      }
      console.log('');
    }
    
    // 2. Vérifier quelques chauffeurs
    const drivers = await Driver.find({}).limit(3);
    console.log('👥 Chauffeurs disponibles:');
    drivers.forEach(driver => {
      console.log(`  - ${driver.firstName} ${driver.lastName} (ID: ${driver._id})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Diagnostic terminé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkDirectOffers();
