const Driver = require('../models/Driver');
const User = require('../models/User');

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
      'vehicleYear', 'vehicleSeats', 'workZone', 'specialties',
      'isAvailable', 'notifications', 'workExperience', 'profilePhotoUrl'
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

    // Notification désactivée (système de notifications supprimé)

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
      .populate('userId', 'firstName lastName email phone isActive')
      .select('-__v -createdAt -updatedAt');
    
    if (!driver) {
      console.log('Chauffeur non trouvé pour ID:', driverId);
      return res.status(404).json({ message: 'Chauffeur non trouvé' });
    }

    // Vérifier si le chauffeur est suspendu
    if (driver.status === 'suspended') {
      console.log('Chauffeur suspendu:', driverId);
      return res.status(404).json({ message: 'Ce profil n\'est plus disponible' });
    }

    // Vérifier si le compte utilisateur associé est actif
    if (driver.userId && driver.userId.isActive === false) {
      console.log('Compte utilisateur inactif:', driverId);
      return res.status(404).json({ message: 'Ce profil n\'est plus disponible' });
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

// Obtenir le nombre total de chauffeurs (actifs uniquement)
const getDriversCount = async (req, res) => {
  try {
    // Compter uniquement les chauffeurs non suspendus
    const count = await Driver.countDocuments({ 
      status: { $ne: 'suspended' } 
    });
    res.json({ count });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de chauffeurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les chauffeurs publics (pour la page d'accueil)
const getPublicDrivers = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Récupérer uniquement les chauffeurs approuvés (non suspendus)
    const drivers = await Driver.find({ 
      status: 'approved'  // Exclure pending, rejected et suspended
    })
      .populate('userId', 'isActive')
      .select('firstName lastName rating totalRides experience vehicleType vehicleBrand workZone specialties isAvailable profilePhotoUrl userId')
      .sort({ rating: -1, totalRides: -1 })
      .limit(parseInt(limit) * 2)
      .lean();

    // Filtrer les chauffeurs dont l'utilisateur associé est inactif (suspendu)
    const activeDrivers = drivers
      .filter(driver => {
        // Si pas de userId populé, garder le chauffeur (cas rare)
        if (!driver.userId) return true;
        // Sinon vérifier que l'utilisateur est actif
        return driver.userId.isActive !== false;
      })
      .slice(0, parseInt(limit));

    // Nettoyer les données (enlever userId de la réponse)
    const cleanedDrivers = activeDrivers.map(({ userId, ...rest }) => rest);

    res.json({
      success: true,
      data: cleanedDrivers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs publics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chauffeurs',
      error: error.message
    });
  }
};

// Devenir chauffeur (créer un profil chauffeur pour un utilisateur client)
const becomeDriver = async (req, res) => {
  try {
    const userId = req.user.sub;
    const {
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseType,
      experience,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleSeats,
      workZone,
      specialties
    } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur n'est pas déjà chauffeur
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({ error: 'Vous avez déjà un profil chauffeur' });
    }

    // Vérifier que le numéro de permis est fourni
    if (!licenseNumber) {
      return res.status(400).json({ error: 'Le numéro de permis est requis' });
    }

    // Créer le profil chauffeur
    const driverData = {
      userId,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      email: user.email,
      licenseNumber,
      licenseType: licenseType || 'B',
      licenseDate: new Date(),
      experience: experience || 'Débutant',
      vehicleType: vehicleType || 'berline',
      vehicleBrand: vehicleBrand || '',
      vehicleModel: vehicleModel || '',
      vehicleYear: vehicleYear ? parseInt(vehicleYear) : new Date().getFullYear(),
      vehicleSeats: vehicleSeats ? parseInt(vehicleSeats) : 5,
      workZone: workZone || '',
      specialties: specialties || ['transport_personnel'],
      status: 'approved',
      isAvailable: true
    };

    const driver = await Driver.create(driverData);

    // Mettre à jour le rôle de l'utilisateur
    user.role = 'driver';
    await user.save();

    res.status(201).json({
      message: 'Profil chauffeur créé avec succès',
      driver
    });

  } catch (error) {
    console.error('Erreur lors de la création du profil chauffeur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du profil chauffeur',
      details: error.message
    });
  }
};

module.exports = {
  getDriverProfile,
  getDriverProfileById,
  updateDriverProfile,
  getAllDrivers,
  getPublicDrivers,
  updateDriverStatus,
  updateLocation,
  findNearbyDrivers,
  getDriversCount,
  becomeDriver
};
