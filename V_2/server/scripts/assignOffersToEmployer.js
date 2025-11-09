const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const User = require('../models/User');
require('dotenv').config();

async function assignOffersToEmployer() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'employeur avec l'email "employeur1@gmail.com"
    const employer = await User.findOne({ email: 'employeur1@gmail.com' });
    
    if (!employer) {
      console.log('❌ Employeur non trouvé avec l\'email: employeur1@gmail.com');
      console.log('Création d\'un compte employeur...');
      
      // Créer un compte employeur si il n'existe pas
      const newEmployer = new User({
        email: 'employeur1@gmail.com',
        password: '$2a$10$YourHashedPasswordHere', // Mot de passe hashé
        role: 'employer',
        firstName: 'Employeur',
        lastName: 'Test',
        phone: '+225 07 00 00 00 00',
        isActive: true
      });
      
      await newEmployer.save();
      console.log('✅ Compte employeur créé');
      
      // Mettre à jour toutes les offres
      const result = await Offer.updateMany(
        { type: { $ne: 'product' } }, // Toutes les offres sauf les produits
        { $set: { employer: newEmployer._id } }
      );
      
      console.log(`✅ ${result.modifiedCount} offres d'emploi assignées à employeur1@gmail.com`);
    } else {
      console.log('✅ Employeur trouvé:', employer.email);
      console.log('ID de l\'employeur:', employer._id);
      
      // Mettre à jour toutes les offres d'emploi (type !== 'product')
      const result = await Offer.updateMany(
        { type: { $ne: 'product' } }, // Toutes les offres sauf les produits
        { $set: { employer: employer._id } }
      );
      
      console.log(`✅ ${result.modifiedCount} offres d'emploi assignées à employeur1@gmail.com`);
      
      // Afficher les offres mises à jour
      const offers = await Offer.find({ employer: employer._id }).select('title type');
      console.log('\n📋 Offres assignées:');
      offers.forEach((offer, index) => {
        console.log(`${index + 1}. ${offer.title} (${offer.type})`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

assignOffersToEmployer();
