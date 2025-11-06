const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const User = require('../models/User');

// Statistiques générales publiques
exports.getPublicStats = async (req, res) => {
  try {
    // Compter les chauffeurs actifs
    const totalDrivers = await Driver.countDocuments({ isActive: true });
    
    // Compter les offres actives
    const totalOffers = await Offer.countDocuments({ status: 'active' });
    
    // Compter les employeurs actifs
    const totalEmployers = await User.countDocuments({ 
      role: 'employer', 
      isActive: true 
    });
    
    // Calculer la note moyenne des chauffeurs
    const driversWithRatings = await Driver.find({ 
      isActive: true,
      rating: { $exists: true, $gt: 0 }
    });
    
    const averageRating = driversWithRatings.length > 0
      ? driversWithRatings.reduce((sum, driver) => sum + driver.rating, 0) / driversWithRatings.length
      : 0;
    
    // Compter les chauffeurs disponibles immédiatement
    const availableDrivers = await Driver.countDocuments({ 
      isActive: true,
      isAvailable: true 
    });
    
    // Statistiques par zone (top 5)
    const driversByZone = await Driver.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$workZone', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Statistiques par type de véhicule
    const driversByVehicle = await Driver.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques par niveau d'expérience
    const driversByExperience = await Driver.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$experience', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Offres par type
    const offersByType = await Offer.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalDrivers,
          totalOffers,
          totalEmployers,
          availableDrivers,
          averageRating: parseFloat(averageRating.toFixed(1))
        },
        drivers: {
          byZone: driversByZone,
          byVehicle: driversByVehicle,
          byExperience: driversByExperience
        },
        offers: {
          byType: offersByType
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques publiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Statistiques pour le dashboard employeur
exports.getEmployerStats = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Compter les offres de l'employeur
    const totalOffers = await Offer.countDocuments({ 
      employerId: userId 
    });
    
    const activeOffers = await Offer.countDocuments({ 
      employerId: userId,
      status: 'active'
    });
    
    // Compter les candidatures reçues
    const Application = require('../models/Application');
    const totalApplications = await Application.countDocuments({
      employerId: userId
    });
    
    const pendingApplications = await Application.countDocuments({
      employerId: userId,
      status: 'pending'
    });
    
    const acceptedApplications = await Application.countDocuments({
      employerId: userId,
      status: 'accepted'
    });
    
    res.json({
      success: true,
      data: {
        totalOffers,
        activeOffers,
        totalApplications,
        pendingApplications,
        acceptedApplications
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques employeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Statistiques pour le dashboard chauffeur
exports.getDriverStats = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Récupérer le profil du chauffeur
    const driver = await Driver.findOne({ userId });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Profil chauffeur non trouvé'
      });
    }
    
    // Compter les candidatures du chauffeur
    const Application = require('../models/Application');
    const totalApplications = await Application.countDocuments({
      driverId: driver._id
    });
    
    const pendingApplications = await Application.countDocuments({
      driverId: driver._id,
      status: 'pending'
    });
    
    const acceptedApplications = await Application.countDocuments({
      driverId: driver._id,
      status: 'accepted'
    });
    
    const rejectedApplications = await Application.countDocuments({
      driverId: driver._id,
      status: 'rejected'
    });
    
    // Compter les offres disponibles dans sa zone
    const availableOffers = await Offer.countDocuments({
      status: 'active',
      $or: [
        { workZone: driver.workZone },
        { workZone: { $exists: false } }
      ]
    });
    
    res.json({
      success: true,
      data: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        availableOffers,
        rating: driver.rating || 0,
        totalRides: driver.totalRides || 0,
        profileComplete: driver.profilePhotoUrl ? true : false
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};
