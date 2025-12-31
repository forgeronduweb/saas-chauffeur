const Driver = require('../models/Driver');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const { sendDriverValidationEmail, sendDriverRejectionEmail } = require('../services/emailService');

// Récupérer les statistiques du dashboard admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Statistiques des chauffeurs
    const totalDrivers = await Driver.countDocuments();
    const approvedDrivers = await Driver.countDocuments({ status: 'approved' });
    const pendingDrivers = await Driver.countDocuments({ status: 'pending' });
    const rejectedDrivers = await Driver.countDocuments({ status: 'rejected' });
    
    // Nouveaux chauffeurs cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newDriversThisWeek = await Driver.countDocuments({ 
      createdAt: { $gte: oneWeekAgo } 
    });

    // Statistiques des employeurs
    const totalEmployers = await User.countDocuments({ role: 'employer' });

    // Statistiques des offres
    const totalOffers = await Offer.countDocuments();
    const activeOffers = await Offer.countDocuments({ status: 'active' });
    const expiredOffers = await Offer.countDocuments({ status: 'expired' });

    // Statistiques des candidatures
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    // Taux d'acceptation
    const acceptanceRate = totalApplications > 0 
      ? Math.round((acceptedApplications / totalApplications) * 100) 
      : 0;

    // Derniers chauffeurs inscrits (pour validation)
    const pendingValidation = await Driver.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email status createdAt');

    // Dernières offres publiées
    const recentOffers = await Offer.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('employerId', 'firstName lastName email')
      .select('title type status createdAt employerId');

    // Formater les offres récentes
    const formattedOffers = recentOffers.map(offer => ({
      _id: offer._id,
      title: offer.title,
      type: offer.type,
      status: offer.status,
      createdAt: offer.createdAt,
      employerName: offer.employerId 
        ? `${offer.employerId.firstName || ''} ${offer.employerId.lastName || ''}`.trim() 
        : 'Employeur inconnu'
    }));

    res.json({
      overview: {
        totalDrivers,
        totalEmployers,
        totalApplications,
        totalProducts: 0, // À implémenter si vous avez un modèle Product
        acceptanceRate
      },
      drivers: {
        approved: approvedDrivers,
        pending: pendingDrivers,
        rejected: rejectedDrivers,
        newThisWeek: newDriversThisWeek
      },
      offers: {
        total: totalOffers,
        active: activeOffers,
        expired: expiredOffers
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications
      },
      missions: {
        total: 0, // À implémenter si vous avez un modèle Mission
        active: 0
      },
      support: {
        pendingReports: 0 // À implémenter si vous avez un système de signalement
      },
      pendingValidation,
      recentActivity: {
        recentOffers: formattedOffers
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Récupérer tous les chauffeurs avec filtres
exports.getDrivers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Driver.countDocuments(filter);

    res.json({
      drivers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getDrivers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
  }
};

// Mettre à jour le statut d'un chauffeur
exports.updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { 
        status,
        statusReason: reason,
        statusUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    // Envoyer un email selon le nouveau statut
    if (status === 'approved') {
      // Email de validation
      await sendDriverValidationEmail(driver);
      console.log(`✅ Email de validation envoyé à ${driver.email}`);
    } else if (status === 'rejected') {
      // Email de rejet avec raison
      await sendDriverRejectionEmail(driver, reason);
      console.log(`📧 Email de rejet envoyé à ${driver.email}`);
    }

    res.json({ 
      message: 'Statut mis à jour', 
      driver,
      emailSent: status === 'approved' || status === 'rejected'
    });
  } catch (error) {
    console.error('Erreur updateDriverStatus:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Récupérer toutes les offres avec filtres
exports.getOffers = async (req, res) => {
  try {
    const { status, type, search, category, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Filtrage par catégorie
    if (category === 'job') {
      // Offres d'emploi : exclure les offres marketing
      filter.type = { $nin: ['product', 'Autre'] };
    } else if (category === 'marketing') {
      // Offres marketing : uniquement 'product' ou 'Autre'
      filter.type = { $in: ['product', 'Autre'] };
    }
    // Si category === 'all' ou non défini, pas de filtre sur le type
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const offers = await Offer.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('employerId', 'firstName lastName email');

    const total = await Offer.countDocuments(filter);

    res.json({
      offers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getOffers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' });
  }
};

// Récupérer une offre spécifique par ID
exports.getOfferById = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findById(offerId)
      .populate('employerId', 'firstName lastName email phone');

    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json(offer);
  } catch (error) {
    console.error('Erreur getOfferById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'offre' });
  }
};

// Modérer une offre
exports.moderateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject', 'flag'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide' });
    }

    const updateData = {
      moderationStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
      moderationReason: reason,
      moderatedAt: new Date(),
      moderatedBy: req.user.sub
    };

    const offer = await Offer.findByIdAndUpdate(offerId, updateData, { new: true });

    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json({ message: 'Offre modérée', offer });
  } catch (error) {
    console.error('Erreur moderateOffer:', error);
    res.status(500).json({ error: 'Erreur lors de la modération' });
  }
};

// Récupérer les transactions (à implémenter selon votre modèle)
exports.getTransactions = async (req, res) => {
  try {
    res.json({ transactions: [], message: 'Fonctionnalité à implémenter' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
};

// Récupérer les tickets de support (à implémenter)
exports.getTickets = async (req, res) => {
  try {
    res.json({ tickets: [], message: 'Fonctionnalité à implémenter' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
  }
};

// Assigner un ticket (à implémenter)
exports.assignTicket = async (req, res) => {
  try {
    res.json({ message: 'Fonctionnalité à implémenter' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'assignation du ticket' });
  }
};

// Récupérer les configurations (à implémenter)
exports.getPlatformConfigs = async (req, res) => {
  try {
    res.json({ configs: [], message: 'Fonctionnalité à implémenter' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des configurations' });
  }
};

// Mettre à jour une configuration (à implémenter)
exports.updatePlatformConfig = async (req, res) => {
  try {
    res.json({ message: 'Fonctionnalité à implémenter' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration' });
  }
};

// Récupérer tous les employeurs avec filtres
exports.getEmployers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const filter = { role: 'employer' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const User = require('../models/User');
    const employers = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      employers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getEmployers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des employeurs' });
  }
};

// Suspendre/Activer un employeur
exports.updateEmployerStatus = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { isActive } = req.body;

    const User = require('../models/User');
    const employer = await User.findByIdAndUpdate(
      employerId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({ error: 'Employeur non trouvé' });
    }

    res.json({ message: 'Statut mis à jour', employer });
  } catch (error) {
    console.error('Erreur updateEmployerStatus:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Récupérer toutes les candidatures avec filtres
exports.getApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const Application = require('../models/Application');
    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('driverId', 'firstName lastName email phone')
      .populate('offerId', 'title type location');

    // Filtrer par recherche après populate
    let filteredApplications = applications;
    if (search) {
      filteredApplications = applications.filter(app => {
        const driverName = `${app.driverId?.firstName || ''} ${app.driverId?.lastName || ''}`.toLowerCase();
        const offerTitle = app.offerId?.title?.toLowerCase() || '';
        const searchLower = search.toLowerCase();
        return driverName.includes(searchLower) || offerTitle.includes(searchLower);
      });
    }

    const total = await Application.countDocuments(filter);

    res.json({
      applications: filteredApplications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getApplications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des candidatures' });
  }
};

// Récupérer toutes les missions (placeholder - à implémenter selon votre modèle)
exports.getMissions = async (req, res) => {
  try {
    // Pour l'instant, retourner un tableau vide
    // À implémenter quand le modèle Mission sera créé
    res.json([]);
  } catch (error) {
    console.error('Erreur getMissions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des missions' });
  }
};

// Récupérer tous les véhicules (placeholder - à implémenter selon votre modèle)
exports.getVehicles = async (req, res) => {
  try {
    // Pour l'instant, retourner un tableau vide
    // À implémenter quand le modèle Vehicle sera créé
    res.json([]);
  } catch (error) {
    console.error('Erreur getVehicles:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
};

// Envoyer une notification à un chauffeur
exports.sendNotificationToDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { title, message, type = 'admin_message' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    const Driver = require('../models/Driver');
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      userId: driver.userId,
      type,
      title,
      message,
      data: {
        sentBy: 'admin',
        driverId: driver._id
      }
    });

    // Logger l'activité
    await ActivityLog.logActivity({
      userId: driver.userId,
      activityType: 'notification_sent',
      description: `Notification admin: ${title}`,
      details: { notificationId: notification._id, title, message }
    });

    res.json({ 
      message: 'Notification envoyée avec succès',
      notification 
    });
  } catch (error) {
    console.error('Erreur sendNotificationToDriver:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
};

// Récupérer les détails complets d'un chauffeur par ID
exports.getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    // Récupérer l'utilisateur associé pour les infos de connexion
    const user = await User.findById(driver.userId)
      .select('email lastLogin lastLogout currentSessionStart totalSessionDuration loginCount lastIpAddress lastUserAgent isActive suspendedAt suspendedBy suspensionReason createdAt profilePhotoUrl profilePicture');

    // Récupérer les statistiques
    const applicationsCount = await Application.countDocuments({ driverId: driver.userId });
    const acceptedApplications = await Application.countDocuments({ driverId: driver.userId, status: 'accepted' });

    // Récupérer les activités récentes
    const recentActivities = await ActivityLog.find({ userId: driver.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculer la durée de connexion actuelle si connecté
    let currentSessionDuration = null;
    if (user?.currentSessionStart && !user?.lastLogout) {
      currentSessionDuration = Math.round((new Date() - new Date(user.currentSessionStart)) / 60000);
    }

    res.json({
      driver,
      user: user ? {
        email: user.email,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        currentSessionStart: user.currentSessionStart,
        totalSessionDuration: user.totalSessionDuration,
        currentSessionDuration,
        loginCount: user.loginCount,
        lastIpAddress: user.lastIpAddress,
        lastUserAgent: user.lastUserAgent,
        isActive: user.isActive,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
        createdAt: user.createdAt,
        profilePhotoUrl: user.profilePhotoUrl || user.profilePicture
      } : null,
      statistics: {
        applicationsCount,
        acceptedApplications,
        acceptanceRate: applicationsCount > 0 ? Math.round((acceptedApplications / applicationsCount) * 100) : 0
      },
      recentActivities
    });
  } catch (error) {
    console.error('Erreur getDriverById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du chauffeur' });
  }
};

// Récupérer les détails complets d'un employeur par ID
exports.getEmployerById = async (req, res) => {
  try {
    const { employerId } = req.params;
    
    const employer = await User.findById(employerId)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires -emailVerificationCode -emailVerificationExpires');
    
    if (!employer || employer.role !== 'employer') {
      return res.status(404).json({ error: 'Employeur non trouvé' });
    }

    // Récupérer le profil employeur s'il existe
    const Employer = require('../models/Employer');
    const employerProfile = await Employer.findOne({ userId: employerId });

    // Récupérer les statistiques
    const offersCount = await Offer.countDocuments({ employerId: employerId });
    const activeOffers = await Offer.countDocuments({ employerId: employerId, status: 'active' });
    const applicationsReceived = await Application.countDocuments({ 
      offerId: { $in: await Offer.find({ employerId: employerId }).distinct('_id') }
    });

    // Récupérer les activités récentes
    const recentActivities = await ActivityLog.find({ userId: employerId })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculer la durée de connexion actuelle si connecté
    let currentSessionDuration = null;
    if (employer.currentSessionStart && !employer.lastLogout) {
      currentSessionDuration = Math.round((new Date() - new Date(employer.currentSessionStart)) / 60000);
    }

    res.json({
      employer: {
        _id: employer._id,
        email: employer.email,
        firstName: employer.firstName,
        lastName: employer.lastName,
        phone: employer.phone,
        role: employer.role,
        isActive: employer.isActive,
        lastLogin: employer.lastLogin,
        lastLogout: employer.lastLogout,
        currentSessionStart: employer.currentSessionStart,
        totalSessionDuration: employer.totalSessionDuration,
        currentSessionDuration,
        loginCount: employer.loginCount,
        lastIpAddress: employer.lastIpAddress,
        lastUserAgent: employer.lastUserAgent,
        suspendedAt: employer.suspendedAt,
        suspensionReason: employer.suspensionReason,
        createdAt: employer.createdAt,
        profilePhotoUrl: employer.profilePhotoUrl || employer.profilePicture
      },
      employerProfile,
      statistics: {
        offersCount,
        activeOffers,
        applicationsReceived
      },
      recentActivities
    });
  } catch (error) {
    console.error('Erreur getEmployerById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'employeur' });
  }
};

// Suspendre un compte (chauffeur ou employeur)
exports.suspendAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.sub;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: adminId,
        suspensionReason: reason || 'Suspendu par l\'administrateur'
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Si c'est un chauffeur, mettre à jour aussi le statut Driver
    if (user.role === 'driver') {
      await Driver.findOneAndUpdate(
        { userId: userId },
        { status: 'suspended', statusReason: reason }
      );
    }

    // Logger l'activité
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'account_suspended',
      description: `Compte suspendu par l'administrateur`,
      details: { reason, suspendedBy: adminId }
    });

    // Envoyer une notification à l'utilisateur
    await Notification.create({
      userId: userId,
      type: 'admin_message',
      title: '⚠️ Compte suspendu',
      message: reason || 'Votre compte a été suspendu par l\'administrateur. Contactez le support pour plus d\'informations.',
      data: { action: 'account_suspended' }
    });

    res.json({ message: 'Compte suspendu avec succès', user });
  } catch (error) {
    console.error('Erreur suspendAccount:', error);
    res.status(500).json({ error: 'Erreur lors de la suspension du compte' });
  }
};

// Réactiver un compte
exports.reactivateAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.sub;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: true,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Si c'est un chauffeur, réactiver aussi le statut Driver
    if (user.role === 'driver') {
      await Driver.findOneAndUpdate(
        { userId: userId },
        { status: 'approved', statusReason: 'Réactivé par l\'administrateur' }
      );
    }

    // Logger l'activité
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'account_reactivated',
      description: `Compte réactivé par l'administrateur`,
      details: { reactivatedBy: adminId }
    });

    // Envoyer une notification à l'utilisateur
    await Notification.create({
      userId: userId,
      type: 'admin_message',
      title: '✅ Compte réactivé',
      message: 'Votre compte a été réactivé. Vous pouvez à nouveau utiliser tous les services de la plateforme.',
      data: { action: 'account_reactivated' }
    });

    res.json({ message: 'Compte réactivé avec succès', user });
  } catch (error) {
    console.error('Erreur reactivateAccount:', error);
    res.status(500).json({ error: 'Erreur lors de la réactivation du compte' });
  }
};

// Envoyer un message à un utilisateur (via la messagerie interne)
exports.sendMessageToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const adminId = req.user.sub;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Trouver ou créer une conversation admin-utilisateur
    let conversation = await Conversation.findOne({
      participants: { $all: [adminId, userId] },
      'context.type': 'direct_contact'
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [adminId, userId],
        context: { type: 'direct_contact' },
        metadata: { isAdminConversation: true }
      });
    }

    // Créer le message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: adminId,
      content: message,
      type: 'text',
      metadata: { isAdminMessage: true }
    });

    // Mettre à jour la conversation
    conversation.lastMessage = {
      content: message,
      senderId: adminId,
      timestamp: new Date(),
      type: 'text'
    };
    const currentUnread = conversation.unreadCount.get(userId.toString()) || 0;
    conversation.unreadCount.set(userId.toString(), currentUnread + 1);
    await conversation.save();

    // Logger l'activité
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'message_received',
      description: 'Message reçu de l\'administrateur',
      details: { conversationId: conversation._id, messageId: newMessage._id }
    });

    // Envoyer aussi une notification
    await Notification.create({
      userId: userId,
      type: 'admin_message',
      title: '📩 Nouveau message de l\'administration',
      message: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: { 
        conversationId: conversation._id,
        action: 'open_messages'
      }
    });

    res.json({ 
      message: 'Message envoyé avec succès',
      conversationId: conversation._id,
      messageId: newMessage._id
    });
  } catch (error) {
    console.error('Erreur sendMessageToUser:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

// Envoyer une notification à un utilisateur
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type = 'admin_message' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const notification = await Notification.create({
      userId: userId,
      type,
      title,
      message,
      data: {
        sentBy: 'admin',
        adminId: req.user.sub
      }
    });

    // Logger l'activité
    await ActivityLog.logActivity({
      userId: userId,
      activityType: 'notification_sent',
      description: `Notification admin: ${title}`,
      details: { notificationId: notification._id, title, message }
    });

    res.json({ 
      message: 'Notification envoyée avec succès',
      notification 
    });
  } catch (error) {
    console.error('Erreur sendNotificationToUser:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
};

// Récupérer l'historique des activités d'un utilisateur
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, activityType } = req.query;

    const result = await ActivityLog.getUserActivities(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      activityType
    });

    res.json(result);
  } catch (error) {
    console.error('Erreur getUserActivities:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des activités' });
  }
};
