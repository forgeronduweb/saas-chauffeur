const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('../models/Offer');

async function addOfferTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les offres
    const offers = await Offer.find();
    console.log(`📊 ${offers.length} offres trouvées\n`);

    let updated = 0;

    for (const offer of offers) {
      // Ajouter offerType basé sur le type existant
      // Le champ "type" dans le modèle représente déjà le type d'offre (Personnel, VTC, Livraison, etc.)
      // On va juste s'assurer qu'il est bien défini
      
      const updates = {};
      
      // Si le type existe, on le garde tel quel
      // Le type dans le modèle Offer est déjà le type d'offre
      if (offer.type) {
        updates.offerType = offer.type;
        updated++;
        
        console.log(`✅ ${offer.title}`);
        console.log(`   Type d'offre: ${offer.type}`);
        console.log(`   Type de contrat: ${offer.contractType || 'N/A'}\n`);
        
        await Offer.findByIdAndUpdate(offer._id, { 
          $set: updates
        });
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   Total: ${offers.length} offres`);
    console.log(`   Mises à jour: ${updated} offres\n`);

    console.log('✅ Tous les types d\'offre ont été ajoutés!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

addOfferTypes();
