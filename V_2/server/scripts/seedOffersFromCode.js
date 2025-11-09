const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Offer = require('../models/Offer');

async function seedOffersFromCode() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

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

    // Offres de test à enregistrer avec toutes les informations
    const testOffers = [
      {
        title: 'Chauffeur personnel',
        company: 'Entreprise Privée',
        location: 'Cocody, Abidjan',
        salary: '250,000 - 350,000 FCFA',
        contractType: 'CDI',
        workType: 'Temps plein',
        vehicleType: 'Berline',
        experience: '3-5 ans',
        description: 'Nous recherchons un chauffeur personnel expérimenté pour assurer le transport quotidien de notre dirigeant. Vous serez responsable de la conduite en toute sécurité, de l\'entretien du véhicule et de la planification des itinéraires.',
        requirements: [
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
        ]
      },
      {
        title: 'Chauffeur VIP',
        company: 'Hôtel 5 étoiles',
        location: 'Plateau, Abidjan',
        salary: '400,000 - 500,000 FCFA',
        contractType: 'CDI',
        workType: 'Temps plein',
        vehicleType: 'Véhicule de luxe',
        experience: '5-10 ans'
      },
      {
        title: 'Chauffeur livreur',
        company: 'Société de logistique',
        location: 'Yopougon, Abidjan',
        salary: '180,000 - 220,000 FCFA',
        contractType: 'CDD',
        workType: 'Temps plein',
        vehicleType: 'Utilitaire',
        experience: '1-3 ans'
      },
      {
        title: 'Chauffeur de direction',
        company: 'Multinationale',
        location: 'Marcory, Abidjan',
        salary: '350,000 - 450,000 FCFA',
        contractType: 'CDI',
        workType: 'Temps plein',
        vehicleType: '4x4/SUV',
        experience: '5-10 ans'
      },
      {
        title: 'Chauffeur scolaire',
        company: 'École internationale',
        location: 'Cocody, Abidjan',
        salary: '200,000 - 280,000 FCFA',
        contractType: 'CDI',
        workType: 'Temps partiel',
        vehicleType: 'Minibus',
        experience: '3-5 ans'
      },
      {
        title: 'Chauffeur taxi',
        company: 'Compagnie de taxi',
        location: 'Abobo, Abidjan',
        salary: '150,000 - 200,000 FCFA',
        contractType: 'Indépendant',
        workType: 'Flexible',
        vehicleType: 'Berline',
        experience: '1-3 ans'
      }
    ];

    console.log('📊 Enregistrement des offres...\n');

    for (const offerData of testOffers) {
      // Extraire la ville et la zone de la location
      const [zone, city] = offerData.location.split(', ');
      
      // Déterminer le type d'offre basé sur le titre
      let offerType = 'Personnel';
      if (offerData.title.toLowerCase().includes('livreur')) {
        offerType = 'Livraison';
      } else if (offerData.title.toLowerCase().includes('taxi')) {
        offerType = 'VTC';
      } else if (offerData.title.toLowerCase().includes('transport')) {
        offerType = 'Transport';
      }

      // Extraire le salaire min et max
      const salaryMatch = offerData.salary.match(/(\d[\d\s,]*)/g);
      let minSalary = 200000;
      let maxSalary = 300000;
      
      if (salaryMatch && salaryMatch.length >= 2) {
        minSalary = parseInt(salaryMatch[0].replace(/[\s,]/g, ''));
        maxSalary = parseInt(salaryMatch[1].replace(/[\s,]/g, ''));
      }
      
      const avgSalary = Math.floor((minSalary + maxSalary) / 2);

      // Mapper l'expérience aux valeurs enum
      let experienceEnum = '1-3 ans';
      if (offerData.experience === '5-10 ans' || offerData.experience === '5+ ans') {
        experienceEnum = '5+ ans';
      } else if (offerData.experience === '3-5 ans') {
        experienceEnum = '3-5 ans';
      } else if (offerData.experience === '1-3 ans') {
        experienceEnum = '1-3 ans';
      } else {
        experienceEnum = 'Débutant';
      }

      // Mapper le type de véhicule aux valeurs enum
      let vehicleTypeEnum = 'autre';
      const vehicleLower = offerData.vehicleType.toLowerCase();
      if (vehicleLower.includes('berline')) {
        vehicleTypeEnum = 'berline';
      } else if (vehicleLower.includes('suv') || vehicleLower.includes('4x4')) {
        vehicleTypeEnum = 'suv';
      } else if (vehicleLower.includes('utilitaire')) {
        vehicleTypeEnum = 'utilitaire';
      } else if (vehicleLower.includes('moto')) {
        vehicleTypeEnum = 'moto';
      } else if (vehicleLower.includes('minibus') || vehicleLower.includes('van')) {
        vehicleTypeEnum = 'van';
      }

      // Mapper le workType
      let workTypeEnum = 'temps_plein';
      if (offerData.workType.toLowerCase().includes('partiel')) {
        workTypeEnum = 'temps_partiel';
      } else if (offerData.workType.toLowerCase().includes('flexible') || offerData.workType.toLowerCase().includes('ponctuel')) {
        workTypeEnum = 'ponctuel';
      }

      // Créer l'offre
      const offer = await Offer.create({
        title: offerData.title,
        description: `Nous recherchons un ${offerData.title.toLowerCase()} expérimenté pour rejoindre notre équipe. Vous serez en charge de la conduite et de l'entretien du véhicule.`,
        type: offerType,
        employerId: employer._id,
        requirements: {
          licenseType: 'B',
          experience: experienceEnum,
          vehicleType: vehicleTypeEnum,
          zone: zone
        },
        conditions: {
          salary: avgSalary,
          salaryType: 'mensuel',
          workType: workTypeEnum,
          startDate: new Date(),
          schedule: offerData.workType
        },
        status: 'active',
        location: {
          address: zone,
          city: city || 'Abidjan',
          coordinates: {}
        },
        company: offerData.company,
        contractType: offerData.contractType,
        salaryRange: offerData.salary,
        offerType: offerType,
        isUrgent: false,
        isDirect: false
      });

      console.log(`✅ ${offer.title}`);
      console.log(`   Entreprise: ${offer.company}`);
      console.log(`   Localisation: ${offer.location.address}, ${offer.location.city}`);
      console.log(`   Salaire: ${offer.salaryRange}`);
      console.log(`   Contrat: ${offer.contractType}`);
      console.log(`   Type: ${offer.type}\n`);
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ${testOffers.length} offres enregistrées avec succès!\n`);
    
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

seedOffersFromCode();
