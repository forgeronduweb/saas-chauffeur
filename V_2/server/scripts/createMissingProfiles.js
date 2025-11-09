require('dotenv').config();
const { connectToDatabase } = require('../db/connect');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Employer = require('../models/Employer');

async function createMissingProfiles() {
  try {
    await connectToDatabase();
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs avec rôle driver qui n'ont pas de profil
    const driversWithoutProfile = await User.find({ role: 'driver' });
    console.log(`\n📊 ${driversWithoutProfile.length} utilisateurs avec rôle "driver" trouvés`);

    let createdDrivers = 0;
    let existingDrivers = 0;

    for (const user of driversWithoutProfile) {
      const existingDriver = await Driver.findOne({ userId: user._id });
      
      if (!existingDriver) {
        const driverData = {
          userId: user._id,
          firstName: user.firstName || 'Prénom',
          lastName: user.lastName || 'Nom',
          phone: user.phone || '06 00 00 00 00',
          email: user.email,
          licenseType: 'B',
          licenseNumber: `B${Math.random().toString().substr(2, 9)}`,
          licenseDate: new Date('2020-01-01'),
          experience: '<1',
          vehicleType: 'berline',
          vehicleBrand: 'Renault',
          vehicleModel: 'Clio',
          vehicleYear: 2020,
          vehicleSeats: 5,
          workZone: 'Abidjan',
          specialties: ['transport_personnel'],
          status: 'approved',
          isAvailable: true,
          profilePhotoUrl: user.profilePhotoUrl || ''
        };

        await Driver.create(driverData);
        console.log(`✅ Profil Driver créé pour: ${user.firstName} ${user.lastName} (${user.email})`);
        createdDrivers++;
      } else {
        console.log(`ℹ️  Profil existe déjà pour: ${user.firstName} ${user.lastName} (${user.email})`);
        existingDrivers++;
      }
    }

    // Trouver tous les utilisateurs avec rôle employer qui n'ont pas de profil
    const employersWithoutProfile = await User.find({ role: 'employer' });
    console.log(`\n📊 ${employersWithoutProfile.length} utilisateurs avec rôle "employer" trouvés`);

    let createdEmployers = 0;
    let existingEmployers = 0;

    for (const user of employersWithoutProfile) {
      const existingEmployer = await Employer.findOne({ userId: user._id });
      
      if (!existingEmployer) {
        const employerData = {
          userId: user._id,
          firstName: user.firstName || 'Prénom',
          lastName: user.lastName || 'Nom',
          email: user.email,
          phone: user.phone || '',
          status: 'approved',
          isActive: true
        };

        await Employer.create(employerData);
        console.log(`✅ Profil Employer créé pour: ${user.firstName} ${user.lastName} (${user.email})`);
        createdEmployers++;
      } else {
        console.log(`ℹ️  Profil existe déjà pour: ${user.firstName} ${user.lastName} (${user.email})`);
        existingEmployers++;
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`   - Profils Driver créés: ${createdDrivers}`);
    console.log(`   - Profils Driver existants: ${existingDrivers}`);
    console.log(`   - Profils Employer créés: ${createdEmployers}`);
    console.log(`   - Profils Employer existants: ${existingEmployers}`);
    console.log('\n✅ Migration terminée avec succès!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

createMissingProfiles();
