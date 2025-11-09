const mongoose = require('mongoose');
require('dotenv').config();

const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const User = require('../models/User');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Données de test pour les chauffeurs
const sampleDrivers = [
  {
    firstName: 'Kouassi',
    lastName: 'Jean',
    email: 'kouassi.jean@example.com',
    phone: '+225 07 12 34 56 78',
    licenseType: 'Permis B',
    experience: '5-10 ans',
    vehicleType: 'Berline',
    vehicleBrand: 'Toyota Corolla',
    vehicleYear: 2020,
    vehicleSeats: 5,
    workZone: 'Cocody',
    specialties: ['Transport VIP', 'Chauffeur personnel'],
    rating: 4.8,
    totalRides: 156,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'Koné',
    lastName: 'Ibrahim',
    email: 'kone.ibrahim@example.com',
    phone: '+225 07 23 45 67 89',
    licenseType: 'Permis B',
    experience: 'Plus de 10 ans',
    vehicleType: '4x4/SUV',
    vehicleBrand: 'Toyota Land Cruiser',
    vehicleYear: 2019,
    vehicleSeats: 7,
    workZone: 'Plateau',
    specialties: ['Transport d\'entreprise', 'Transport VIP'],
    rating: 4.9,
    totalRides: 203,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'Yao',
    lastName: 'Marie',
    email: 'yao.marie@example.com',
    phone: '+225 07 34 56 78 90',
    licenseType: 'Permis B',
    experience: '3-5 ans',
    vehicleType: 'Berline',
    vehicleBrand: 'Peugeot 508',
    vehicleYear: 2021,
    vehicleSeats: 5,
    workZone: 'Marcory',
    specialties: ['Chauffeur personnel', 'Transport scolaire'],
    rating: 4.7,
    totalRides: 98,
    isAvailable: false,
    isActive: true
  },
  {
    firstName: 'Traoré',
    lastName: 'Seydou',
    email: 'traore.seydou@example.com',
    phone: '+225 07 45 67 89 01',
    licenseType: 'Permis D',
    experience: 'Plus de 10 ans',
    vehicleType: 'Minibus',
    vehicleBrand: 'Mercedes Sprinter',
    vehicleYear: 2018,
    vehicleSeats: 16,
    workZone: 'Yopougon',
    specialties: ['Transport scolaire', 'Transport d\'entreprise'],
    rating: 5.0,
    totalRides: 312,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'N\'Guessan',
    lastName: 'Aya',
    email: 'nguessan.aya@example.com',
    phone: '+225 07 56 78 90 12',
    licenseType: 'Permis B',
    experience: '1-3 ans',
    vehicleType: 'Berline',
    vehicleBrand: 'Renault Megane',
    vehicleYear: 2022,
    vehicleSeats: 5,
    workZone: 'Abobo',
    specialties: ['Taxi/VTC', 'Chauffeur personnel'],
    rating: 4.6,
    totalRides: 67,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'Bamba',
    lastName: 'Moussa',
    email: 'bamba.moussa@example.com',
    phone: '+225 07 67 89 01 23',
    licenseType: 'Permis B',
    experience: '5-10 ans',
    vehicleType: 'Pick-up',
    vehicleBrand: 'Toyota Hilux',
    vehicleYear: 2020,
    vehicleSeats: 5,
    workZone: 'Cocody',
    specialties: ['Transport de marchandises', 'Livraison'],
    rating: 4.8,
    totalRides: 145,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'Diallo',
    lastName: 'Fatou',
    email: 'diallo.fatou@example.com',
    phone: '+225 07 78 90 12 34',
    licenseType: 'Permis B',
    experience: '3-5 ans',
    vehicleType: 'Berline',
    vehicleBrand: 'Honda Accord',
    vehicleYear: 2021,
    vehicleSeats: 5,
    workZone: 'Plateau',
    specialties: ['Transport VIP', 'Chauffeur personnel'],
    rating: 4.9,
    totalRides: 189,
    isAvailable: true,
    isActive: true
  },
  {
    firstName: 'Ouattara',
    lastName: 'Amadou',
    email: 'ouattara.amadou@example.com',
    phone: '+225 07 89 01 23 45',
    licenseType: 'Permis B',
    experience: '1-3 ans',
    vehicleType: 'Berline',
    vehicleBrand: 'Nissan Altima',
    vehicleYear: 2022,
    vehicleSeats: 5,
    workZone: 'Marcory',
    specialties: ['Taxi/VTC'],
    rating: 4.5,
    totalRides: 54,
    isAvailable: true,
    isActive: true
  }
];

