const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('./models/Offer');
const User = require('./models/User');

async function checkOffers() {
  try {
    // Récupérer l'email depuis les arguments de ligne de commande
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Usage: node check-offers.js <email>');
      console.log('Exemple: node check-offers.js user@example.com');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }

    console.log('👤 Utilisateur trouvé:');
    console.log('- ID:', user._id);
    console.log('- Email:', user.email);
    console.log('- Rôle:', user.role);
    console.log('- Nom:', user.firstName, user.lastName);

    // Trouver toutes les offres de cet utilisateur
    const allOffers = await Offer.find({ employerId: user._id });
    console.log('\n📊 Total des offres:', allOffers.length);

    if (allOffers.length > 0) {
      console.log('\n📋 Liste des offres:');
      allOffers.forEach((offer, index) => {
        console.log(`\n${index + 1}. ${offer.title}`);
        console.log('   - ID:', offer._id);
        console.log('   - Type:', offer.type);
        console.log('   - Status:', offer.status);
        console.log('   - Créée le:', offer.createdAt);
        console.log('   - Images:', offer.images?.length || 0);
      });

      // Filtrer les offres marketing (type: "Autre")
      const marketingOffers = allOffers.filter(o => o.type === 'Autre');
      console.log('\n🛒 Offres marketing (type="Autre"):', marketingOffers.length);
      
      if (marketingOffers.length > 0) {
        marketingOffers.forEach((offer, index) => {
          console.log(`\n${index + 1}. ${offer.title}`);
          console.log('   - Prix:', offer.conditions?.salary || 'N/A');
          console.log('   - Ville:', offer.location?.city || 'N/A');
        });
      }
    } else {
      console.log('\n⚠️ Aucune offre trouvée pour cet utilisateur');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkOffers();
