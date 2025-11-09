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
    
    if (!query || query.trim().length < 2) {
      return res.json({
        drivers: [],
        offers: [],
        products: [],
        message: 'Veuillez entrer au moins 2 caractères'
      });
    }

    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    
    // Recherche des chauffeurs avec regex pour pré-filtrer (optimisé)
    const searchRegex = new RegExp(queryWords.join('|'), 'i');
    const allDrivers = await Driver.find({ 
      isActive: true,
      $or: [
        { vehicleBrand: searchRegex },
        { vehicleModel: searchRegex },
        { workZone: searchRegex },
        { city: searchRegex },
        { specialties: { $in: queryWords.map(w => new RegExp(w, 'i')) } }
      ]
    })
      .populate('userId', 'firstName lastName')
      .select('userId vehicleBrand vehicleModel workZone city specialties experience rating totalRides')
      .limit(30) // Réduit de 50 à 30 pour plus de rapidité
      .lean();
    
    const matchedDrivers = allDrivers
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
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > 0.6) {
                score += similarity;
              }
              // Bonus si le mot est contenu dans le champ
              if (normalizedField.includes(word)) {
                score += 0.5;
              }
            });
          }
        });
        
        return { ...driver, score };
      })
      .filter(driver => driver.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Recherche des offres d'emploi avec pré-filtrage (optimisé)
    const allOffers = await Offer.find({ 
      status: 'active',
      type: { $ne: 'product' },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
        { location: searchRegex },
        { vehicleType: searchRegex }
      ]
    })
      .populate('employer', 'firstName lastName companyName')
      .select('title description type location employer vehicleType licenseType createdAt')
      .limit(30) // Réduit pour plus de rapidité
      .lean();
    
    const matchedOffers = allOffers
      .map(offer => {
        let score = 0;
        const searchableFields = [
          offer.title,
          offer.description,
          offer.type,
          offer.location,
          offer.employer?.companyName,
          offer.vehicleType,
          offer.licenseType
        ];
        
        searchableFields.forEach(field => {
          if (field) {
            const normalizedField = normalizeText(field);
            queryWords.forEach(word => {
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > 0.6) {
                score += similarity;
              }
              if (normalizedField.includes(word)) {
                score += 0.5;
              }
            });
          }
        });
        
        return { ...offer, score };
      })
      .filter(offer => offer.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Recherche des offres marketing/produits avec pré-filtrage (optimisé)
    const allProducts = await Offer.find({ 
      status: 'active',
      type: 'product',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { location: searchRegex }
      ]
    })
      .populate('employer', 'firstName lastName companyName')
      .select('title description category location employer price createdAt')
      .limit(30) // Réduit pour plus de rapidité
      .lean();
    
    const matchedProducts = allProducts
      .map(product => {
        let score = 0;
        const searchableFields = [
          product.title,
          product.description,
          product.category,
          product.location,
          product.employer?.companyName
        ];
        
        searchableFields.forEach(field => {
          if (field) {
            const normalizedField = normalizeText(field);
            queryWords.forEach(word => {
              const similarity = calculateSimilarity(word, normalizedField);
              if (similarity > 0.6) {
                score += similarity;
              }
              if (normalizedField.includes(word)) {
                score += 0.5;
              }
            });
          }
        });
        
        return { ...product, score };
      })
      .filter(product => product.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

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
    
    // Recherche rapide dans les chauffeurs
    const drivers = await Driver.find({ isActive: true })
      .populate('userId', 'firstName lastName')
      .limit(5)
      .lean();
    
    const driverSuggestions = drivers
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
