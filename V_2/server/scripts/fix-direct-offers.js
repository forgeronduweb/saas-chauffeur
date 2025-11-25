const mongoose = require('mongoose');
require('dotenv').config();

async function fixDirectOffers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Offer = require('../models/Offer');
    const Driver = require('../models/Driver');
    
    console.log('🔧 Correction des offres directes...\n');
    
    // 1. Récupérer les offres directes sans targetDriverId
    const brokenOffers = await Offer.find({ 
      isDirect: true, 
      $or: [
        { targetDriverId: { $exists: false } },
        { targetDriverId: null },
        { targetDriverId: undefined }
      ]
    });
    
    console.log(`🔍 ${brokenOffers.length} offres directes sans chauffeur ciblé trouvées`);
    
    if (brokenOffers.length === 0) {
      console.log('✅ Aucune offre à corriger');
      await mongoose.disconnect();
      return;
    }
    
    // 2. Récupérer un chauffeur de test
    const testDriver = await Driver.findOne({});
    
    if (!testDriver) {
      console.log('❌ Aucun chauffeur trouvé pour le test');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`🎯 Chauffeur de test: ${testDriver.firstName} ${testDriver.lastName} (${testDriver._id})`);
    
    // 3. Corriger les offres
    for (const offer of brokenOffers) {
      await Offer.findByIdAndUpdate(offer._id, {
        targetDriverId: testDriver._id
      });
      
      console.log(`✅ Offre "${offer.title}" corrigée`);
    }
    
    console.log(`\n🎉 ${brokenOffers.length} offres directes corrigées !`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixDirectOffers();
