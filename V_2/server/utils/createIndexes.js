const mongoose = require('mongoose');

/**
 * Créer les index pour optimiser les performances des requêtes
 */
async function createIndexes() {
  try {
    const Driver = mongoose.model('Driver');
    const Offer = mongoose.model('Offer');
    const Application = mongoose.model('Application');
    const User = mongoose.model('User');
    const Message = mongoose.model('Message');
    const Conversation = mongoose.model('Conversation');

    console.log('📊 Création des index pour optimisation...');

    // Index pour Driver
    await Driver.collection.createIndex({ userId: 1 });
    await Driver.collection.createIndex({ isActive: 1 });
    await Driver.collection.createIndex({ city: 1 });
    await Driver.collection.createIndex({ workZone: 1 });
    await Driver.collection.createIndex({ vehicleType: 1 });
    await Driver.collection.createIndex({ experience: 1 });
    await Driver.collection.createIndex({ rating: -1 });
    await Driver.collection.createIndex({ isActive: 1, city: 1 });
    await Driver.collection.createIndex({ isActive: 1, workZone: 1 });
    console.log('✅ Index Driver créés');

    // Index pour Offer
    await Offer.collection.createIndex({ employer: 1 });
    await Offer.collection.createIndex({ status: 1 });
    await Offer.collection.createIndex({ type: 1 });
    await Offer.collection.createIndex({ location: 1 });
    await Offer.collection.createIndex({ createdAt: -1 });
    await Offer.collection.createIndex({ status: 1, createdAt: -1 });
    await Offer.collection.createIndex({ targetDriverId: 1 });
    console.log('✅ Index Offer créés');

    // Index pour Application
    await Application.collection.createIndex({ driverId: 1 });
    await Application.collection.createIndex({ offerId: 1 });
    await Application.collection.createIndex({ status: 1 });
    await Application.collection.createIndex({ createdAt: -1 });
    await Application.collection.createIndex({ driverId: 1, status: 1 });
    await Application.collection.createIndex({ offerId: 1, status: 1 });
    console.log('✅ Index Application créés');

    // Index pour User
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    console.log('✅ Index User créés');

    // Index pour Message
    await Message.collection.createIndex({ conversationId: 1 });
    await Message.collection.createIndex({ senderId: 1 });
    await Message.collection.createIndex({ createdAt: -1 });
    await Message.collection.createIndex({ conversationId: 1, createdAt: -1 });
    console.log('✅ Index Message créés');

    // Index pour Conversation
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ isActive: 1 });
    await Conversation.collection.createIndex({ updatedAt: -1 });
    console.log('✅ Index Conversation créés');

    console.log('🎉 Tous les index ont été créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
  }
}

module.exports = { createIndexes };
