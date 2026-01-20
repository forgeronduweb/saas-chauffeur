const axios = require('axios');
const cheerio = require('cheerio');

class WebScrapingService {
  constructor() {
    this.sources = {
      // APIs publiques pour les informations d'entreprise
      companyInfo: {
        // Sera configuré avec des clés API
        googlePlaces: 'https://maps.googleapis.com/maps/api/place',
        // Alternative gratuite pour les informations d'entreprise
        companyData: 'https://api.company-information.service.gov.uk',
        // Pour les logos d'entreprise
        logoApi: 'https://logo.clearbit.com'
      },
      // Sources pour les actualités et presse
      news: {
        googleNews: 'https://news.google.com/rss',
        // API pour les mentions d'entreprise
        brandMentions: 'https://api.brandmonitor.com'
      },
      // Sources pour les réseaux sociaux
      social: {
        linkedin: 'https://api.linkedin.com/v2',
        twitter: 'https://api.twitter.com/2'
      }
    };
  }

  // Récupérer les informations d'entreprise depuis le web
  async getCompanyInfo(companyName, location = '') {
    try {
      const results = {
        companyName: companyName,
        description: '',
        website: '',
        logo: '',
        socialMedia: {
          linkedin: '',
          twitter: '',
          facebook: ''
        },
        news: [],
        reviews: {
          rating: 0,
          count: 0,
          source: ''
        },
        additionalInfo: {
          foundedYear: null,
          employeeCount: null,
          industry: '',
          headquarters: '',
          phone: '',
          email: ''
        }
      };

      // 1. Recherche Google Places pour les informations de base
      const placesInfo = await this.searchGooglePlaces(companyName, location);
      if (placesInfo) {
        results.description = placesInfo.description || results.description;
        results.website = placesInfo.website || results.website;
        results.additionalInfo.phone = placesInfo.phone || results.additionalInfo.phone;
        results.reviews.rating = placesInfo.rating || 0;
        results.reviews.count = placesInfo.reviews || 0;
        results.reviews.source = 'Google Places';
      }

      // 2. Récupérer le logo depuis Clearbit
      if (results.website) {
        const logo = await this.getCompanyLogo(results.website);
        if (logo) {
          results.logo = logo;
        }
      }

      // 3. Recherche des réseaux sociaux
      const socialInfo = await this.findSocialMedia(companyName, results.website);
      results.socialMedia = { ...results.socialMedia, ...socialInfo };

      // 4. Recherche d'actualités récentes
      const newsInfo = await this.getCompanyNews(companyName);
      results.news = newsInfo;

      // 5. Tentative de récupération d'informations supplémentaires
      const additionalInfo = await this.getAdditionalCompanyInfo(companyName, results.website);
      results.additionalInfo = { ...results.additionalInfo, ...additionalInfo };

      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations d\'entreprise:', error);
      return null;
    }
  }

  // Recherche Google Places
  async searchGooglePlaces(companyName, location) {
    try {
      // Note: Nécessite une clé API Google Places
      // Pour l'instant, simulation avec des données de test
      const query = `${companyName} ${location}`.trim();
      
      // Simulation - en production, utiliser l'API réelle
      if (process.env.GOOGLE_PLACES_API_KEY) {
        const response = await axios.get(
          `${this.sources.companyInfo.googlePlaces}/textsearch/json`,
          {
            params: {
              query: query,
              key: process.env.GOOGLE_PLACES_API_KEY,
              language: 'fr'
            }
          }
        );

        if (response.data.results && response.data.results.length > 0) {
          const place = response.data.results[0];
          return {
            description: place.description || '',
            website: place.website || '',
            phone: place.formatted_phone_number || '',
            rating: place.rating || 0,
            reviews: place.user_ratings_total || 0
          };
        }
      }

      // Simulation pour le développement
      return this.simulateGooglePlacesResult(companyName, location);
    } catch (error) {
      console.error('Erreur Google Places:', error);
      return null;
    }
  }

  // Simulation des résultats Google Places pour le développement
  simulateGooglePlacesResult(companyName, location) {
    const simulations = {
      'Transport Express CI': {
        description: 'Entreprise de transport et logistique basée en Côte d\'Ivoire',
        website: 'https://transportexpress.ci',
        phone: '+225 27 20 30 40 50',
        rating: 4.5,
        reviews: 128
      },
      'GoDriver CI': {
        description: 'Plateforme de mise en relation entre chauffeurs et employeurs',
        website: 'https://godriver.ci',
        phone: '+225 27 21 22 23 24',
        rating: 4.8,
        reviews: 256
      }
    };

    return simulations[companyName] || {
      description: `Entreprise spécialisée dans le secteur ${location || 'divers'}`,
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.ci`,
      phone: '+225 27 00 00 00 00',
      rating: 4.0,
      reviews: 50
    };
  }

  // Récupérer le logo de l'entreprise
  async getCompanyLogo(website) {
    try {
      // Utiliser l'API Clearbit pour les logos
      const domain = this.extractDomain(website);
      const logoUrl = `${this.sources.companyInfo.logoApi}/${domain}.png`;
      
      // Vérifier si le logo existe
      const response = await axios.head(logoUrl);
      if (response.status === 200) {
        return logoUrl;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du logo:', error);
    }
    return null;
  }

  // Extraire le domaine d'une URL
  extractDomain(url) {
    try {
      const domain = new URL(url);
      return domain.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  }

  // Trouver les réseaux sociaux de l'entreprise
  async findSocialMedia(companyName, website) {
    const socialMedia = {
      linkedin: '',
      twitter: '',
      facebook: ''
    };

    try {
      // Recherche LinkedIn
      const linkedinSearch = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(companyName)}`;
      socialMedia.linkedin = linkedinSearch;

      // Recherche Twitter
      const twitterSearch = `https://twitter.com/search?q=${encodeURIComponent(companyName)}`;
      socialMedia.twitter = twitterSearch;

      // Recherche Facebook
      const facebookSearch = `https://www.facebook.com/search/top/?q=${encodeURIComponent(companyName)}`;
      socialMedia.facebook = facebookSearch;
    } catch (error) {
      console.error('Erreur lors de la recherche des réseaux sociaux:', error);
    }

    return socialMedia;
  }

  // Récupérer les actualités récentes
  async getCompanyNews(companyName) {
    try {
      // Utiliser Google News RSS
      const newsUrl = `${this.sources.news.googleNews}/search?q=${encodeURIComponent(companyName)}&hl=fr&gl=CI&ceid=CI:fr`;
      
      const response = await axios.get(newsUrl);
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      const news = [];
      $('item').each((index, element) => {
        if (index < 5) { // Limiter à 5 actualités
          const $item = $(element);
          news.push({
            title: $item.find('title').text(),
            link: $item.find('link').text(),
            pubDate: $item.find('pubDate').text(),
            source: $item.find('source').text()
          });
        }
      });

      return news;
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      return [];
    }
  }

  // Récupérer des informations supplémentaires
  async getAdditionalCompanyInfo(companyName, website) {
    try {
      const info = {
        foundedYear: null,
        employeeCount: null,
        industry: '',
        headquarters: '',
        phone: '',
        email: ''
      };

      // Scraper le site web de l'entreprise
      if (website) {
        const websiteInfo = await this.scrapeWebsite(website);
        info.email = websiteInfo.email || info.email;
        info.phone = websiteInfo.phone || info.phone;
        info.industry = websiteInfo.industry || info.industry;
      }

      return info;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations supplémentaires:', error);
      return {};
    }
  }

  // Scraper le site web de l'entreprise
  async scrapeWebsite(website) {
    try {
      const response = await axios.get(website, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      const info = {
        email: '',
        phone: '',
        industry: ''
      };

      // Rechercher l'email
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const pageText = $('body').text();
      const emails = pageText.match(emailRegex);
      if (emails && emails.length > 0) {
        info.email = emails[0];
      }

      // Rechercher le téléphone
      const phoneRegex = /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const phones = pageText.match(phoneRegex);
      if (phones && phones.length > 0) {
        info.phone = phones[0];
      }

      // Rechercher l'industrie dans les meta tags
      const industry = $('meta[name="industry"]').attr('content') || 
                      $('meta[property="og:industry"]').attr('content') ||
                      $('meta[name="category"]').attr('content');
      if (industry) {
        info.industry = industry;
      }

      return info;
    } catch (error) {
      console.error('Erreur lors du scraping du site web:', error);
      return {};
    }
  }

  // Valider et nettoyer les données récupérées
  validateAndCleanData(data) {
    const cleaned = {
      companyName: data.companyName || '',
      description: this.cleanText(data.description) || '',
      website: this.validateUrl(data.website) || '',
      logo: this.validateUrl(data.logo) || '',
      socialMedia: {
        linkedin: this.validateUrl(data.socialMedia?.linkedin) || '',
        twitter: this.validateUrl(data.socialMedia?.twitter) || '',
        facebook: this.validateUrl(data.socialMedia?.facebook) || ''
      },
      news: (data.news || []).slice(0, 5), // Limiter à 5 actualités
      reviews: {
        rating: Math.min(5, Math.max(0, parseFloat(data.reviews?.rating) || 0)),
        count: Math.max(0, parseInt(data.reviews?.count) || 0),
        source: data.reviews?.source || ''
      },
      additionalInfo: {
        foundedYear: this.validateYear(data.additionalInfo?.foundedYear),
        employeeCount: this.validateEmployeeCount(data.additionalInfo?.employeeCount),
        industry: this.cleanText(data.additionalInfo?.industry) || '',
        headquarters: this.cleanText(data.additionalInfo?.headquarters) || '',
        phone: this.cleanText(data.additionalInfo?.phone) || '',
        email: this.validateEmail(data.additionalInfo?.email) || ''
      }
    };

    return cleaned;
  }

  // Fonctions utilitaires de validation
  cleanText(text) {
    if (!text) return '';
    return text.toString().trim().replace(/\s+/g, ' ');
  }

  validateUrl(url) {
    if (!url) return '';
    try {
      new URL(url);
      return url;
    } catch {
      return '';
    }
  }

  validateEmail(email) {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
  }

  validateYear(year) {
    if (!year) return null;
    const num = parseInt(year);
    const currentYear = new Date().getFullYear();
    return (num >= 1800 && num <= currentYear) ? num : null;
  }

  validateEmployeeCount(count) {
    if (!count) return null;
    const num = parseInt(count);
    return (num > 0 && num <= 1000000) ? num : null;
  }
}

module.exports = new WebScrapingService();
