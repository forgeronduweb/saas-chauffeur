const Report = require('../models/Report');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Driver = require('../models/Driver');
const Employer = require('../models/Employer');
const ActivityLog = require('../models/ActivityLog');
const { createNotification } = require('../services/notificationService');
const { sendNewReportEmail, sendReportResolvedEmail } = require('../services/emailService');

const REASON_LABELS = {
  spam: 'Spam ou publicité',
  inappropriate: 'Contenu inapproprié',
  fraud: 'Fraude ou arnaque',
  misleading: 'Information trompeuse',
  harassment: 'Harcèlement',
  other: 'Autre raison'
};

const TARGET_LABELS = {
  offer: 'Offre d\'emploi',
  product: 'Offre marketing',
  driver: 'Profil chauffeur',
  employer: 'Profil employeur'
};

// Créer un signalement
exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const reporterId = req.user.sub;

    // Vérifier si l'utilisateur a déjà signalé ce contenu
    const existingReport = await Report.findOne({
      targetType,
      targetId,
      reporterId
    });

    if (existingReport) {
      return res.status(400).json({
        message: 'Vous avez déjà signalé ce contenu'
      });
    }

    const report = new Report({
      targetType,
      targetId,
      reporterId,
      reason,
      description
    });

    await report.save();

    // Logger l'activité de signalement
    await ActivityLog.logActivity({
      userId: reporterId,
      activityType: 'signalement',
      description: `Signalement: ${REASON_LABELS[reason] || reason} - ${TARGET_LABELS[targetType] || targetType}`,
      details: { reportId: report._id, targetType, targetId, reason },
      relatedResource: { resourceType: 'report', resourceId: report._id }
    });

    // Récupérer les infos du reporter pour les notifications
    const reporter = await User.findById(reporterId);

    // Notifier tous les admins
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      // Créer une notification in-app
      try {
        await createNotification(admin._id, 'new_report', {
          reportId: report._id,
          reason: REASON_LABELS[reason] || reason,
          targetType: TARGET_LABELS[targetType] || targetType,
          reporterName: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Utilisateur'
        });
      } catch (notifError) {
        console.error('Erreur notification admin:', notifError);
      }

      // Envoyer un email
      try {
        await sendNewReportEmail(admin.email, report, reporter || { firstName: 'Utilisateur', lastName: '', email: 'inconnu' });
      } catch (emailError) {
        console.error('Erreur email admin:', emailError);
      }
    }

    console.log(`✅ Signalement créé et ${admins.length} admin(s) notifié(s)`);

    res.status(201).json({
      message: 'Signalement envoyé avec succès',
      report
    });
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi du signalement'
    });
  }
};

// Récupérer tous les signalements (admin)
exports.getReports = async (req, res) => {
  try {
    const { status, targetType, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const reports = await Report.find(filter)
      .populate('reporterId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des signalements'
    });
  }
};

// Mettre à jour le statut d'un signalement (admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, action, warningMessage } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        message: 'Signalement non trouvé'
      });
    }

    // Mettre à jour le signalement
    report.status = status;
    report.adminNotes = adminNotes;
    report.reviewedBy = req.user.sub;
    report.reviewedAt = new Date();
    report.actionTaken = action || 'none';
    await report.save();

    // Appliquer l'action sur le contenu signalé
    let contentOwner = null;
    let contentTitle = '';

    if (action && action !== 'none') {
      try {
        if (report.targetType === 'offer' || report.targetType === 'product') {
          const offer = await Offer.findById(report.targetId).populate('employer', 'userId');
          if (offer) {
            contentTitle = offer.title;
            if (action === 'disable') {
              offer.status = 'suspended';
              await offer.save();
              console.log(`✅ Offre ${offer._id} suspendue`);
            } else if (action === 'delete') {
              await Offer.findByIdAndDelete(report.targetId);
              console.log(`✅ Offre ${report.targetId} supprimée`);
            }
            // Récupérer le propriétaire
            if (offer.employer?.userId) {
              contentOwner = await User.findById(offer.employer.userId);
            }
          }
        } else if (report.targetType === 'driver') {
          const driver = await Driver.findById(report.targetId);
          if (driver) {
            contentTitle = `${driver.firstName} ${driver.lastName}`;
            if (action === 'disable') {
              driver.status = 'suspended';
              await driver.save();
              console.log(`✅ Chauffeur ${driver._id} suspendu`);
            } else if (action === 'warn') {
              driver.warnings = (driver.warnings || 0) + 1;
              await driver.save();
            }
            contentOwner = await User.findById(driver.userId);
          }
        } else if (report.targetType === 'employer') {
          const employer = await Employer.findById(report.targetId);
          if (employer) {
            contentTitle = employer.companyName || `${employer.firstName} ${employer.lastName}`;
            if (action === 'disable') {
              employer.status = 'suspended';
              await employer.save();
              console.log(`✅ Employeur ${employer._id} suspendu`);
            } else if (action === 'warn') {
              employer.warnings = (employer.warnings || 0) + 1;
              await employer.save();
            }
            contentOwner = await User.findById(employer.userId);
          }
        }

        // Notifier le propriétaire du contenu
        if (contentOwner) {
          const actionMessages = {
            disable: `Votre ${TARGET_LABELS[report.targetType]} a été suspendu suite à un signalement`,
            delete: `Votre ${TARGET_LABELS[report.targetType]} a été supprimé suite à un signalement`,
            warn: `Vous avez reçu un avertissement concernant votre ${TARGET_LABELS[report.targetType]}`
          };

          try {
            await createNotification(contentOwner._id, 'content_action', {
              action: action,
              targetType: TARGET_LABELS[report.targetType],
              reason: REASON_LABELS[report.reason],
              message: warningMessage || actionMessages[action]
            });
            console.log(`✅ Propriétaire ${contentOwner._id} notifié de l'action`);
          } catch (notifError) {
            console.error('Erreur notification propriétaire:', notifError);
          }
        }
      } catch (actionError) {
        console.error('Erreur lors de l\'action sur le contenu:', actionError);
      }
    }

    // Notifier l'utilisateur que son signalement a été traité
    if (report.reporterId && (status === 'resolved' || status === 'dismissed')) {
      const statusLabels = {
        resolved: 'résolu',
        dismissed: 'rejeté'
      };
      
      // Notification in-app
      try {
        await createNotification(report.reporterId, 'report_resolved', {
          reportId: report._id,
          status: statusLabels[status] || status,
          targetType: TARGET_LABELS[report.targetType] || report.targetType
        });
        console.log(`✅ Utilisateur ${report.reporterId} notifié du traitement`);
      } catch (notifError) {
        console.error('Erreur notification utilisateur:', notifError);
      }

      // Email de confirmation au signaleur
      try {
        const reporter = await User.findById(report.reporterId);
        if (reporter && reporter.email) {
          await sendReportResolvedEmail(
            reporter.email,
            `${reporter.firstName} ${reporter.lastName}`,
            report,
            status,
            action || 'none'
          );
        }
      } catch (emailError) {
        console.error('Erreur email signaleur:', emailError);
      }
    }

    res.json({
      message: 'Signalement mis à jour',
      report,
      actionApplied: action || 'none'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du signalement:', error);
    res.status(500).json({
      message: 'Erreur lors de la mise à jour'
    });
  }
};

// Compter les signalements en attente (admin dashboard)
exports.getPendingCount = async (req, res) => {
  try {
    const count = await Report.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Erreur' });
  }
};
