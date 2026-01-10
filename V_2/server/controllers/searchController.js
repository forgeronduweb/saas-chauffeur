const Driver = require('../models/Driver');
const Offer = require('../models/Offer');
const User = require('../models/User');

// Fonction pour calculer la similarité entre deux chaînes (Levenshtein distance simplifiée)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2 || typeof str1 !== 'string' || typeof str2 !== 'string') return 0;
  
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();
  
  // Si les chaînes sont identiques
  if (str1 === str2) return 1;
  
  // Si l'une contient l'autre
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;
  
  // Distance de Levenshtein simplifiée
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

// Fonction pour normaliser le texte (enlever accents, etc.)
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9\s]/g, '') // Garder seulement lettres, chiffres et espaces
    .trim();
}

// Recherche globale intelligente
exports.globalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 1) {
      return res.json({
        drivers: [],
        offers: [],
        products: [],
        message: 'Veuillez entrer au moins 1 caractère'
      });
    }

    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    
    // Créer une regex plus permissive pour les recherches courtes
    const isShortQuery = query.trim().length <= 2;
    
    // Récupérer tous les chauffeurs approuvés (non suspendus)
    const allDrivers = await Driver.find({ 
      status: 'approved'  // Exclure pending, rejected et suspended
    })
      .populate('userId', 'firstName lastName isActive')
      .select('userId vehicleBrand vehicleModel workZone city specialties experience rating totalRides status')
      .limit(100)
      .lean();

    // Filtrer les chauffeurs dont l'utilisateur associé est inactif (suspendu)
    const activeDrivers = allDrivers.filter(driver => {
      if (!driver.userId) return true;
      return driver.userId.isActive !== false;
    });
    
    // Seuil de similarité très bas pour être ultra-permissif
    const similarityThreshold = 0.1; // Accepter presque tout
    
    const matchedDrivers = activeDrivers
      .map(driver => {
        let score = 0;
        const searchableFields = [
          driver.userId?.firstName,
          driver.userId?.lastName,
          driver.licenseNumber,
          driver.vehicleBrand,
          driver.vehicleModel,
          driver.workZone,
          driver.city,
          ...(driver.specialties || [])
        ];
        
        searchableFields.forEach(field => {
          if (field) {
            const normalizedField = normalizeText(field);
            queryWords.forEach(word => {
              // Bonus si le champ commence par le mot (recherche courte)
              if (normalizedField.startsWith(word)) {
                score += 2;
              }
              // Bonus si le mot est contenu dans le champ
              if (normalizedField.includes(word)) {
                score += 1;
              }
              // Score de similarité
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > similarityThreshold) {
                score += similarity;
              }
            });
          }
        });
        
        return { ...driver, score };
      })
      .filter(driver => driver.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Recherche des offres d'emploi (récupérer toutes les offres actives sauf produits et "Autre")
    const allOffersRaw = await Offer.find({ 
      status: 'active',
      type: { $nin: ['product', 'Autre'] } // Tout sauf les produits et offres marketing
    })
      .populate('employerId', 'firstName lastName companyName isActive')
      .select('title description type location employerId vehicleType licenseType createdAt')
      .limit(100)
      .lean();

    // Filtrer les offres dont l'employeur est suspendu
    const allOffers = allOffersRaw.filter(offer => {
      if (!offer.employerId) return true;
      return offer.employerId.isActive !== false;
    });
    
    const matchedOffers = allOffers
      .map(offer => {
        let score = 0;
        const searchableFields = [
          offer.title,
          offer.description,
          offer.type,
          offer.location,
          offer.employerId?.companyName,
          offer.vehicleType,
          offer.licenseType
        ];
        
        searchableFields.forEach(field => {
          if (field) {
            const normalizedField = normalizeText(field);
            queryWords.forEach(word => {
              // Bonus si le champ commence par le mot
              if (normalizedField.startsWith(word)) {
                score += 3;
              }
              // Bonus si le mot est contenu dans le champ
              if (normalizedField.includes(word)) {
                score += 2;
              }
              // Bonus pour chaque mot du champ qui commence par la recherche
              const fieldWords = normalizedField.split(/\s+/);
              fieldWords.forEach(fieldWord => {
                if (fieldWord.startsWith(word)) {
                  score += 2;
                }
              });
              // Score de similarité (toujours ajouter au moins un petit score)
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > similarityThreshold) {
                score += similarity;
              } else if (similarity > 0) {
                score += 0.1; // Score minimum pour toute similarité
              }
            });
          }
        });
        
        return { ...offer, score };
      })
      .map(offer => {
        if (offer.title && offer.title.toLowerCase().includes('poids')) {
          console.log(`🔍 Offre "${offer.title}" - Score: ${offer.score}`);
        }
        return offer;
      })
      .filter(offer => offer.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Recherche des offres marketing/produits (récupérer tous les produits actifs)
    const allProductsRaw = await Offer.find({ 
      status: 'active',
      type: { $in: ['product', 'Autre'] } // Produits et offres marketing
    })
      .populate('employerId', 'firstName lastName companyName isActive')
      .select('title description category location employerId price images createdAt')
      .limit(100)
      .lean();

    // Filtrer les produits dont l'employeur est suspendu
    const allProducts = allProductsRaw.filter(product => {
      if (!product.employerId) return true;
      return product.employerId.isActive !== false;
    });
    
    const matchedProducts = allProducts
      .map(product => {
        let score = 0;
        const searchableFields = [
          product.title,
          product.description,
          product.category,
          product.location,
          product.employerId?.companyName
        ];
        
        searchableFields.forEach(field => {
          if (field) {
            const normalizedField = normalizeText(field);
            queryWords.forEach(word => {
              // Bonus si le champ commence par le mot
              if (normalizedField.startsWith(word)) {
                score += 2;
              }
              // Bonus si le mot est contenu dans le champ
              if (normalizedField.includes(word)) {
                score += 1;
              }
              // Score de similarité
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > similarityThreshold) {
                score += similarity;
              }
            });
          }
        });
        
        return { ...product, score };
      })
      .filter(product => product.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log(`🔍 Recherche: "${query}"`);
    console.log(`📊 Résultats: ${matchedDrivers.length} chauffeurs, ${matchedOffers.length} offres, ${matchedProducts.length} produits`);
    
    res.json({
      query,
      results: {
        drivers: matchedDrivers,
        offers: matchedOffers,
        products: matchedProducts
      },
      totalResults: matchedDrivers.length + matchedOffers.length + matchedProducts.length
    });

  } catch (error) {
    console.error('Erreur recherche globale:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la recherche',
      error: error.message 
    });
  }
};

