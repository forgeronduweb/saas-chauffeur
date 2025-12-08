const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Offer = require('../models/Offer');

async function seedCompleteOffers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Supprimer toutes les offres existantes
    await Offer.deleteMany({});
    console.log('🗑️  Anciennes offres supprimées\n');

    // Créer un employeur de test s'il n'existe pas
    let employer = await User.findOne({ email: 'employeur.test@godriver.ci' });
    
    if (!employer) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      employer = await User.create({
        email: 'employeur.test@godriver.ci',
        passwordHash: hashedPassword,
        role: 'client',
        firstName: 'Employeur',
        lastName: 'Test',
        phone: '+225 07 00 00 00 00',
        isActive: true,
        isEmailVerified: true
      });
      console.log('✅ Employeur de test créé\n');
    } else {
      console.log('✅ Employeur de test existant trouvé\n');
    }

    // Offres complètes avec toutes les informations
    const completeOffers = [
      {
        title: 'Chauffeur personnel',
        company: 'Entreprise Privée',
        location: { zone: 'Cocody', city: 'Abidjan' },
        salaryRange: '250,000 - 350,000 FCFA',
        contractType: 'CDI',
        type: 'Personnel',
        description: 'Nous recherchons un chauffeur personnel expérimenté pour assurer le transport quotidien de notre dirigeant. Vous serez responsable de la conduite en toute sécurité, de l\'entretien du véhicule et de la planification des itinéraires.',
        requirements: {
          licenseType: 'B',
          experience: '3-5 ans',
          vehicleType: 'berline',
          zone: 'Cocody'
        },
        requirementsList: [
          'Permis de conduire catégorie B valide',
          '3 à 5 ans d\'expérience en tant que chauffeur',
          'Excellente connaissance d\'Abidjan',
          'Ponctualité et discrétion',
          'Présentation soignée'
        ],
        benefits: [
          'Salaire attractif',
          'Assurance santé',
          'Congés payés',
          'Formation continue',
          'Véhicule de fonction'
        ],
        conditions: {
          salary: 300000,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date(),
          schedule: 'Temps plein'
        }
      },
      {
        title: 'Chauffeur VIP',
        company: 'Hôtel 5 étoiles',
        location: { zone: 'Plateau', city: 'Abidjan' },
        salaryRange: '400,000 - 500,000 FCFA',
        contractType: 'CDI',
        type: 'Personnel',
        description: 'Hôtel de luxe recherche chauffeur VIP pour le transport de clients prestigieux. Service haut de gamme requis avec excellente présentation et maîtrise de l\'anglais.',
        requirements: {
          licenseType: 'B',
          experience: '5+ ans',
          vehicleType: 'autre',
          zone: 'Plateau'
        },
        requirementsList: [
          'Permis de conduire catégorie B',
          'Minimum 5 ans d\'expérience',
          'Maîtrise de l\'anglais',
          'Excellente présentation',
          'Expérience avec véhicules de luxe'
        ],
        benefits: [
          'Salaire très attractif',
          'Pourboires',
          'Assurance complète',
          'Uniforme fourni',
          'Repas sur place'
        ],
        conditions: {
          salary: 450000,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date(),
          schedule: 'Temps plein'
        }
      },
      {
        title: 'Chauffeur livreur',
        company: 'Société de logistique',
        location: { zone: 'Yopougon', city: 'Abidjan' },
        salaryRange: '180,000 - 220,000 FCFA',
        contractType: 'CDD',
        type: 'Livraison',
        description: 'Société de logistique recherche chauffeur livreur pour assurer la livraison de colis dans Abidjan. Connaissance des quartiers d\'Abidjan indispensable.',
        requirements: {
          licenseType: 'B',
          experience: '1-3 ans',
          vehicleType: 'utilitaire',
          zone: 'Yopougon'
        },
        requirementsList: [
          'Permis de conduire catégorie B',
          '1 à 3 ans d\'expérience',
          'Connaissance d\'Abidjan',
          'Sens de l\'organisation',
          'Bonne condition physique'
        ],
        benefits: [
          'Salaire fixe + primes',
          'Véhicule fourni',
          'Assurance',
          'Formation',
          'Évolution possible'
        ],
        conditions: {
          salary: 200000,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date(),
          schedule: 'Temps plein'
        }
      },
      {
        title: 'Chauffeur de direction',
        company: 'Multinationale',
        location: { zone: 'Marcory', city: 'Abidjan' },
        salaryRange: '350,000 - 450,000 FCFA',
        contractType: 'CDI',
        type: 'Personnel',
        description: 'Multinationale recherche chauffeur de direction pour assurer le transport de cadres supérieurs. Discrétion et professionnalisme exigés.',
        requirements: {
          licenseType: 'B',
          experience: '5+ ans',
          vehicleType: 'suv',
          zone: 'Marcory'
        },
        requirementsList: [
          'Permis de conduire catégorie B',
          '5 ans minimum d\'expérience',
          'Excellente présentation',
          'Discrétion absolue',
          'Connaissance protocole'
        ],
        benefits: [
          'Salaire très compétitif',
          'Véhicule de fonction',
          'Assurance premium',
          'Congés généreux',
          'Primes de performance'
        ],
        conditions: {
          salary: 400000,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date(),
          schedule: 'Temps plein'
        }
      },
      {
        title: 'Chauffeur scolaire',
        company: 'École internationale',
        location: { zone: 'Cocody', city: 'Abidjan' },
        salaryRange: '200,000 - 280,000 FCFA',
        contractType: 'CDI',
        type: 'Transport',
        description: 'École internationale recherche chauffeur scolaire pour le transport d\'élèves. Patience et sens des responsabilités requis.',
        requirements: {
          licenseType: 'B',
          experience: '3-5 ans',
          vehicleType: 'van',
          zone: 'Cocody'
        },
        requirementsList: [
          'Permis de conduire catégorie B',
          '3 à 5 ans d\'expérience',
          'Casier judiciaire vierge',
          'Patience avec les enfants',
          'Ponctualité exemplaire'
        ],
        benefits: [
          'Horaires adaptés',
          'Vacances scolaires',
          'Assurance santé',
          'Environnement familial',
          'Stabilité'
        ],
        conditions: {
          salary: 240000,
          salaryType: 'mensuel',
          workType: 'temps_partiel',
          startDate: new Date(),
          schedule: 'Temps partiel'
        }
      },
      {
        title: 'Chauffeur taxi',
        company: 'Compagnie de taxi',
        location: { zone: 'Abobo', city: 'Abidjan' },
        salaryRange: '150,000 - 200,000 FCFA',
        contractType: 'Indépendant',
        type: 'VTC',
        description: 'Compagnie de taxi recherche chauffeurs indépendants. Flexibilité des horaires et revenus attractifs selon activité.',
        requirements: {
          licenseType: 'B',
          experience: '1-3 ans',
          vehicleType: 'berline',
          zone: 'Abobo'
        },
        requirementsList: [
          'Permis de conduire catégorie B',
          '1 à 3 ans d\'expérience',
          'Connaissance d\'Abidjan',
          'Sens du service client',
          'Indépendance'
        ],
        benefits: [
          'Horaires flexibles',
          'Revenus selon activité',
          'Véhicule disponible',
          'Assurance incluse',
          'Liberté d\'organisation'
        ],
        conditions: {
          salary: 175000,
          salaryType: 'mensuel',
          workType: 'ponctuel',
          startDate: new Date(),
          schedule: 'Flexible'
        }
      }
    ];

    console.log('📊 Enregistrement des offres complètes...\n');

    for (const offerData of completeOffers) {
      const offer = await Offer.create({
        title: offerData.title,
        description: offerData.description,
        type: offerData.type,
        employerId: employer._id,
        requirements: offerData.requirements,
        requirementsList: offerData.requirementsList,
        conditions: offerData.conditions,
        status: 'active',
        location: {
          address: offerData.location.zone,
          city: offerData.location.city,
          coordinates: {}
        },
        company: offerData.company,
        contractType: offerData.contractType,
        salaryRange: offerData.salaryRange,
        benefits: offerData.benefits,
        isUrgent: false
      });

      console.log(`✅ ${offer.title}`);
      console.log(`   Entreprise: ${offer.company}`);
      console.log(`   Localisation: ${offer.location.address}, ${offer.location.city}`);
      console.log(`   Salaire: ${offer.salaryRange}`);
      console.log(`   Contrat: ${offer.contractType}`);
      console.log(`   ${offer.requirementsList.length} exigences`);
      console.log(`   ${offer.benefits.length} avantages\n`);
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ${completeOffers.length} offres complètes enregistrées!\n`);
    
    console.log('✅ Seed terminé!');
    console.log('\n📝 Informations de connexion employeur:');
    console.log('   Email: employeur.test@godriver.ci');
    console.log('   Mot de passe: password123\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

seedCompleteOffers();