// Données de test pour les offres
const sampleOffers = [
  {
    title: 'Chauffeur personnel VIP',
    description: 'Recherche chauffeur expérimenté pour transport VIP',
    type: 'Chauffeur personnel',
    workType: 'Temps plein',
    salary: '350000',
    salaryType: 'Mensuel',
    location: 'Cocody, Abidjan',
    licenseType: 'Permis B',
    experience: '5-10 ans',
    vehicleType: 'Berline',
    status: 'active'
  },
  {
    title: 'Chauffeur livreur',
    description: 'Société de logistique recherche chauffeur livreur',
    type: 'Livraison',
    workType: 'Temps plein',
    salary: '200000',
    salaryType: 'Mensuel',
    location: 'Yopougon, Abidjan',
    licenseType: 'Permis B',
    experience: '1-3 ans',
    vehicleType: 'Utilitaire',
    status: 'active'
  },
  {
    title: 'Chauffeur de direction',
    description: 'Multinationale recherche chauffeur de direction',
    type: 'Transport d\'entreprise',
    workType: 'Temps plein',
    salary: '400000',
    salaryType: 'Mensuel',
    location: 'Plateau, Abidjan',
    licenseType: 'Permis B',
    experience: '5-10 ans',
    vehicleType: '4x4/SUV',
    status: 'active'
  },
  {
    title: 'Chauffeur scolaire',
    description: 'École internationale recherche chauffeur pour transport scolaire',
    type: 'Transport scolaire',
    workType: 'Temps partiel',
    salary: '250000',
    salaryType: 'Mensuel',
    location: 'Cocody, Abidjan',
    licenseType: 'Permis D',
    experience: '3-5 ans',
    vehicleType: 'Minibus',
    status: 'active'
  },
  {
    title: 'Chauffeur taxi VTC',
    description: 'Compagnie de taxi recherche chauffeurs VTC',
    type: 'Taxi/VTC',
    workType: 'Flexible',
    salary: '180000',
    salaryType: 'Mensuel',
    location: 'Abobo, Abidjan',
    licenseType: 'Permis B',
    experience: '1-3 ans',
    vehicleType: 'Berline',
    status: 'active'
  }
];

// Fonction pour créer un utilisateur employeur de test
const createTestEmployer = async () => {
  const testEmployer = new User({
    firstName: 'Entreprise',
    lastName: 'Test',
    email: 'employer@test.com',
    password: 'password123', // À hasher en production
    role: 'employer',
    isActive: true
  });
  
  await testEmployer.save();
  return testEmployer._id;
};

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    console.log('🌱 Début du seed de la base de données...\n');

    // Supprimer les données existantes
    console.log('🗑️  Suppression des données existantes...');
    await Driver.deleteMany({});
    await Offer.deleteMany({});
    await User.deleteMany({ role: 'employer' });
    console.log('✅ Données existantes supprimées\n');

    // Créer un employeur de test
    console.log('👤 Création d\'un employeur de test...');
    const employerId = await createTestEmployer();
    console.log('✅ Employeur créé\n');

    // Insérer les chauffeurs
    console.log('🚗 Insertion des chauffeurs...');
    const insertedDrivers = await Driver.insertMany(sampleDrivers);
    console.log(`✅ ${insertedDrivers.length} chauffeurs insérés\n`);

    // Insérer les offres avec l'employerId
    console.log('📋 Insertion des offres...');
    const offersWithEmployer = sampleOffers.map(offer => ({
      ...offer,
      employerId
    }));
    const insertedOffers = await Offer.insertMany(offersWithEmployer);
    console.log(`✅ ${insertedOffers.length} offres insérées\n`);

    // Afficher les statistiques
    console.log('📊 Statistiques de la base de données:');
    console.log(`   - Chauffeurs: ${await Driver.countDocuments()}`);
    console.log(`   - Chauffeurs disponibles: ${await Driver.countDocuments({ isAvailable: true })}`);
    console.log(`   - Offres actives: ${await Offer.countDocuments({ status: 'active' })}`);
    console.log(`   - Employeurs: ${await User.countDocuments({ role: 'employer' })}`);
    
    // Calculer la note moyenne
    const drivers = await Driver.find({ rating: { $exists: true, $gt: 0 } });
    const avgRating = drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length;
    console.log(`   - Note moyenne: ${avgRating.toFixed(1)}\n`);

    console.log('✅ Seed terminé avec succès!');
    console.log('\n🔗 Testez l\'API:');
    console.log('   GET http://localhost:4000/api/stats/public');
    console.log('   GET http://localhost:4000/api/drivers');
    console.log('   GET http://localhost:4000/api/offers');
    console.log('\n🌐 Interface de test:');
    console.log('   http://localhost:5173/test-stats');
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connexion MongoDB fermée');
  }
};

// Exécuter le seed
connectDB().then(() => seedDatabase());
