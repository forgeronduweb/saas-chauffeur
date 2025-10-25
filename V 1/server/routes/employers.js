const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { requireAuth } = require('../middleware/auth');

// GET /api/employers - Récupérer la liste des employeurs pour les chauffeurs
router.get('/', requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un chauffeur
    if (!req.user || req.user.role !== 'driver') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès réservé aux chauffeurs' 
      });
    }

    // Récupérer tous les employeurs actifs (utilisateurs avec companyName)
    const employers = await User.find({ 
      role: 'client',
      companyName: { $exists: true, $ne: null },
      isActive: true 
    }).select('firstName lastName companyName email phone createdAt');

    // Pour chaque employeur, compter ses offres actives
    const employersWithStats = await Promise.all(
      employers.map(async (employer) => {
        // Compter les offres actives de cet employeur
        const activeOffers = await Offer.countDocuments({
          employerId: employer._id,
          status: 'active'
        });

        // Récupérer quelques infos supplémentaires
        const totalOffers = await Offer.countDocuments({
          employerId: employer._id
        });

        return {
          _id: employer._id,
          companyName: employer.companyName || `${employer.firstName || 'Entreprise'} ${employer.lastName || 'Transport'}`,
          firstName: employer.firstName || '',
          lastName: employer.lastName || '',
          email: employer.email || '',
          phone: employer.phone || '',
          // Générer des données simulées pour le secteur et la description
          sector: generateSectorFromCompany(employer.companyName || 'Transport'),
          location: generateLocationFromUser(employer),
          description: generateDescriptionFromCompany(employer.companyName || 'Entreprise de transport'),
          activeOffers: activeOffers || 0,
          totalOffers: totalOffers || 0,
          totalEmployees: Math.floor(Math.random() * 200) + 10, // Simulation
          website: generateWebsiteFromCompany(employer.companyName || employer.firstName),
          contactEmail: employer.email || '',
          logo: null,
          isActive: true,
          createdAt: employer.createdAt || new Date()
        };
      })
    );

    // Trier par nombre d'offres actives (décroissant) puis par nom
    employersWithStats.sort((a, b) => {
      if (b.activeOffers !== a.activeOffers) {
        return b.activeOffers - a.activeOffers;
      }
      return a.companyName.localeCompare(b.companyName);
    });

    res.json({
      success: true,
      data: employersWithStats,
      count: employersWithStats.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des employeurs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des employeurs' 
    });
  }
});

// Fonctions utilitaires pour générer des données simulées
function generateSectorFromCompany(companyName) {
  const sectors = {
    'transport': 'Transport et Logistique',
    'livraison': 'Livraison Express',
    'taxi': 'Transport de Personnes',
    'vtc': 'VTC et Chauffeur Privé',
    'logistique': 'Logistique et Distribution',
    'express': 'Livraison Express',
    'cargo': 'Transport de Marchandises',
    'bus': 'Transport en Commun'
  };

  const companyLower = companyName.toLowerCase();
  for (const [key, value] of Object.entries(sectors)) {
    if (companyLower.includes(key)) {
      return value;
    }
  }
  return 'Transport et Logistique';
}

function generateLocationFromUser(user) {
  const cities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 
    'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims'
  ];
  return cities[Math.floor(Math.random() * cities.length)];
}

function generateDescriptionFromCompany(companyName) {
  const descriptions = {
    'transport': 'Entreprise spécialisée dans le transport et la logistique avec une flotte moderne et des services de qualité.',
    'livraison': 'Service de livraison rapide et fiable pour particuliers et professionnels dans toute la région.',
    'taxi': 'Compagnie de taxi professionnelle offrant des services de transport de qualité 24h/24.',
    'vtc': 'Service VTC haut de gamme avec chauffeurs expérimentés et véhicules premium.',
    'logistique': 'Solutions logistiques complètes pour optimiser vos flux de marchandises.',
    'express': 'Livraison express et urgente avec garantie de délais respectés.',
    'cargo': 'Transport de marchandises et fret avec solutions sur mesure.',
    'bus': 'Transport en commun moderne et écologique pour la mobilité urbaine.'
  };

  const companyLower = companyName.toLowerCase();
  for (const [key, value] of Object.entries(descriptions)) {
    if (companyLower.includes(key)) {
      return value;
    }
  }
  return 'Entreprise de transport professionnelle recherchant des chauffeurs qualifiés pour rejoindre notre équipe dynamique.';
}

function generateWebsiteFromCompany(companyName) {
  if (!companyName) return null;
  
  const cleanName = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `www.${cleanName}.fr`;
}

module.exports = router;
