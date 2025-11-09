const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('./models/Offer');
const User = require('./models/User');

async function findOffer() {
  try {
    const searchTitle = process.argv[2];

    if (!searchTitle) {
      console.log('❌ Usage: node find-offer.js <titre>');
      console.log('Exemple: node find-offer.js "Vente de voiture"');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher l'offre par titre (recherche partielle)
    const offers = await Offer.find({ 
      title: { $regex: searchTitle, $options: 'i' } 
    });

    if (offers.length === 0) {
      console.log('❌ Aucune offre trouvée avec ce titre');
      process.exit(1);
    }

    console.log(`📋 ${offers.length} offre(s) trouvée(s):\n`);

    for (const offer of offers) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 Titre:', offer.title);
      console.log('🆔 ID:', offer._id);
      console.log('📁 Type:', offer.type);
      console.log('📊 Status:', offer.status);
      console.log('👤 EmployerId:', offer.employerId);
      console.log('📅 Créée le:', offer.createdAt);
      console.log('💰 Prix:', offer.conditions?.salary || 'N/A');
      console.log('📍 Ville:', offer.location?.city || 'N/A');
      console.log('🖼️ Images:', offer.images?.length || 0);

      // Trouver l'utilisateur propriétaire
      const owner = await User.findById(offer.employerId);
      if (owner) {
        console.log('\n👤 Propriétaire:');
        console.log('   - Email:', owner.email);
        console.log('   - Nom:', owner.firstName, owner.lastName);
        console.log('   - Rôle:', owner.role);
      } else {
        console.log('\n⚠️ Propriétaire non trouvé (employerId invalide)');
      }
      console.log('');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

findOffer();
