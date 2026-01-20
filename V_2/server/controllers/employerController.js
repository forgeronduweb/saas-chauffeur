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

// Récupérer les détails enrichis d'un partenaire
exports.getPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le partenaire avec ses informations de base
    const partner = await Employer.findOne({ 
      _id: id, 
      employerType: 'entreprise' 
    })
    .populate('userId', 'profilePhotoUrl firstName lastName email')
    .lean();
    
    if (!partner) {
      return res.status(404).json({ 
        error: 'Partenaire non trouvé' 
      });
    }

    // Importer les modèles nécessaires
    const JobOffer = require('../models/JobOffer');
    const ProductOffer = require('../models/ProductOffer');
    
    // Récupérer les offres d'emploi actives du partenaire
    const activeJobOffers = await JobOffer.find({ 
      employerId: id,
      status: 'active'
    })
    .select('title location contractType workType salary createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Récupérer les offres marketing/produits actives du partenaire
    const activeProductOffers = await ProductOffer.find({ 
      employerId: id,
      status: 'active'
    })
    .select('title price location category images createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Calculer les statistiques
    const stats = {
      totalJobOffers: await JobOffer.countDocuments({ employerId: id }),
      activeJobOffers: activeJobOffers.length,
      totalProductOffers: await ProductOffer.countDocuments({ employerId: id }),
      activeProductOffers: activeProductOffers.length,
      totalHires: partner.totalHires || 0,
      memberSince: partner.createdAt,
      lastActivity: Math.max(
        ...(activeJobOffers.map(o => o.createdAt)),
        ...(activeProductOffers.map(o => o.createdAt)),
        partner.updatedAt
      )
    };

    // Enrichir les informations avec des données calculées
    const enrichedPartner = {
      ...partner,
      stats,
      recentActivity: {
        jobOffers: activeJobOffers,
        productOffers: activeProductOffers
      },
      // Ajouter des informations supplémentaires
      reputation: {
        totalHires: partner.totalHires || 0,
        memberSince: partner.createdAt,
        isActive: partner.isActive,
        status: partner.status
      },
      // Informations de contact enrichies
      contact: {
        email: partner.email,
        companyEmail: partner.companyEmail,
        phone: partner.companyPhone,
        website: partner.website,
        address: partner.address,
        city: partner.city
      },
      // Informations professionnelles
      professional: {
        sector: partner.sector,
        employeeCount: partner.employeeCount,
        foundedYear: partner.foundedYear,
        companyType: partner.companyType,
        siret: partner.siret
      }
    };

    res.status(200).json({
      partner: enrichedPartner,
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails du partenaire:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des détails du partenaire',
      details: error.message 
    });
  }
};

