const Mission = require('../models/Mission');
const User = require('../models/User');

// Récupérer les missions de l'utilisateur connecté
const getMyMissions = async (req, res) => {
  try {
    const userId = req.user.sub;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    let missions;
    
    if (user.role === 'driver') {
      // Missions du chauffeur
      missions = await Mission.find({ driverId: userId })
        .populate('employer', 'firstName lastName email phone')
        .populate('offer', 'title type')
        .sort({ createdAt: -1 })
        .lean();
    } else if (user.role === 'client') {
      // Missions de l'employeur
      missions = await Mission.find({ employerId: userId })
        .populate('driver', 'firstName lastName email phone')
        .populate('offer', 'title type')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }

    res.json(missions);

  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des missions' 
    });
  }
};

// Récupérer une mission spécifique
const getMissionById = async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = req.user.sub;

    const mission = await Mission.findById(missionId)
      .populate('driver', 'firstName lastName email phone')
      .populate('employer', 'firstName lastName email phone')
      .populate('offer', 'title type description')
      .lean();

    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Vérifier que l'utilisateur est autorisé à voir cette mission
    if (mission.driverId.toString() !== userId && mission.employerId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à voir cette mission' 
      });
    }

    res.json(mission);

  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de la mission' 
    });
  }
};

// Mettre à jour le statut d'une mission
const updateMissionStatus = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { status } = req.body;
    const userId = req.user.sub;

    if (!['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Statut invalide' 
      });
    }

    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Vérifier les autorisations
    if (mission.driverId.toString() !== userId && mission.employerId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à modifier cette mission' 
      });
    }

    mission.status = status;
    await mission.save();

    await mission.populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'employer', select: 'firstName lastName email' },
      { path: 'offer', select: 'title type' }
    ]);

    res.json({
      message: 'Statut de la mission mis à jour avec succès',
      mission
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut' 
    });
  }
};

// Marquer une mission comme terminée
const completeMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = req.user.sub;

    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Seul le chauffeur peut marquer la mission comme terminée
    if (mission.driverId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Seul le chauffeur peut marquer la mission comme terminée' 
      });
    }

    if (mission.status !== 'active') {
      return res.status(400).json({ 
        error: 'Seules les missions actives peuvent être marquées comme terminées' 
      });
    }

    await mission.complete();

    await mission.populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'employer', select: 'firstName lastName email' },
      { path: 'offer', select: 'title type' }
    ]);

    res.json({
      message: 'Mission marquée comme terminée avec succès',
      mission
    });

  } catch (error) {
    console.error('Erreur lors de la finalisation de la mission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la finalisation de la mission' 
    });
  }
};

// Annuler une mission
const cancelMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { reason } = req.body;
    const userId = req.user.sub;

    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    // Vérifier les autorisations
    if (mission.driverId.toString() !== userId && mission.employerId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Vous n\'êtes pas autorisé à annuler cette mission' 
      });
    }

    if (mission.status === 'completed' || mission.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cette mission ne peut plus être annulée' 
      });
    }

    await mission.cancel(reason);

    await mission.populate([
      { path: 'driver', select: 'firstName lastName email' },
      { path: 'employer', select: 'firstName lastName email' },
      { path: 'offer', select: 'title type' }
    ]);

    res.json({
      message: 'Mission annulée avec succès',
      mission
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la mission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de la mission' 
    });
  }
};

// Noter une mission
const rateMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.sub;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'La note doit être comprise entre 1 et 5' 
      });
    }

    const mission = await Mission.findById(missionId);
    
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    if (mission.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Seules les missions terminées peuvent être notées' 
      });
    }

    const user = await User.findById(userId);
    
    if (user.role === 'driver') {
      // Le chauffeur note l'employeur
      if (mission.driverId.toString() !== userId) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez noter que vos propres missions' 
        });
      }
      mission.rating.employerRating = rating;
      mission.rating.driverComment = comment;
    } else if (user.role === 'client') {
      // L'employeur note le chauffeur
      if (mission.employerId.toString() !== userId) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez noter que vos propres missions' 
        });
      }
      mission.rating.driverRating = rating;
      mission.rating.employerComment = comment;
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }

    await mission.save();

    res.json({
      message: 'Note ajoutée avec succès',
      mission
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'ajout de la note' 
    });
  }
};

module.exports = {
  getMyMissions,
  getMissionById,
  updateMissionStatus,
  completeMission,
  cancelMission,
  rateMission
};
