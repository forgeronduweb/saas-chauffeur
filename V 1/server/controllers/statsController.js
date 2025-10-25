const Offer = require('../models/Offer');
const Application = require('../models/Application');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Statistiques pour les employeurs
const getEmployerStats = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un employeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Seuls les employeurs peuvent voir ces statistiques' 
      });
    }

    // Statistiques des offres
    const totalOffers = await Offer.countDocuments({ employerId: userId });
    const activeOffers = await Offer.countDocuments({ 
      employerId: userId, 
      status: 'active' 
    });
    const completedOffers = await Offer.countDocuments({ 
      employerId: userId, 
      status: 'completed' 
    });

    // Statistiques des candidatures reçues
    const offersIds = await Offer.find({ employerId: userId }).distinct('_id');
    const totalApplications = await Application.countDocuments({ 
      offerId: { $in: offersIds } 
    });
    const pendingApplications = await Application.countDocuments({ 
      offerId: { $in: offersIds },
      status: 'pending'
    });
    const acceptedApplications = await Application.countDocuments({ 
      offerId: { $in: offersIds },
      status: 'accepted'
    });

    // Statistiques par type d'offre
    const offersByType = await Offer.aggregate([
      { $match: { employerId: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Évolution des candidatures sur les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const applicationsOverTime = await Application.aggregate([
      { 
        $match: { 
          offerId: { $in: offersIds },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      offers: {
        total: totalOffers,
        active: activeOffers,
        completed: completedOffers,
        byType: offersByType
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        overTime: applicationsOverTime
      },
      summary: {
        responseRate: totalApplications > 0 ? 
          Math.round((acceptedApplications / totalApplications) * 100) : 0,
        avgApplicationsPerOffer: totalOffers > 0 ? 
          Math.round(totalApplications / totalOffers) : 0
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques employeur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques' 
    });
  }
};

// Statistiques pour les chauffeurs
const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Vérifier que l'utilisateur est un chauffeur
    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(403).json({ 
        error: 'Seuls les chauffeurs peuvent voir ces statistiques' 
      });
    }

    // Statistiques des candidatures
    const totalApplications = await Application.countDocuments({ driverId: userId });
    const pendingApplications = await Application.countDocuments({ 
      driverId: userId, 
      status: 'pending' 
    });
    const acceptedApplications = await Application.countDocuments({ 
      driverId: userId, 
      status: 'accepted' 
    });
    const rejectedApplications = await Application.countDocuments({ 
      driverId: userId, 
      status: 'rejected' 
    });

    // Statistiques par type d'offre postulée
    const applicationsByType = await Application.aggregate([
      { $match: { driverId: userId } },
      { 
        $lookup: {
          from: 'offers',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offer'
        }
      },
      { $unwind: '$offer' },
      { $group: { _id: '$offer.type', count: { $sum: 1 } } }
    ]);

    // Évolution des candidatures sur les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const applicationsOverTime = await Application.aggregate([
      { 
        $match: { 
          driverId: userId,
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Profil chauffeur
    const driverProfile = await Driver.findOne({ userId });

    const stats = {
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        byType: applicationsByType,
        overTime: applicationsOverTime
      },
      profile: {
        status: driverProfile?.status || 'pending',
        experience: driverProfile?.experience,
        rating: driverProfile?.rating || 0,
        completedMissions: driverProfile?.completedMissions || 0
      },
      summary: {
        successRate: totalApplications > 0 ? 
          Math.round((acceptedApplications / totalApplications) * 100) : 0,
        activeApplications: pendingApplications
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques chauffeur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques' 
    });
  }
};

// Statistiques générales (admin)
const getGeneralStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalEmployers = await User.countDocuments({ role: 'client' });
    const totalOffers = await Offer.countDocuments();
    const activeOffers = await Offer.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    const stats = {
      users: {
        total: totalUsers,
        drivers: totalDrivers,
        employers: totalEmployers
      },
      offers: {
        total: totalOffers,
        active: activeOffers
      },
      applications: {
        total: totalApplications
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques générales:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques' 
    });
  }
};

module.exports = {
  getEmployerStats,
  getDriverStats,
  getGeneralStats
};
