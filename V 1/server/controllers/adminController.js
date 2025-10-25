const User = require('../models/User');
const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const Mission = require('../models/Mission');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const ActivityLog = require('../models/ActivityLog');
const PlatformConfig = require('../models/PlatformConfig');

// Middleware pour vérifier les droits admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Dashboard principal avec KPIs
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalEmployers = await User.countDocuments({ role: 'client' });
    const totalOffers = await Offer.countDocuments();
    const totalMissions = await Mission.countDocuments();

    // Statistiques par statut
    const pendingDrivers = await Driver.countDocuments({ status: 'pending' });
    const approvedDrivers = await Driver.countDocuments({ status: 'approved' });
    const suspendedDrivers = await Driver.countDocuments({ status: 'suspended' });
    
    const activeOffers = await Offer.countDocuments({ status: 'active' });
    const completedMissions = await Mission.countDocuments({ status: 'completed' });
    const activeMissions = await Mission.countDocuments({ status: 'active' });

    // Statistiques financières
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: 'processed', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    // Évolution sur 7 jours
    const newDriversWeek = await Driver.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newOffersWeek = await Offer.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newMissionsWeek = await Mission.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Tickets de support
    const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const urgentTickets = await Ticket.countDocuments({ priority: 'urgent', status: { $ne: 'closed' } });

    // Activité récente
    const recentActivity = await ActivityLog.find({ category: 'admin' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Chauffeurs en attente de validation
    const pendingValidation = await Driver.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      overview: {
        totalUsers,
        totalDrivers,
        totalEmployers,
        totalOffers,
        totalMissions,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      },
      drivers: {
        pending: pendingDrivers,
        approved: approvedDrivers,
        suspended: suspendedDrivers,
        newThisWeek: newDriversWeek
      },
      offers: {
        active: activeOffers,
        newThisWeek: newOffersWeek
      },
      missions: {
        active: activeMissions,
        completed: completedMissions,
        newThisWeek: newMissionsWeek
      },
      support: {
        openTickets,
        urgentTickets
      },
      recentActivity,
      pendingValidation
    });

  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Gestion des chauffeurs
const getDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(query)
      .populate('userId', 'firstName lastName email phone isActive createdAt')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Driver.countDocuments(query);

    res.json({
      drivers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur récupération chauffeurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
  }
};

// Valider/Rejeter un chauffeur
const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.sub;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    const oldStatus = driver.status;
    driver.status = status;
    await driver.save();

    // Logger l'action admin
    await ActivityLog.logAdmin(
      adminId,
      `update_driver_status_${status}`,
      'driver',
      driverId,
      { oldStatus, newStatus: status, reason },
      req
    );

    // Créer une notification pour le chauffeur
    // TODO: Implémenter le système de notification

    res.json({
      message: `Chauffeur ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'rejeté' : 'suspendu'} avec succès`,
      driver
    });

  } catch (error) {
    console.error('Erreur mise à jour statut chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Gestion des offres
const getOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      flagged,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (flagged === 'true') query.isFlagged = true;

    const offers = await Offer.find(query)
      .populate('employerId', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments(query);

    res.json({
      offers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur récupération offres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' });
  }
};

// Modérer une offre
const moderateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'reject', 'flag'
    const adminId = req.user.sub;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'active', isFlagged: false };
        message = 'Offre approuvée';
        break;
      case 'reject':
        updateData = { status: 'closed', isFlagged: true };
        message = 'Offre rejetée';
        break;
      case 'flag':
        updateData = { isFlagged: true };
        message = 'Offre signalée';
        break;
      default:
        return res.status(400).json({ error: 'Action invalide' });
    }

    await Offer.findByIdAndUpdate(offerId, updateData);

    // Logger l'action admin
    await ActivityLog.logAdmin(
      adminId,
      `moderate_offer_${action}`,
      'offer',
      offerId,
      { action, reason },
      req
    );

    res.json({ message });

  } catch (error) {
    console.error('Erreur modération offre:', error);
    res.status(500).json({ error: 'Erreur lors de la modération de l\'offre' });
  }
};

// Gestion des transactions
const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('driverId', 'firstName lastName email')
      .populate('employerId', 'firstName lastName email')
      .populate('missionId', 'title type')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
};

// Gestion des tickets de support
const getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await Ticket.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
  }
};

// Assigner un ticket
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminId } = req.body;
    const currentAdminId = req.user.sub;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    await ticket.assign(adminId || currentAdminId);

    // Logger l'action
    await ActivityLog.logAdmin(
      currentAdminId,
      'assign_ticket',
      'ticket',
      ticketId,
      { assignedTo: adminId || currentAdminId },
      req
    );

    res.json({ message: 'Ticket assigné avec succès', ticket });

  } catch (error) {
    console.error('Erreur assignation ticket:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation du ticket' });
  }
};

// Configuration de la plateforme
const getConfigs = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;

    const configs = await PlatformConfig.find(query)
      .populate('updatedBy', 'firstName lastName email')
      .sort({ category: 1, key: 1 });

    res.json({ configs });

  } catch (error) {
    console.error('Erreur récupération configs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des configurations' });
  }
};

// Mettre à jour une configuration
const updateConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const { value, reason } = req.body;
    const adminId = req.user.sub;

    const config = await PlatformConfig.findById(configId);
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }

    if (!config.isEditable) {
      return res.status(403).json({ error: 'Cette configuration n\'est pas modifiable' });
    }

    await config.updateValue(value, adminId, reason);

    // Logger l'action
    await ActivityLog.logAdmin(
      adminId,
      'update_config',
      'config',
      configId,
      { key: config.key, oldValue: config.history[config.history.length - 1]?.value, newValue: value, reason },
      req
    );

    res.json({ message: 'Configuration mise à jour avec succès', config });

  } catch (error) {
    console.error('Erreur mise à jour config:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de la configuration' });
  }
};

module.exports = {
  requireAdmin,
  getDashboardStats,
  getDrivers,
  updateDriverStatus,
  getOffers,
  moderateOffer,
  getTransactions,
  getTickets,
  assignTicket,
  getConfigs,
  updateConfig
};
