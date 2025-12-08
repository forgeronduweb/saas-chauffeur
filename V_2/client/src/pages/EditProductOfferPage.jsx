import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import {
  FaCar, FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCheckCircle,
  FaCogs, FaShieldAlt, FaWrench, FaFileAlt, FaPuzzlePiece,
  FaLink, FaBarcode, FaCertificate, FaCube, FaChartLine,
  FaTools, FaUserTie, FaBullseye, FaClock, FaAward,
  FaHandshake, FaHourglass
} from 'react-icons/fa';

export default function EditProductOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [characteristicValues, setCharacteristicValues] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: '',
    brand: '',
    deliveryOptions: '',
    location: {
      city: '',
      address: ''
    },
    requirementsList: [],
    benefits: [],
    mainImage: '',
    additionalImages: []
  });

  // Templates de champs de caractéristiques par catégorie avec icônes et options
  const characteristicFields = {
    vehicules: [
      { key: 'type', label: 'Type', icon: FaCar, options: ['Berline', 'SUV', 'Citadine', 'Break', 'Coupé', 'Cabriolet', 'Utilitaire', 'Pick-up', 'Monospace', 'Camionnette'] },
      { key: 'annee', label: 'Année', icon: FaCalendarAlt, options: Array.from({length: 30}, (_, i) => (new Date().getFullYear() - i).toString()) },
      { key: 'km', label: 'Kilométrage', icon: FaTachometerAlt, options: ['0-10 000 km', '10 000-30 000 km', '30 000-50 000 km', '50 000-100 000 km', '100 000-150 000 km', '150 000-200 000 km', '+200 000 km'] },
      { key: 'motorisation', label: 'Motorisation', icon: FaGasPump, options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Hydrogène'] },
      { key: 'etat', label: 'État', icon: FaCheckCircle, options: ['Neuf', 'Excellent', 'Très bon', 'Bon', 'Correct', 'À rénover'] },
      { key: 'options', label: 'Équipements', icon: FaCogs, options: ['Climatisation', 'Climatisation automatique', 'GPS', 'Bluetooth', 'Régulateur de vitesse', 'Caméra de recul', 'Jantes alu', 'Toit ouvrant', 'Sièges cuir', 'Sièges chauffants'] },
      { key: 'securite', label: 'Sécurité', icon: FaShieldAlt, options: ['ABS', 'ESP', 'Airbags frontaux', 'Airbags latéraux', 'Alarme', 'Anti-démarrage', 'Détecteur de pression pneus', 'Assistance freinage', 'Contrôle de trajectoire'] },
      { key: 'entretien', label: 'Entretien', icon: FaWrench, options: ['Révision récente', 'Carnet d\'entretien complet', 'Garantie constructeur', 'Extension de garantie', 'Maintenance à jour', 'Historique complet'] },
      { key: 'documents', label: 'Documents', icon: FaFileAlt, options: ['Carte grise', 'Contrôle technique à jour', 'Certificat de non-gage', 'Factures d\'entretien', 'Manuel utilisateur', 'Double de clés'] }
    ],
    pieces: [
      { key: 'type', label: 'Type de pièce', icon: FaPuzzlePiece, options: ['Pneus', 'Batterie', 'Filtre à huile', 'Filtre à air', 'Plaquettes de frein', 'Disques de frein', 'Amortisseurs', 'Bougies', 'Courroie', 'Phares', 'Pare-brise', 'Rétroviseurs'] },
      { key: 'compatibilite', label: 'Compatibilité', icon: FaLink, options: ['Toutes marques', 'Toyota', 'Nissan', 'Honda', 'Mercedes', 'BMW', 'Volkswagen', 'Peugeot', 'Renault', 'Ford', 'Hyundai', 'Kia'] },
      { key: 'etat', label: 'État', icon: FaCheckCircle, options: ['Neuf', 'Reconditionné', 'Occasion - Excellent', 'Occasion - Bon', 'Origine constructeur', 'Pièce adaptable'] },
      { key: 'reference', label: 'Référence', icon: FaBarcode, options: ['Origine constructeur', 'OEM', 'Adaptable qualité premium', 'Adaptable standard', 'Référence disponible'] },
      { key: 'garantie', label: 'Garantie', icon: FaCertificate, options: ['6 mois', '1 an', '2 ans', '3 ans', '5 ans', 'À vie', 'Garantie constructeur', 'Sans garantie'] },
      { key: 'materiau', label: 'Matériau', icon: FaCube, options: ['Acier', 'Aluminium', 'Plastique ABS', 'Caoutchouc', 'Composite', 'Fibre de carbone', 'Verre', 'Cuir'] },
      { key: 'performance', label: 'Performance', icon: FaChartLine, options: ['Haute performance', 'Performance optimale', 'Standard', 'Économique', 'Longue durée', 'Renforcé'] },
      { key: 'installation', label: 'Installation', icon: FaTools, options: ['Installation incluse', 'Installation facile', 'Installation professionnelle recommandée', 'Plug and play', 'Nécessite adaptation', 'Notice fournie'] }
    ],
    service: [
      { key: 'type', label: 'Type de service', icon: FaTools, options: ['Réparation mécanique', 'Réparation électrique', 'Carrosserie', 'Peinture', 'Maintenance', 'Diagnostic', 'Révision', 'Dépannage', 'Formation', 'Conseil'] },
      { key: 'domaine', label: 'Domaine d\'expertise', icon: FaBullseye, options: ['Mécanique générale', 'Électronique embarquée', 'Carrosserie', 'Peinture', 'Climatisation', 'Transmission', 'Freinage', 'Suspension', 'Direction', 'Électricité'] },
      { key: 'expertise', label: 'Niveau d\'expertise', icon: FaUserTie, options: ['Expert - +15 ans', 'Expérimenté - 10-15 ans', 'Confirmé - 5-10 ans', 'Qualifié - 2-5 ans', 'Certifié constructeur', 'Formation spécialisée'] },
      { key: 'disponibilite', label: 'Disponibilité', icon: FaClock, options: ['7j/7 - 24h/24', 'Tous les jours', 'Du lundi au samedi', 'Sur rendez-vous', 'Urgence 24h', 'Déplacement à domicile', 'Atelier fixe'] },
      { key: 'qualite', label: 'Qualifications', icon: FaAward, options: ['Agréé constructeur', 'Certifié ISO', 'Label qualité', 'Garantie décennale', 'Assurance professionnelle', 'Centre agréé', 'Expert indépendant'] },
      { key: 'garantie', label: 'Garantie des travaux', icon: FaHandshake, options: ['Garantie 2 ans', 'Garantie 1 an', 'Garantie 6 mois', 'Garantie 3 mois', 'Garantie pièces et main d\'œuvre', 'Extension garantie possible'] },
      { key: 'delais', label: 'Délais d\'intervention', icon: FaHourglass, options: ['Intervention immédiate', 'Sous 24h', 'Sous 48h', 'Sur rendez-vous', 'Délai selon diagnostic', 'Selon disponibilité pièces'] },
      { key: 'documents', label: 'Documents fournis', icon: FaFileAlt, options: ['Devis gratuit', 'Facture détaillée', 'Bon de garantie', 'Certificat de conformité', 'Rapport d\'intervention', 'Suivi entretien'] }
    ]
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOffer();
  }, [id, user, navigate]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await offersApi.getById(id);
      const offer = response.data;
      
      console.log('📦 Données reçues de l\'API:', offer);
      console.log('📋 Champs disponibles:', {
        category: offer.category,
        price: offer.price,
        condition: offer.condition,
        brand: offer.brand,
        deliveryOptions: offer.deliveryOptions,
        requirementsList: offer.requirementsList,
        benefits: offer.benefits
      });
      
      // Vérifier que c'est bien une offre marketing de l'utilisateur
      if (offer.type !== 'Autre') {
        setError('Cette offre n\'est pas une offre marketing');
        return;
      }
      
      if (offer.employerId._id !== user.id && offer.employerId !== user.id) {
        setError('Vous n\'êtes pas autorisé à modifier cette offre');
        return;
      }
      
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        category: offer.category || '',
        price: offer.price || '',
        condition: offer.condition || '',
        brand: offer.brand || '',
        deliveryOptions: offer.deliveryOptions || '',
        location: {
          city: offer.location?.city || '',
          address: offer.location?.address || ''
        },
        requirementsList: offer.requirementsList || [],
        benefits: offer.benefits || [],
        mainImage: offer.mainImage || '',
        additionalImages: offer.additionalImages || []
      });
      
      // Initialiser les images (mainImage + additionalImages)
      const allImages = [];
      if (offer.mainImage) {
        allImages.push(offer.mainImage);
      }
      if (offer.additionalImages && offer.additionalImages.length > 0) {
        allImages.push(...offer.additionalImages);
      }
      
      console.log('📸 Images chargées:', {
        mainImage: offer.mainImage ? 'Oui' : 'Non',
        additionalImages: offer.additionalImages?.length || 0,
        total: allImages.length
      });
      
      setImages(allImages);

      // Pré-remplir les champs de caractéristiques dynamiques si possible
      if (offer.category && characteristicFields[offer.category] && offer.requirementsList) {
        const dynamicValues = {};
        offer.requirementsList.forEach(item => {
          // Essayer de parser "Label: Value"
          const colonIndex = item.indexOf(':');
          if (colonIndex > 0) {
            const label = item.substring(0, colonIndex).trim();
            const value = item.substring(colonIndex + 1).trim();
            
            // Trouver le champ correspondant
            const field = characteristicFields[offer.category].find(f => f.label === label);
            if (field) {
              dynamicValues[field.key] = value;
            }
          }
        });
        setCharacteristicValues(dynamicValues);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'offre:', error);
      setError('Impossible de charger l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Si changement de catégorie, réinitialiser les champs de caractéristiques
    if (name === 'category' && value !== formData.category) {
      resetCharacteristicFields();
    }
  };

  // Fonction pour gérer les changements des champs de caractéristiques
  const handleCharacteristicChange = (key, value) => {
    setCharacteristicValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Réinitialiser les champs de caractéristiques quand la catégorie change
  const resetCharacteristicFields = () => {
    setCharacteristicValues({});
  };

  const addCharacteristic = () => {
    if (newCharacteristic.trim()) {
      setFormData(prev => ({
        ...prev,
        requirementsList: [...prev.requirementsList, newCharacteristic.trim()]
      }));
      setNewCharacteristic('');
    }
  };

  const removeCharacteristic = (index) => {
    setFormData(prev => ({
      ...prev,
      requirementsList: prev.requirementsList.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Vérifier le nombre total d'images (max 5)
    if (images.length + files.length > 5) {
      alert('Vous ne pouvez ajouter que 5 images maximum');
      return;
    }

    files.forEach(file => {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`L'image ${file.name} ne doit pas dépasser 5MB`);
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });

    // Réinitialiser l'input
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Mettre à jour formData quand images change
  useEffect(() => {
    if (images.length > 0) {
      setFormData(prev => ({
        ...prev,
        mainImage: images[0],
        additionalImages: images.slice(1)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mainImage: '',
        additionalImages: []
      }));
    }
  }, [images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log('💰 Prix avant conversion:', formData.price, 'Type:', typeof formData.price);
      const convertedPrice = formData.price ? Number(formData.price) : 0;
      console.log('💰 Prix après conversion:', convertedPrice, 'Type:', typeof convertedPrice);
      
      // Convertir les caractéristiques dynamiques en format "Label: Value" (pour compatibilité)
      const characteristicsList = Object.entries(characteristicValues)
        .filter(([key, value]) => value && value.trim())
        .map(([key, value]) => {
          const field = characteristicFields[formData.category]?.find(f => f.key === key);
          return `${field?.label}: ${value.trim()}`;
        });

      // Préparer les caractéristiques structurées (objet clé-valeur)
      const structuredCharacteristics = Object.entries(characteristicValues)
        .filter(([key, value]) => value && value.trim())
        .reduce((acc, [key, value]) => {
          acc[key] = value.trim();
          return acc;
        }, {});

      // Préparer les données avec tous les champs nécessaires
      const dataToSubmit = {
        title: formData.title,
        description: formData.description || '',
        type: 'Autre',
        category: formData.category || '',
        price: convertedPrice,
        brand: formData.brand || '',
        condition: formData.condition || '',
        deliveryOptions: formData.deliveryOptions || '',
        location: {
          city: formData.location?.city || '',
          address: formData.location?.address || ''
        },
        requirementsList: characteristicsList.length > 0 ? characteristicsList : formData.requirementsList.filter(item => item.trim() !== ''),
        characteristics: structuredCharacteristics, // Objet structuré (nouveau)
        benefits: formData.benefits.filter(item => item.trim() !== ''),
        mainImage: formData.mainImage || '',
        additionalImages: formData.additionalImages || [],
        images: [formData.mainImage, ...(formData.additionalImages || [])].filter(Boolean)
      };

      console.log('📤 Données envoyées:', dataToSubmit);
      console.log('📤 Prix dans dataToSubmit:', dataToSubmit.price);

      await offersApi.update(id, dataToSubmit);
      alert('Offre mise à jour avec succès !');
      navigate('/employer/my-products');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'offre');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/employer/my-products')}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Retour à mes offres
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Modifier l'offre marketing</h1>
          <p className="text-gray-600 mt-2">Mettez à jour les informations de votre produit ou service</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Titre */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Titre de l'offre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ex: Toyota Corolla 2020 en excellent état"
            />
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-3">
              Images de l'offre ({images.length}/5)
            </label>
            
            {images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-4">Aucune image pour cette offre</p>
                <input
                  type="file"
                  id="firstImage"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="firstImage" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter des images
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Images existantes */}
                {images.map((image, index) => (
                <div 
                  key={index} 
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-500 transition-all"
                >
                  <img 
                    src={image} 
                    alt={`Image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  {/* Badge image principale */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Principale
                    </div>
                  )}
                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Bouton ajouter des images */}
              {images.length < 5 && (
                <div className="aspect-square">
                  <input
                    type="file"
                    id="addImages"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="addImages" 
                    className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group"
                  >
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 group-hover:text-orange-600">Ajouter</span>
                  </label>
                </div>
              )}
              </div>
            )}
            
            {images.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                La première image sera l'image principale. PNG, JPG jusqu'à 5MB par image. Maximum 5 images.
              </p>
            )}
          </div>

          {/* Catégorie */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="vehicules">Véhicules & Flottes</option>
              <option value="pieces">Pièces & Accessoires</option>
              <option value="service">Services</option>
            </select>
          </div>

          {/* Prix et Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Prix (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: 5000000"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                État <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Sélectionnez l'état</option>
                <option value="new">Neuf</option>
                <option value="like_new">Comme neuf</option>
                <option value="good">Bon état</option>
                <option value="fair">État correct</option>
              </select>
            </div>
          </div>

          {/* Marque */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Marque
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ex: Toyota, Michelin..."
            />
          </div>

          {/* Options de livraison */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Options de livraison
            </label>
            <select
              name="deliveryOptions"
              value={formData.deliveryOptions}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Sélectionnez</option>
              <option value="pickup">Retrait sur place uniquement</option>
              <option value="delivery">Livraison disponible</option>
              <option value="both">Retrait ou livraison</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Décrivez votre produit ou service en détail..."
            />
          </div>

          {/* Caractéristiques dynamiques */}
          {formData.category && characteristicFields[formData.category] && (
            <div className="mb-6">
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Caractéristiques
              </label>
              <p className="text-xs lg:text-sm text-gray-500 mb-3">
                Remplissez les champs correspondant à votre {formData.category === 'vehicules' ? 'véhicule' : formData.category === 'pieces' ? 'pièce' : 'service'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characteristicFields[formData.category].map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={field.key}>
                      <label className="block text-sm text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <IconComponent className="w-4 h-4 text-gray-400" />
                        </div>
                        <select
                          value={characteristicValues[field.key] || ''}
                          onChange={(e) => handleCharacteristicChange(field.key, e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm appearance-none bg-white cursor-pointer"
                        >
                          <option value="">Sélectionner...</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Caractéristiques manuelles (fallback pour les anciennes offres) */}
          {(!formData.category || !characteristicFields[formData.category]) && (
            <div className="mb-6">
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Caractéristiques du produit
              </label>
              <p className="text-xs lg:text-sm text-gray-500 mb-2">
                Ajoutez les caractéristiques techniques et spécifications de votre produit
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCharacteristic}
                  onChange={(e) => setNewCharacteristic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCharacteristic())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Ex: Garantie 2 ans, Compatible tous véhicules"
                />
                <button
                  type="button"
                  onClick={addCharacteristic}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.requirementsList.length > 0 && (
                <ul className="space-y-2">
                  {formData.requirementsList.map((characteristic, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-700 flex-1">{characteristic}</span>
                      <button
                        type="button"
                        onClick={() => removeCharacteristic(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Avantages */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Avantages / Points forts
            </label>
            <p className="text-xs lg:text-sm text-gray-500 mb-2">
              Mettez en avant les points forts et avantages de votre produit
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Ex: Livraison rapide, Prix compétitif"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {formData.benefits.length > 0 && (
              <ul className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700 flex-1">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Ville <span className="text-red-500">*</span>
              </label>
              <select
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Sélectionnez une ville</option>
                <option value="Abidjan">Abidjan</option>
                <option value="Yamoussoukro">Yamoussoukro</option>
                <option value="Bouaké">Bouaké</option>
                <option value="Daloa">Daloa</option>
                <option value="San Pedro">San Pedro</option>
                <option value="Man">Man</option>
                <option value="Gagnoa">Gagnoa</option>
                <option value="Korhogo">Korhogo</option>
                <option value="Divo">Divo</option>
                <option value="Abengourou">Abengourou</option>
                <option value="Bondoukou">Bondoukou</option>
                <option value="Séguéla">Séguéla</option>
                <option value="Soubré">Soubré</option>
                <option value="Ferkessédougou">Ferkessédougou</option>
                <option value="Odienné">Odienné</option>
                <option value="Touba">Touba</option>
                <option value="Dabou">Dabou</option>
                <option value="Tiassalé">Tiassalé</option>
                <option value="Grand-Bassam">Grand-Bassam</option>
                <option value="Guiglo">Guiglo</option>
                <option value="Danané">Danané</option>
                <option value="Biankouma">Biankouma</option>
                <option value="M'Batto">M'Batto</option>
                <option value="Bocanda">Bocanda</option>
                <option value="Katiola">Katiola</option>
                <option value="Bouaflé">Bouaflé</option>
                <option value="Sakassou">Sakassou</option>
                <option value="Daoukro">Daoukro</option>
                <option value="Tanda">Tanda</option>
                <option value="Tabou">Tabou</option>
              </select>
            </div>
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Cocody, Riviera"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employer/my-products')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour l\'offre'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
