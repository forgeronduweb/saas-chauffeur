const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('../models/Offer');

async function addContractTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les offres
    const offers = await Offer.find();
    console.log(`📊 ${offers.length} offres trouvées\n`);

    let updated = 0;

    for (const offer of offers) {
      // Déterminer le type de contrat basé sur le type d'offre
      let contractType;
      
      switch(offer.type) {
        case 'Personnel':
          contractType = 'CDI';
          break;
        case 'VTC':
          contractType = 'Freelance';
          break;
        case 'Livraison':
          contractType = 'CDD';
          break;
        case 'Transport':
          contractType = 'CDI';
          break;
        default:
          // Assigner aléatoirement si type inconnu
          const types = ['CDI', 'CDD', 'Intérim', 'Freelance'];
          contractType = types[Math.floor(Math.random() * types.length)];
      }

      // Mettre à jour l'offre
      await Offer.findByIdAndUpdate(offer._id, { 
        $set: { contractType: contractType }
      });

      updated++;
      console.log(`✅ ${offer.title}`);
      console.log(`   Type d'offre: ${offer.type}`);
      console.log(`   Type de contrat: ${contractType}`);
      console.log(`   Entreprise: ${offer.company || 'N/A'}\n`);
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   Total: ${offers.length} offres`);
    console.log(`   Mises à jour: ${updated} offres\n`);

    console.log('✅ Tous les types de contrat ont été ajoutés!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

addContractTypes();
