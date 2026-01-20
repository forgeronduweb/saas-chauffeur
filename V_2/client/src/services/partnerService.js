import api from './api';

const partnerService = {
  // Récupérer les partenaires (existant)
  getPartners: async (params = {}) => {
    const response = await api.get('/employer/partners', { params });
    return response.data;
  },

  // Récupérer les détails enrichis d'un partenaire
  getPartnerDetails: async (partnerId) => {
    const response = await api.get(`/employer/${partnerId}/details`);
    return response.data;
  },

  // Récupérer les statistiques globales des partenaires
  getPartnersStats: async (params = {}) => {
    const response = await api.get('/employer/partners/stats', { params });
    return response.data;
  },

  // Formatter les données pour l'affichage
  formatPartnerData: (partner) => {
    return {
      id: partner._id,
      name: partner.companyName,
      logo: partner.companyLogo,
      sector: partner.sector,
      city: partner.city,
      description: partner.description,
      website: partner.website,
      employeeCount: partner.employeeCount,
      foundedYear: partner.foundedYear,
      // Informations enrichies
      stats: partner.stats || {
        totalJobOffers: 0,
        activeJobOffers: 0,
        totalProductOffers: 0,
        activeProductOffers: 0,
        totalHires: 0
      },
      reputation: partner.reputation || {
        totalHires: 0,
        memberSince: partner.createdAt,
        isActive: partner.isActive,
        status: partner.status
      },
      contact: partner.contact || {
        email: partner.email,
        companyEmail: partner.companyEmail,
        phone: partner.companyPhone,
        website: partner.website,
        address: partner.address,
        city: partner.city
      },
      professional: partner.professional || {
        sector: partner.sector,
        employeeCount: partner.employeeCount,
        foundedYear: partner.foundedYear,
        companyType: partner.companyType,
        siret: partner.siret
      },
      recentActivity: partner.recentActivity || {
        jobOffers: [],
        productOffers: []
      }
    };
  },

  // Formatter les statistiques pour l'affichage
  formatStatsData: (stats) => {
    return {
      overview: {
        totalPartners: stats.overview?.totalPartners || 0,
        activePartners: stats.overview?.activePartners || 0,
        inactivePartners: stats.overview?.inactivePartners || 0
      },
      distribution: {
        sectors: stats.distribution?.sectors || [],
        cities: stats.distribution?.cities || [],
        sizes: stats.distribution?.sizes || []
      },
      offers: {
        jobOffers: stats.offers?.jobOffers || [],
        productOffers: stats.offers?.productOffers || []
      },
      topPartners: stats.topPartners || []
    };
  },

  // Calculer le score de réputation d'un partenaire
  calculateReputationScore: (partner) => {
    const stats = partner.stats || {};
    const reputation = partner.reputation || {};
    
    let score = 0;
    
    // Score basé sur le nombre d'embauches (max 40 points)
    score += Math.min(stats.totalHires || 0, 40);
    
    // Score basé sur le nombre d'offres actives (max 20 points)
    score += Math.min((stats.activeJobOffers || 0) + (stats.activeProductOffers || 0), 20);
    
    // Score basé sur l'ancienneté (max 20 points)
    const memberSince = new Date(reputation.memberSince || partner.createdAt);
    const yearsActive = Math.floor((new Date() - memberSince) / (365.25 * 24 * 60 * 60 * 1000));
    score += Math.min(yearsActive * 2, 20);
    
    // Score basé sur la complétude du profil (max 20 points)
    let completenessScore = 0;
    if (partner.companyName) completenessScore += 5;
    if (partner.description) completenessScore += 5;
    if (partner.companyLogo) completenessScore += 5;
    if (partner.website) completenessScore += 5;
    score += completenessScore;
    
    return Math.min(score, 100);
  },

  // Obtenir le niveau de réputation
  getReputationLevel: (score) => {
    if (score >= 80) return { level: 'Expert', color: 'green', icon: '🏆' };
    if (score >= 60) return { level: 'Avancé', color: 'blue', icon: '⭐' };
    if (score >= 40) return { level: 'Confirmé', color: 'orange', icon: '📈' };
    if (score >= 20) return { level: 'Débutant', color: 'yellow', icon: '🌱' };
    return { level: 'Nouveau', color: 'gray', icon: '🆕' };
  },

  // Formatter les offres récentes pour l'affichage
  formatRecentOffers: (recentActivity) => {
    const formatted = {
      jobOffers: (recentActivity.jobOffers || []).map(offer => ({
        id: offer._id,
        title: offer.title,
        type: 'job',
        location: offer.location,
        contractType: offer.contractType,
        workType: offer.workType,
        salary: offer.salary,
        createdAt: offer.createdAt
      })),
      productOffers: (recentActivity.productOffers || []).map(offer => ({
        id: offer._id,
        title: offer.title,
        type: 'product',
        price: offer.price,
        location: offer.location,
        category: offer.category,
        image: offer.images?.[0],
        createdAt: offer.createdAt
      }))
    };

    // Combiner et trier par date
    const allOffers = [...formatted.jobOffers, ...formatted.productOffers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      ...formatted,
      recent: allOffers
    };
  },

  // Enrichir un partenaire depuis le web
  enrichPartnerFromWeb: async (partnerId) => {
    const response = await api.post(`/employer/${partnerId}/enrich`);
    return response.data;
  },

  // Enrichir tous les partenaires en lot
  enrichAllPartners: async (options = {}) => {
    const response = await api.post('/employer/enrich-all', null, { params: options });
    return response.data;
  },

  // Formatter les données d'enrichissement web
  formatWebEnrichment: (webData) => {
    return {
      description: webData.description || '',
      website: webData.website || '',
      logo: webData.logo || '',
      reviews: webData.reviews || {
        rating: 0,
        count: 0,
        source: ''
      },
      socialMedia: webData.socialMedia || {
        linkedin: '',
        twitter: '',
        facebook: ''
      },
      news: (webData.news || []).slice(0, 3).map(article => ({
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        source: article.source
      })),
      additionalInfo: webData.additionalInfo || {
        foundedYear: null,
        employeeCount: null,
        industry: '',
        headquarters: '',
        phone: '',
        email: ''
      },
      lastUpdated: webData.lastUpdated || new Date(),
      source: webData.source || 'webScraping'
    };
  },

  // Vérifier si un partenaire peut être enrichi
  canBeEnriched: (partner) => {
    return (
      partner.employerType === 'entreprise' &&
      partner.companyName &&
      (!partner.webEnrichment || 
       new Date() - new Date(partner.webEnrichment.lastUpdated) > 7 * 24 * 60 * 60 * 1000) // 7 jours
    );
  },

  // Obtenir le statut d'enrichissement
  getEnrichmentStatus: (partner) => {
    if (!partner.webEnrichment) {
      return {
        status: 'none',
        label: 'Non enrichi',
        color: 'gray',
        icon: '🔍'
      };
    }

    const lastUpdated = new Date(partner.webEnrichment.lastUpdated);
    const daysSinceUpdate = Math.floor((new Date() - lastUpdated) / (24 * 60 * 60 * 1000));

    if (daysSinceUpdate <= 1) {
      return {
        status: 'fresh',
        label: 'Mis à jour récemment',
        color: 'green',
        icon: '✅'
      };
    } else if (daysSinceUpdate <= 7) {
      return {
        status: 'recent',
        label: 'Mis à jour cette semaine',
        color: 'blue',
        icon: '🔄'
      };
    } else {
      return {
        status: 'stale',
        label: 'À mettre à jour',
        color: 'orange',
        icon: '⚠️'
      };
    }
  },

  // Calculer le score de complétude du profil
  calculateCompletenessScore: (partner) => {
    let score = 0;
    const maxScore = 10;

    // Champs de base (5 points)
    if (partner.companyName) score += 1;
    if (partner.description) score += 1;
    if (partner.sector) score += 1;
    if (partner.city) score += 1;
    if (partner.employeeCount) score += 1;

    // Contact (2 points)
    if (partner.companyPhone) score += 1;
    if (partner.companyEmail) score += 1;

    // Présence en ligne (2 points)
    if (partner.website) score += 1;
    if (partner.companyLogo) score += 1;

    // Informations supplémentaires (1 point)
    if (partner.foundedYear) score += 1;

    return {
      score: Math.round((score / maxScore) * 100),
      level: score >= 8 ? 'Excellent' : score >= 6 ? 'Bon' : score >= 4 ? 'Moyen' : 'À améliorer',
      color: score >= 8 ? 'green' : score >= 6 ? 'blue' : score >= 4 ? 'orange' : 'red'
    };
  }
};

export default partnerService;
