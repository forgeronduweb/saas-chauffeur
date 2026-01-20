const Employer = require('../models/Employer');
const User = require('../models/User');

// Créer ou mettre à jour le profil employeur
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const {
      employerType,
      companyName,
      companyType,
      siret,
      sector,
      employeeCount,
      foundedYear,
      city,
      address,
      companyPhone,
      companyEmail,
      website,
      description,
      contactPerson,
      contactPosition
    } = req.body;

    // Vérifier si l'utilisateur existe et est un employeur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.role !== 'employer') {
      return res.status(403).json({ error: 'Accès réservé aux employeurs' });
    }

    // Chercher ou créer le profil employeur
    let employer = await Employer.findOne({ userId });

    if (employer) {
      // Mise à jour du profil existant
      employer.employerType = employerType || employer.employerType;
      employer.companyName = companyName || employer.companyName;
      employer.companyType = companyType || employer.companyType;
      employer.siret = siret || employer.siret;
      employer.sector = sector || employer.sector;
      employer.employeeCount = employeeCount || employer.employeeCount;
      employer.foundedYear = foundedYear || employer.foundedYear;
      employer.city = city || employer.city;
      employer.address = address || employer.address;
      employer.companyPhone = companyPhone || employer.companyPhone;
      employer.companyEmail = companyEmail || employer.companyEmail;
      employer.website = website || employer.website;
      employer.description = description || employer.description;
      employer.contactPerson = contactPerson || employer.contactPerson;
      employer.contactPosition = contactPosition || employer.contactPosition;

      await employer.save();

      return res.status(200).json({
        message: 'Profil employeur mis à jour avec succès',
        employer
      });
    } else {
      // Création d'un nouveau profil employeur
      employer = new Employer({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        employerType: employerType || 'particulier',
        companyName,
        companyType,
        siret,
        sector,
        employeeCount,
        foundedYear,
        city: city || 'Abidjan',
        address,
        companyPhone,
        companyEmail,
        website,
        description,
        contactPerson,
        contactPosition
      });

      await employer.save();

      return res.status(201).json({
        message: 'Profil employeur créé avec succès',
        employer
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil employeur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création/mise à jour du profil',
      details: error.message 
    });
  }
};

// Récupérer le profil employeur
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.sub;

    const employer = await Employer.findOne({ userId }).populate('userId', 'email firstName lastName phone');

    if (!employer) {
      return res.status(404).json({ error: 'Profil employeur non trouvé' });
    }

    res.status(200).json({ employer });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil employeur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du profil',
      details: error.message 
    });
  }
};

// Supprimer le profil employeur
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.sub;

    const employer = await Employer.findOneAndDelete({ userId });

    if (!employer) {
      return res.status(404).json({ error: 'Profil employeur non trouvé' });
    }

    res.status(200).json({ message: 'Profil employeur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du profil employeur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression du profil',
      details: error.message 
    });
  }
};

// Upload de documents (logo, registre de commerce, etc.)
exports.uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { companyLogo, companyRegistration, idCard } = req.body;

    const employer = await Employer.findOne({ userId });

    if (!employer) {
      return res.status(404).json({ error: 'Profil employeur non trouvé' });
    }

    if (companyLogo) employer.companyLogo = companyLogo;
    if (companyRegistration) employer.companyRegistration = companyRegistration;
    if (idCard) employer.idCard = idCard;

    await employer.save();

    res.status(200).json({
      message: 'Documents mis à jour avec succès',
      employer
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload des documents:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'upload des documents',
      details: error.message 
    });
  }
};

// Récupérer un employeur par ID (public)
exports.getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id)
      .populate('userId', 'email firstName lastName phone profilePhotoUrl createdAt');

    if (!employer) {
      return res.status(404).json({ error: 'Employeur non trouvé' });
    }

    res.status(200).json({ employer });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employeur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'employeur',
      details: error.message 
    });
  }
};

// Récupérer les entreprises partenaires (employeurs de type entreprise)
exports.getPartners = async (req, res) => {
  try {
    const { page = 1, limit = 12, sector, city } = req.query;
    
    // Filtrer uniquement les employeurs de type entreprise
    const filter = {
      employerType: 'entreprise'
    };
    
    // Filtres optionnels
    if (sector) filter.sector = sector;
    if (city) filter.city = { $regex: city, $options: 'i' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const partners = await Employer.find(filter)
      .populate('userId', 'profilePhotoUrl')
      .select('companyName companyLogo sector city description website employeeCount foundedYear firstName lastName email userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Employer.countDocuments(filter);
    
    res.status(200).json({
      partners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des partenaires',
      details: error.message 
    });
  }
};
