const PlatformContent = require('../models/PlatformContent');

// Obtenir tous les contenus (avec filtres)
exports.getAllContents = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const contents = await PlatformContent.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: contents.length,
      data: contents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contenus',
      error: error.message
    });
  }
};

// Obtenir un contenu par ID
exports.getContentById = async (req, res) => {
  try {
    const content = await PlatformContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contenu',
      error: error.message
    });
  }
};

// Créer un nouveau contenu
exports.createContent = async (req, res) => {
  try {
    let contentData = { ...req.body };

    // Upload de l'image si présente (URL directe pour l'instant)
    if (req.file) {
      // TODO: Implémenter l'upload vers un service de stockage
      contentData.imageUrl = req.body.imageUrl || '';
    }

    const content = await PlatformContent.create(contentData);

    res.status(201).json({
      success: true,
      message: 'Contenu créé avec succès',
      data: content
    });
  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du contenu',
      error: error.message
    });
  }
};

// Mettre à jour un contenu
exports.updateContent = async (req, res) => {
  try {
    let content = await PlatformContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    let updateData = { ...req.body };

    // Upload de la nouvelle image si présente
    if (req.file) {
      // TODO: Implémenter l'upload vers un service de stockage
      updateData.imageUrl = req.body.imageUrl || content.imageUrl;
    }

    content = await PlatformContent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Contenu mis à jour avec succès',
      data: content
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du contenu',
      error: error.message
    });
  }
};

// Supprimer un contenu
exports.deleteContent = async (req, res) => {
  try {
    const content = await PlatformContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    // TODO: Supprimer l'image du service de stockage si nécessaire

    await PlatformContent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contenu supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du contenu',
      error: error.message
    });
  }
};

// Réorganiser l'ordre des contenus
exports.reorderContents = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Format invalide. Un tableau d\'items est requis.'
      });
    }

    // Mettre à jour l'ordre de chaque item
    const updatePromises = items.map(item =>
      PlatformContent.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Ordre mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réorganisation',
      error: error.message
    });
  }
};

// Activer/Désactiver un contenu
exports.toggleContentStatus = async (req, res) => {
  try {
    const content = await PlatformContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    content.isActive = !content.isActive;
    await content.save();

    res.json({
      success: true,
      message: `Contenu ${content.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: content
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};