// Récupérer les statistiques globales des partenaires
exports.getPartnersStats = async (req, res) => {
  try {
    const { sector, city } = req.query;
    
    // Filtre de base pour les entreprises
    const baseFilter = { employerType: 'entreprise' };
    if (sector) baseFilter.sector = sector;
    if (city) baseFilter.city = { $regex: city, $options: 'i' };
    
    // Importer les modèles nécessaires
    const JobOffer = require('../models/JobOffer');
    const ProductOffer = require('../models/ProductOffer');
    
    // Statistiques générales
    const totalPartners = await Employer.countDocuments(baseFilter);
    const activePartners = await Employer.countDocuments({ 
      ...baseFilter, 
      isActive: true 
    });
    
    // Répartition par secteur
    const sectorStats = await Employer.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Répartition par ville
    const cityStats = await Employer.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Répartition par taille d'entreprise
    const sizeStats = await Employer.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$employeeCount', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistiques des offres
    const partnerIds = await Employer.find(baseFilter).distinct('_id');
    
    const jobOffersStats = await JobOffer.aggregate([
      { $match: { employerId: { $in: partnerIds } } },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    const productOffersStats = await ProductOffer.aggregate([
      { $match: { employerId: { $in: partnerIds } } },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    // Partenaires les plus actifs
    const topPartners = await Employer.find(baseFilter)
      .sort({ totalHires: -1, totalOffers: -1 })
      .limit(10)
      .select('companyName companyLogo totalHires totalOffers city sector')
      .lean();

    res.status(200).json({
      stats: {
        overview: {
          totalPartners,
          activePartners,
          inactivePartners: totalPartners - activePartners
        },
        distribution: {
          sectors: sectorStats,
          cities: cityStats,
          sizes: sizeStats
        },
        offers: {
          jobOffers: jobOffersStats,
          productOffers: productOffersStats
        },
        topPartners
      },
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des partenaires:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des statistiques',
      details: error.message 
    });
  }
};

// Enrichir un partenaire avec des données du web
exports.enrichPartnerFromWeb = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le partenaire
    const partner = await Employer.findOne({ 
      _id: id, 
      employerType: 'entreprise' 
    });
    
    if (!partner) {
      return res.status(404).json({ 
        error: 'Partenaire non trouvé' 
      });
    }

    // Importer le service de web scraping
    const webScrapingService = require('../services/webScrapingService');
    
    // Récupérer les informations depuis le web
    const webInfo = await webScrapingService.getCompanyInfo(
      partner.companyName,
      partner.city
    );
    
    if (!webInfo) {
      return res.status(404).json({ 
        error: 'Aucune information trouvée sur le web' 
      });
    }

    // Valider et nettoyer les données
    const cleanedData = webScrapingService.validateAndCleanData(webInfo);

    // Mettre à jour le partenaire avec les nouvelles informations
    const updates = {};
    
    // Mettre à jour uniquement les champs vides ou moins complets
    if (!partner.description && cleanedData.description) {
      updates.description = cleanedData.description;
    }
    
    if (!partner.website && cleanedData.website) {
      updates.website = cleanedData.website;
    }
    
    if (!partner.companyLogo && cleanedData.logo) {
      updates.companyLogo = cleanedData.logo;
    }
    
    if (!partner.companyPhone && cleanedData.additionalInfo.phone) {
      updates.companyPhone = cleanedData.additionalInfo.phone;
    }
    
    if (!partner.companyEmail && cleanedData.additionalInfo.email) {
      updates.companyEmail = cleanedData.additionalInfo.email;
    }
    
    if (!partner.foundedYear && cleanedData.additionalInfo.foundedYear) {
      updates.foundedYear = cleanedData.additionalInfo.foundedYear;
    }
    
    if (!partner.sector && cleanedData.additionalInfo.industry) {
      updates.sector = cleanedData.additionalInfo.industry.toLowerCase();
    }

    // Ajouter les informations enrichies dans un champ spécial
    updates.webEnrichment = {
      lastUpdated: new Date(),
      source: 'webScraping',
      data: cleanedData,
      reviews: cleanedData.reviews,
      socialMedia: cleanedData.socialMedia,
      news: cleanedData.news
    };

    // Appliquer les mises à jour
    if (Object.keys(updates).length > 0) {
      await Employer.findByIdAndUpdate(id, updates);
    }

    res.status(200).json({
      message: 'Partenaire enrichi avec succès',
      updates: Object.keys(updates),
      webData: cleanedData,
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de l\'enrichissement du partenaire:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'enrichissement du partenaire',
      details: error.message 
    });
  }
};

// Enrichir tous les partenaires en lot
exports.enrichAllPartners = async (req, res) => {
  try {
    const { limit = 10, force = false } = req.query;
    
    // Récupérer les partenaires à enrichir
    let filter = { employerType: 'entreprise' };
    
    // Si force est false, n'enrichir que ceux sans webEnrichment
    if (!force) {
      filter.webEnrichment = { $exists: false };
    }
    
    const partners = await Employer.find(filter)
      .limit(parseInt(limit))
      .select('companyName city')
      .lean();

    if (partners.length === 0) {
      return res.status(200).json({
        message: 'Aucun partenaire à enrichir',
        enriched: [],
        success: true
      });
    }

    // Importer le service de web scraping
    const webScrapingService = require('../services/webScrapingService');
    
    const results = [];
    
    // Traiter chaque partenaire
    for (const partner of partners) {
      try {
        console.log(`Enrichissement de: ${partner.companyName}`);
        
        // Récupérer les informations depuis le web
        const webInfo = await webScrapingService.getCompanyInfo(
          partner.companyName,
          partner.city
        );
        
        if (webInfo) {
          const cleanedData = webScrapingService.validateAndCleanData(webInfo);
          
          // Préparer les mises à jour
          const updates = {
            webEnrichment: {
              lastUpdated: new Date(),
              source: 'webScraping',
              data: cleanedData,
              reviews: cleanedData.reviews,
              socialMedia: cleanedData.socialMedia,
              news: cleanedData.news
            }
          };
          
          // Mettre à jour le partenaire
          await Employer.findByIdAndUpdate(partner._id, updates);
          
          results.push({
            partnerId: partner._id,
            companyName: partner.companyName,
            status: 'success',
            dataFound: true
          });
        } else {
          results.push({
            partnerId: partner._id,
            companyName: partner.companyName,
            status: 'success',
            dataFound: false
          });
        }
        
        // Attendre un peu pour éviter de surcharger les APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Erreur pour ${partner.companyName}:`, error);
        results.push({
          partnerId: partner._id,
          companyName: partner.companyName,
          status: 'error',
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `${results.length} partenaires traités`,
      results,
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de l\'enrichissement en lot:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'enrichissement en lot',
      details: error.message 
    });
  }
};