// Recherche rapide (suggestions)
exports.quickSearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const normalizedQuery = normalizeText(query);
    
    // Recherche rapide dans les chauffeurs (approuvés et non suspendus)
    const drivers = await Driver.find({ 
      status: 'approved'  // Exclure suspended
    })
      .populate('userId', 'firstName lastName isActive')
      .limit(10)
      .lean();

    // Filtrer les chauffeurs dont l'utilisateur associé est inactif (suspendu)
    const activeDriversQuick = drivers.filter(d => {
      if (!d.userId) return true;
      return d.userId.isActive !== false;
    }).slice(0, 5);
    
    const driverSuggestions = activeDriversQuick
      .filter(driver => {
        const fullName = normalizeText(`${driver.userId?.firstName} ${driver.userId?.lastName}`);
        const city = normalizeText(driver.city);
        const zone = normalizeText(driver.workZone);
        
        return fullName.includes(normalizedQuery) || 
               city.includes(normalizedQuery) || 
               zone.includes(normalizedQuery);
      })
      .map(driver => ({
        type: 'driver',
        id: driver._id,
        label: `${driver.userId?.firstName} ${driver.userId?.lastName}`,
        subtitle: `${driver.city} - ${driver.vehicleType}`,
        icon: 'driver'
      }));

    // Recherche rapide dans les offres
    const offers = await Offer.find({ 
      status: 'active',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(5)
      .lean();
    
    const offerSuggestions = offers.map(offer => ({
      type: offer.type === 'product' ? 'product' : 'offer',
      id: offer._id,
      label: offer.title,
      subtitle: offer.location,
      icon: offer.type === 'product' ? 'product' : 'briefcase'
    }));

    res.json({
      suggestions: [...driverSuggestions, ...offerSuggestions].slice(0, 8)
    });

  } catch (error) {
    console.error('Erreur recherche rapide:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la recherche',
      error: error.message 
    });
  }
};
