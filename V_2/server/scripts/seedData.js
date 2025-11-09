const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const Application = require('../models/Application');

async function seedData() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await Application.deleteMany({});
    await Offer.deleteMany({});
    await Driver.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Données existantes supprimées');

    // Créer des utilisateurs employeurs
    const employers = await User.create([
      {
        email: 'employeur1@example.com',
        passwordHash: '$2b$12$6g6lASMDTQ8JrqW.iE4zA.Wv17ZfUIuAskceTAV/FocpKRXIH3pni', // password123
        role: 'client',
        firstName: 'Marie',
        lastName: 'Dubois',
        phone: '01 23 45 67 89'
      },
      {
        email: 'employeur2@example.com',
        passwordHash: '$2b$12$6g6lASMDTQ8JrqW.iE4zA.Wv17ZfUIuAskceTAV/FocpKRXIH3pni', // password123
        role: 'client',
        firstName: 'Pierre',
        lastName: 'Martin',
        phone: '01 98 76 54 32'
      }
    ]);

    // Créer des utilisateurs chauffeurs
    const drivers = await User.create([
      {
        email: 'chauffeur1@example.com',
        passwordHash: '$2b$12$6g6lASMDTQ8JrqW.iE4zA.Wv17ZfUIuAskceTAV/FocpKRXIH3pni', // password123
        role: 'driver',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '06 12 34 56 78'
      },
      {
        email: 'chauffeur2@example.com',
        passwordHash: '$2b$12$6g6lASMDTQ8JrqW.iE4zA.Wv17ZfUIuAskceTAV/FocpKRXIH3pni', // password123
        role: 'driver',
        firstName: 'Sophie',
        lastName: 'Leroy',
        phone: '06 98 76 54 32'
      },
      {
        email: 'chauffeur3@example.com',
        passwordHash: '$2b$12$6g6lASMDTQ8JrqW.iE4zA.Wv17ZfUIuAskceTAV/FocpKRXIH3pni', // password123
        role: 'driver',
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        phone: '06 55 44 33 22'
      }
    ]);

    // Créer les profils chauffeurs
    await Driver.create([
      {
        userId: drivers[0]._id,
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '06 12 34 56 78',
        email: 'chauffeur1@example.com',
        licenseType: 'B',
        licenseNumber: 'B123456789',
        licenseDate: new Date('2020-01-15'),
        experience: '3-5',
        vehicleType: 'berline',
        vehicleBrand: 'Peugeot',
        vehicleModel: '508',
        vehicleYear: 2021,
        vehicleSeats: 5,
        workZone: 'Paris',
        specialties: ['vtc', 'transport_personnel'],
        status: 'approved',
        isAvailable: true,
        rating: 4.8,
        completedMissions: 45
      },
      {
        userId: drivers[1]._id,
        firstName: 'Sophie',
        lastName: 'Leroy',
        phone: '06 98 76 54 32',
        email: 'chauffeur2@example.com',
        licenseType: 'B',
        licenseNumber: 'B987654321',
        licenseDate: new Date('2018-06-20'),
        experience: '10+',
        vehicleType: 'suv',
        vehicleBrand: 'BMW',
        vehicleModel: 'X3',
        vehicleYear: 2022,
        vehicleSeats: 7,
        workZone: 'Paris',
        specialties: ['transport_groupe', 'longue_distance'],
        status: 'approved',
        isAvailable: true,
        rating: 4.9,
        completedMissions: 78
      },
      {
        userId: drivers[2]._id,
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        phone: '06 55 44 33 22',
        email: 'chauffeur3@example.com',
        licenseType: 'A',
        licenseNumber: 'A555444333',
        licenseDate: new Date('2021-03-10'),
        experience: '1-3',
        vehicleType: 'moto',
        vehicleBrand: 'Honda',
        vehicleModel: 'CB 650R',
        vehicleYear: 2023,
        vehicleSeats: 2,
        workZone: 'Marseille',
        specialties: ['livraison'],
        status: 'approved',
        isAvailable: true,
        rating: 4.6,
        completedMissions: 23
      }
    ]);

    // Créer des offres
    const offers = await Offer.create([
      {
        title: 'Chauffeur personnel pour dirigeant',
        description: 'Recherche chauffeur expérimenté pour transport quotidien d\'un dirigeant d\'entreprise. Discrétion et ponctualité exigées.',
        type: 'Personnel',
        employerId: employers[0]._id,
        requirements: {
          licenseType: 'B',
          experience: '5+ ans',
          vehicleType: 'berline',
          zone: 'Paris'
        },
        conditions: {
          salary: 2500,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date('2024-11-01'),
          endDate: new Date('2025-01-31'),
          schedule: 'Lundi-Vendredi 7h-19h'
        },
        location: {
          address: '15 Avenue des Champs-Élysées',
          city: 'Paris',
          coordinates: {
            latitude: 48.8566,
            longitude: 2.3522
          }
        },
        tags: ['VIP', 'Discrétion', 'Expérience'],
        isUrgent: true,
        contactInfo: {
          phone: '01 23 45 67 89',
          email: 'employeur1@example.com',
          preferredContact: 'phone'
        }
      },
      {
        title: 'Chauffeur-livreur pour restaurant',
        description: 'Restaurant recherche chauffeur-livreur pour livraisons en soirée. Véhicule fourni.',
        type: 'Livraison',
        employerId: employers[1]._id,
        requirements: {
          licenseType: 'B',
          experience: '1-3 ans',
          zone: 'Paris'
        },
        conditions: {
          salary: 12,
          salaryType: 'horaire',
          workType: 'temps_partiel',
          startDate: new Date('2024-10-20'),
          schedule: '18h-23h du mardi au dimanche'
        },
        location: {
          address: '25 Rue de la Paix',
          city: 'Paris',
          coordinates: {
            latitude: 48.8698,
            longitude: 2.3316
          }
        },
        tags: ['Soirée', 'Restaurant', 'Véhicule fourni'],
        contactInfo: {
          phone: '01 98 76 54 32',
          email: 'employeur2@example.com',
          preferredContact: 'platform'
        }
      },
      {
        title: 'Chauffeur VTC week-ends',
        description: 'Société de VTC recherche chauffeurs pour renforcer l\'équipe les week-ends.',
        type: 'VTC',
        employerId: employers[0]._id,
        requirements: {
          licenseType: 'B',
          experience: '3-5 ans',
          vehicleType: 'berline',
          zone: 'Paris'
        },
        conditions: {
          salary: 150,
          salaryType: 'journalier',
          workType: 'weekend',
          startDate: new Date('2024-10-25'),
          schedule: 'Samedi-Dimanche 6h-22h'
        },
        location: {
          city: 'Paris'
        },
        tags: ['VTC', 'Week-end', 'Flexible'],
        contactInfo: {
          email: 'employeur1@example.com',
          preferredContact: 'email'
        }
      }
    ]);

    // Créer des candidatures
    await Application.create([
      {
        offerId: offers[0]._id,
        driverId: drivers[0]._id,
        message: 'Bonjour, je suis très intéressé par ce poste. J\'ai 5 ans d\'expérience en transport de dirigeants.',
        status: 'pending',
        proposedSalary: 2500,
        availability: {
          startDate: new Date('2024-11-01'),
          schedule: 'Disponible du lundi au vendredi'
        },
        experience: {
          years: '3-5 ans',
          description: 'Transport de dirigeants, connaissance parfaite de Paris'
        }
      },
      {
        offerId: offers[0]._id,
        driverId: drivers[1]._id,
        message: 'Madame, Monsieur, fort de mes 8 ans d\'expérience, je serais ravi de rejoindre votre équipe.',
        status: 'accepted',
        proposedSalary: 2600,
        availability: {
          startDate: new Date('2024-11-01'),
          schedule: 'Très flexible'
        },
        experience: {
          years: '5+ ans',
          description: 'Expérience avec clientèle VIP, véhicule haut de gamme'
        },
        reviewedAt: new Date(),
        reviewedBy: employers[0]._id,
        employerNotes: 'Excellent profil, candidature retenue'
      },
      {
        offerId: offers[1]._id,
        driverId: drivers[2]._id,
        message: 'Intéressé par ce poste de livreur, disponible immédiatement.',
        status: 'pending',
        availability: {
          startDate: new Date('2024-10-20'),
          schedule: 'Disponible tous les soirs'
        },
        experience: {
          years: '1-3 ans',
          description: 'Expérience en livraison rapide, connaissance des quartiers'
        }
      }
    ]);

    console.log('✅ Données de test créées avec succès !');
    console.log(`
📊 Résumé des données créées :
- ${employers.length} employeurs
- ${drivers.length} chauffeurs  
- ${offers.length} offres
- 3 candidatures

🔑 Comptes de test :
Employeurs :
- employeur1@example.com / password123
- employeur2@example.com / password123

Chauffeurs :
- chauffeur1@example.com / password123
- chauffeur2@example.com / password123
- chauffeur3@example.com / password123
    `);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
