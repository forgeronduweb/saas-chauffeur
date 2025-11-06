const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function fixRole() {
  try {
    // Récupérer l'email et le rôle depuis les arguments de ligne de commande
    const email = process.argv[2];
    const newRole = process.argv[3] || 'employer';

    if (!email) {
      console.log('❌ Usage: node fix-role.js <email> [role]');
      console.log('Exemple: node fix-role.js user@example.com employer');
      console.log('Rôles disponibles: employer, driver');
      process.exit(1);
    }

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Corriger le rôle
    const result = await User.updateOne(
      { email: email },
      { $set: { role: newRole } }
    );

    console.log('\n📊 Résultat de la mise à jour:');
    console.log('- Documents trouvés:', result.matchedCount);
    console.log('- Documents modifiés:', result.modifiedCount);

    // Vérifier le résultat
    const user = await User.findOne({ email: email });
    
    if (user) {
      console.log('\n✅ Utilisateur mis à jour:');
      console.log('- Email:', user.email);
      console.log('- Nom:', user.firstName, user.lastName);
      console.log('- Rôle:', user.role);
      console.log('\n🎉 Le rôle a été corrigé avec succès !');
      console.log('👉 Déconnectez-vous et reconnectez-vous pour voir les 2 options.');
    } else {
      console.log('\n❌ Utilisateur non trouvé avec cet email');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixRole();
