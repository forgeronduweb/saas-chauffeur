const Driver = require('../models/Driver');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Fonction pour notifier les employeurs d'une mise à jour de profil
const notifyEmployersOfProfileUpdate = async (driver) => {
  try {
    // Récupérer tous les employeurs actifs
    const employers = await User.find({ 
      role: 'employer', 
      isActive: true 
    }).select('_id firstName lastName');

    if (employers.length === 0) return;

    // Créer une notification pour chaque employeur
    const notifications = employers.map(employer => ({
      userId: employer._id,
      type: 'driver_profile_updated',
      title: 'Profil chauffeur mis à jour',
      message: `${driver.firstName} ${driver.lastName} a mis à jour son profil. Consultez les nouvelles informations.`,
      data: {
        driverId: driver._id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        updateTime: new Date()
      },
      unread: true
    }));

    // Insérer toutes les notifications en une fois
    await Notification.insertMany(notifications);
    
    console.log(`Notifications envoyées à ${employers.length} employeurs pour la mise à jour du profil de ${driver.firstName} ${driver.lastName}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications aux employeurs:', error);
    // Ne pas faire échouer la mise à jour du profil si les notifications échouent
  }
};

// Obtenir le profil du chauffeur connecté
const getDriverProfile = async (req, res) => {
  try {
    console.log('=== RÉCUPÉRATION PROFIL CHAUFFEUR ===');
    console.log('req.user:', req.user);
    
    const userId = req.user.sub;
    console.log('Recherche profil pour userId:', userId);
    
    let driver = await Driver.findOne({ userId })
      .populate('userId', 'email firstName lastName phone isActive')
      .lean();
      
    console.log('Driver trouvé:', driver ? 'oui' : 'non');
    if (driver) {
      console.log('Driver data:', {
        _id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        workExperience: driver.workExperience?.length || 0
      });
      console.log('workExperience récupéré:', driver.workExperience);
    }

    // Si le profil n'existe pas, retourner les données de base de l'utilisateur
    if (!driver) {
      const user = await User.findById(userId).select('email firstName lastName phone isActive').lean();
      if (!user) {
        return res.status(404).json({ 
          error: 'Utilisateur non trouvé' 
        });
      }
      
      // Créer un objet driver avec les données de base
      driver = {
        userId: user,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      };
    }

    res.json({
      driver
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil chauffeur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du profil' 
    });
  }
};

// Mettre à jour le profil du chauffeur
const updateDriverProfile = async (req, res) => {
  try {
    console.log('=== MISE À JOUR PROFIL CHAUFFEUR ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    const userId = req.user.sub;
    const updateData = req.body;
    
    console.log('userId:', userId);
    console.log('updateData keys:', Object.keys(updateData));

    // Champs autorisés à être mis à jour
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'licenseType', 'licenseNumber', 
      'licenseDate', 'vtcCard', 'experience', 'vehicleType', 'vehicleBrand', 
      'vehicleModel', 'vehicleYear', 'vehicleSeats', 'workZone', 'specialties',
      'isAvailable', 'notifications', 'workExperience'
    ];

    // Filtrer les champs autorisés
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updateData[key];
        
        // Parser les champs JSON si ils arrivent sous forme de string (FormData)
        if ((key === 'specialties' || key === 'workExperience') && typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.error(`Erreur lors du parsing de ${key}:`, e);
            // Garder la valeur originale en cas d'erreur
          }
        }
        
        filteredData[key] = value;
      }
    });

    console.log('Données filtrées à sauvegarder:', filteredData);
    console.log('workExperience à sauvegarder:', filteredData.workExperience);

    let driver = await Driver.findOneAndUpdate(
      { userId },
      filteredData,
      { new: true, runValidators: true }
    ).populate('userId', 'email firstName lastName phone');

    console.log('Driver après mise à jour:', driver ? 'trouvé' : 'non trouvé');

    // Si le profil n'existe pas, le créer
    if (!driver) {
      driver = await Driver.create({
        userId,
        ...filteredData
      });
      
      // Populer les données utilisateur
      await driver.populate('userId', 'email firstName lastName phone');
    }

    // Mettre à jour aussi les infos de base dans User si nécessaire
    if (filteredData.firstName || filteredData.lastName || filteredData.email || filteredData.phone) {
      const userUpdateData = {};
      if (filteredData.firstName) userUpdateData.firstName = filteredData.firstName;
      if (filteredData.lastName) userUpdateData.lastName = filteredData.lastName;
      if (filteredData.email) userUpdateData.email = filteredData.email;
      if (filteredData.phone) userUpdateData.phone = filteredData.phone;
      
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Notifier les employeurs de la mise à jour du profil
    await notifyEmployersOfProfileUpdate(driver);

    console.log('=== PROFIL SAUVEGARDÉ AVEC SUCCÈS ===');
    console.log('Driver final:', {
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      workExperience: driver.workExperience?.length || 0
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      driver
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil chauffeur:', error);
    console.error('Type d\'erreur:', error.name);
    console.error('Message d\'erreur:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Erreurs de validation:', error.errors);
      return res.status(400).json({ 
        error: 'Données invalides',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du profil' 
    });
  }
};

// Obtenir tous les chauffeurs (pour les admins)
const getAllDrivers = async (req, res) => {
  try {
    const { 
      status, 
      isAvailable, 
      vehicleType, 
      experience,
      page = 1, 
      limit = 10,
      search
    } = req.query;

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (vehicleType) filter.vehicleType = vehicleType;
    if (experience) filter.experience = experience;

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { workZone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const drivers = await Driver.find(filter)
      .populate('userId', 'email isActive lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Driver.countDocuments(filter);

    res.json({
      drivers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des chauffeurs' 
    });
  }
};

// Approuver/rejeter un chauffeur (admin seulement)
const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ 
        error: 'Statut invalide' 
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { 
        status,
        statusReason: reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user.sub
      },
      { new: true }
    ).populate('userId', 'email firstName lastName');

    if (!driver) {
      return res.status(404).json({ 
        error: 'Chauffeur non trouvé' 
      });
    }

    res.json({
      message: `Statut du chauffeur mis à jour: ${status}`,
      driver
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut' 
    });
  }
};

// Mettre à jour la localisation du chauffeur
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude et longitude requises' 
      });
    }

    const driver = await Driver.findOneAndUpdate(
      { userId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ 
        error: 'Profil chauffeur non trouvé' 
      });
    }

    res.json({
      message: 'Localisation mise à jour',
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: driver.lastLocationUpdate
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la localisation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la localisation' 
    });
  }
};

// Rechercher des chauffeurs à proximité
const findNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000, vehicleType } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude et longitude requises' 
      });
    }

    const filter = {
      status: 'approved',
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const drivers = await Driver.find(filter)
      .select('firstName lastName vehicleType vehicleBrand vehicleModel rating totalRides currentLocation phone')
      .limit(20)
      .lean();

    res.json({
      drivers: drivers.map(driver => ({
        ...driver,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          driver.currentLocation.coordinates[1],
          driver.currentLocation.coordinates[0]
        )
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la recherche de chauffeurs:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la recherche de chauffeurs' 
    });
  }
};

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100; // Distance en km, arrondie à 2 décimales
}

// Obtenir le profil d'un chauffeur par son ID (pour les employeurs)
const getDriverProfileById = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    console.log('Recherche du profil pour driverId:', driverId);
    
    // Rechercher le chauffeur par son ID
    const driver = await Driver.findById(driverId)
      .populate('userId', 'firstName lastName email phone')
      .select('-__v -createdAt -updatedAt');
    
    if (!driver) {
      console.log('Chauffeur non trouvé pour ID:', driverId);
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }
    
    console.log('Profil chauffeur trouvé:', driver.userId?.firstName, driver.userId?.lastName);
    
    // Construire la réponse avec les informations publiques
    const publicProfile = {
      _id: driver._id,
      userId: driver.userId?._id, // Ajouter l'ID utilisateur pour le chat
      firstName: driver.userId?.firstName || 'Prénom non disponible',
      lastName: driver.userId?.lastName || 'Nom non disponible',
      email: driver.userId?.email,
      phone: driver.userId?.phone,
      licenseType: driver.licenseType,
      experience: driver.experience,
      vehicleType: driver.vehicleType,
      vehicleBrand: driver.vehicleBrand,
      vehicleYear: driver.vehicleYear,
      vehicleSeats: driver.vehicleSeats,
      workZone: driver.workZone,
      specialties: driver.specialties,
      workExperience: driver.workExperience,
      rating: driver.rating || 0,
      totalRides: driver.totalRides || 0,
      profilePhotoUrl: driver.profilePhotoUrl,
      isAvailable: driver.isAvailable
    };
    
    res.json(publicProfile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil du chauffeur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir le nombre total de chauffeurs
const getDriversCount = async (req, res) => {
  try {
    const count = await Driver.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de chauffeurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getDriverProfile,
  getDriverProfileById,
  updateDriverProfile,
  getAllDrivers,
  updateDriverStatus,
  updateLocation,
  findNearbyDrivers,
  getDriversCount
};
