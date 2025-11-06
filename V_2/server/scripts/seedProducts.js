const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('../models/Offer');
const User = require('../models/User');

// Helper pour ajouter les champs requis par le modèle Offer
const addRequiredFields = (product) => ({
  ...product,
  type: 'Autre', // Type valide pour les produits
  requirements: {
    licenseType: 'B',
    experience: '1-3 ans',
    vehicleType: 'berline',
    zone: product.location?.city || 'Abidjan'
  },
  conditions: {
    salary: product.price || 0,
    salaryType: 'mensuel',
    workType: 'temps_plein',
    startDate: new Date(),
    schedule: 'Disponible immédiatement'
  }
});

const productsData = [
  {
    title: 'Pneus Michelin Primacy 4',
    description: 'Pneus haute performance pour berlines et SUV. Excellente adhérence sur route mouillée et sèche. Durée de vie prolongée grâce à la technologie EverGrip. Dimension : 205/55 R16. État neuf avec garantie constructeur.',
    category: 'Pièces auto',
    price: 85000,
    brand: 'Michelin',
    condition: 'Neuf',
    stock: 12,
    location: {
      address: 'Zone industrielle',
      city: 'Abidjan'
    },
    contactInfo: {
      phone: '+225 07 12 34 56 78',
      email: 'contact@autopiecesci.com',
      preferredContact: 'phone'
    },
    requirementsList: [
      'Garantie 2 ans',
      'Compatible tous véhicules',
      'Certifié ISO 9001',
      'Livraison disponible',
      'Installation offerte'
    ],
    benefits: [
      'Meilleure adhérence',
      'Économie de carburant',
      'Durée de vie prolongée',
      'Prix compétitif',
      'Service après-vente'
    ],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    tags: ['pneus', 'michelin', 'auto'],
    status: 'active'
  },
  {
    title: 'Huile Moteur Total Quartz 9000',
    description: 'Huile moteur synthétique haute performance. Protection optimale du moteur. Convient pour essence et diesel. Norme 5W-40. Bidon de 5 litres. Recommandée pour les véhicules récents.',
    type: 'Produit',
    category: 'Entretien',
    price: 35000,
    brand: 'Total',
    condition: 'Neuf',
    stock: 25,
    location: {
      address: 'Marcory Zone 4',
      city: 'Abidjan'
    },
    contactInfo: {
      phone: '+225 05 98 76 54 32',
      email: 'vente@lubrifiantsci.com',
      preferredContact: 'email'
    },
    requirementsList: [
      'Norme API SN/CF',
      'Viscosité 5W-40',
      'Bidon 5 litres',
      'Date de péremption 2026',
      'Scellé d\'origine'
    ],
    benefits: [
      'Protection moteur',
      'Économie de carburant',
      'Démarrage facile',
      'Prix grossiste',
      'Livraison rapide'
    ],
    images: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop',
    tags: ['huile', 'total', 'entretien'],
    status: 'active'
  },
  {
    title: 'Batterie Varta Silver Dynamic',
    description: 'Batterie 12V 70Ah pour voitures essence et diesel. Technologie AGM pour une durée de vie prolongée. Démarrage puissant même par temps froid. Garantie 3 ans. Installation gratuite.',
    type: 'Produit',
    category: 'Pièces auto',
    price: 95000,
    brand: 'Varta',
    condition: 'Neuf',
    stock: 8,
    location: {
      address: 'Cocody Angré',
      city: 'Abidjan'
    },
    contactInfo: {
      phone: '+225 07 45 67 89 01',
      email: 'info@batteriesci.com',
      preferredContact: 'phone'
    },
    requirementsList: [
      'Capacité 70Ah',
      'Tension 12V',
      'Technologie AGM',
      'Garantie 3 ans',
      'Installation incluse'
    ],
    benefits: [
      'Démarrage puissant',
      'Longue durée de vie',
      'Résistant au froid',
      'Sans entretien',
      'Recyclage gratuit'
    ],
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop',
    tags: ['batterie', 'varta', 'électrique'],
    status: 'active'
  },
  {
    title: 'Kit Freinage Bosch Complet',
    description: 'Kit de freinage complet incluant plaquettes et disques avant. Qualité OEM Bosch. Compatible avec la plupart des berlines. Installation professionnelle recommandée. Garantie 2 ans pièces et main d\'œuvre.',
    type: 'Produit',
    category: 'Pièces auto',
    price: 125000,
    brand: 'Bosch',
    condition: 'Neuf',
    stock: 6,
    location: {
      address: 'Yopougon Siporex',
      city: 'Abidjan'
    },
    contactInfo: {
      phone: '+225 01 23 45 67 89',
      email: 'contact@freinsci.com',
      preferredContact: 'platform'
    },
    requirementsList: [
      'Plaquettes + Disques',
      'Qualité OEM',
      'Compatible berlines',
      'Garantie 2 ans',
      'Certification ECE R90'
    ],
    benefits: [
      'Freinage efficace',
      'Durée de vie longue',
      'Installation pro',
      'Prix tout compris',
      'Diagnostic gratuit'
    ],
    images: [
      'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=600&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=600&fit=crop',
    tags: ['freins', 'bosch', 'sécurité'],
    status: 'active'
  },
  {
    title: 'GPS Garmin Drive 52',
    description: 'GPS automobile avec écran 5 pouces. Cartes d\'Afrique de l\'Ouest préchargées. Alertes de sécurité et trafic en temps réel. Bluetooth pour appels mains libres. Mise à jour gratuite des cartes.',
    type: 'Produit',
    category: 'Électronique',
    price: 75000,
    brand: 'Garmin',
    condition: 'Neuf',
    stock: 15,
    location: {
      address: 'Plateau Centre',
      city: 'Abidjan'
    },
    contactInfo: {
      phone: '+225 07 11 22 33 44',
      email: 'vente@techautoci.com',
      preferredContact: 'email'
    },
    requirementsList: [
      'Écran 5 pouces',
      'Cartes Afrique préchargées',
      'Bluetooth intégré',
      'Alertes trafic',
      'Mise à jour gratuite'
    ],
    benefits: [
      'Navigation précise',
      'Interface simple',
      'Appels mains libres',
      'Économie de temps',
      'Support technique'
    ],
    images: [
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop'
    ],
    mainImage: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop',
    tags: ['gps', 'garmin', 'navigation'],
    status: 'active'
  }
];

async function seedProducts() {
  try {
    // Connexion à MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chauffeurs';
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB');

    // Trouver un utilisateur client pour associer les produits
    let employer = await User.findOne({ role: 'client' });
    
    if (!employer) {
      console.log('Création d\'un utilisateur client...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      employer = await User.create({
        email: 'vendeur@autopiecesci.com',
        passwordHash: hashedPassword,
        firstName: 'Auto',
        lastName: 'Pièces CI',
        phone: '+225 07 12 34 56 78',
        role: 'client'
      });
      console.log('✅ Utilisateur client créé');
    }

    // Supprimer les anciens produits
    await Offer.deleteMany({ type: 'Produit' });
    console.log('🗑️  Anciens produits supprimés');

    // Ajouter l'employerId et les champs requis à chaque produit
    const productsWithEmployer = productsData.map(product => ({
      ...addRequiredFields(product),
      employerId: employer._id
    }));

    // Insérer les nouveaux produits
    const insertedProducts = await Offer.insertMany(productsWithEmployer);
    console.log(`✅ ${insertedProducts.length} produits insérés avec succès`);

    // Afficher les IDs des produits
    console.log('\n📦 Produits créés:');
    insertedProducts.forEach(product => {
      console.log(`- ${product.title} (ID: ${product._id})`);
    });

    console.log('\n✨ Seed terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedProducts();
