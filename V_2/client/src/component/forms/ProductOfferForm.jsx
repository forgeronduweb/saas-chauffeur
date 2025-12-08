import { useState } from 'react';
import { 
  FaCar, FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCheckCircle,
  FaCogs, FaShieldAlt, FaWrench, FaFileAlt, FaPuzzlePiece,
  FaLink, FaBarcode, FaCertificate, FaCube, FaChartLine,
  FaTools, FaUserTie, FaBullseye, FaClock, FaAward,
  FaHandshake, FaHourglass
} from 'react-icons/fa';

export default function ProductOfferForm({ onSubmit, loading, error, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    type: 'Autre', // Type pour les offres marketing/produits
    
    // Informations produit (stockées dans tags ou description)
    category: '',
    price: '',
    brand: '',
    condition: 'new',
    deliveryOptions: '', // Options de livraison
    
    location: {
      address: '',
      city: 'Abidjan'
    },
    
    contactInfo: {
      phone: '',
      email: '',
      preferredContact: 'platform'
    },
    
    // Champs optionnels
    tags: [], // Pour catégorie, marque, etc.
    requirementsList: [], // Caractéristiques du produit
    benefits: [], // Avantages
    images: [], // URLs des images
    mainImage: '' // Image principale
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFiles, setImageFiles] = useState([]); // Fichiers images temporaires
  const [newBenefit, setNewBenefit] = useState('');
  const [characteristicValues, setCharacteristicValues] = useState({}); // Valeurs des champs de caractéristiques

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (ex: location.city)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      alert('Vous ne pouvez ajouter que 5 images maximum');
      return;
    }

    // Convertir les images en base64
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            file,
            preview: URL.createObjectURL(file),
            base64: reader.result // Data URL en base64
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const newImages = await Promise.all(imagePromises);
      setImageFiles(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Erreur lors de la lecture des images:', error);
      alert('Erreur lors du chargement des images');
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extraire les images en base64
    const imagesBase64 = imageFiles.map(img => img.base64);
    
    // Convertir les champs de caractéristiques en liste (pour compatibilité)
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

    // Filtrer les lignes vides avant soumission
    const dataToSubmit = {
      ...formData,
      requirementsList: characteristicsList, // Liste formatée (pour compatibilité)
      characteristics: structuredCharacteristics, // Objet structuré (nouveau)
      benefits: formData.benefits.filter(line => line.trim()),
      images: imagesBase64, // Envoyer les images en base64
      mainImage: imagesBase64[0] || '' // Première image comme image principale
    };
    
    onSubmit(dataToSubmit);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <>
      {/* Progress Steps - Adapté mobile */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg ${
                currentStep >= step 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
                  currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 sm:mt-3 text-sm lg:text-lg text-gray-600">
          <span>Informations produit</span>
          <span>Localisation & Livraison</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm lg:text-lg text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Étape 1: Informations du produit */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
                placeholder="Ex: Pneus Michelin, Huile moteur..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="vehicules">Véhicules & Flottes</option>
                  <option value="pieces">Pièces & Accessoires</option>
                  <option value="service">Services</option>
                </select>
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Prix unitaire"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                placeholder="Décrivez votre produit en détail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Marque
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Nom de la marque"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="new">Neuf</option>
                  <option value="like_new">Comme neuf</option>
                  <option value="good">Bon état</option>
                  <option value="fair">État correct</option>
                </select>
              </div>
            </div>

            {/* Caractéristiques */}
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Caractéristiques du produit
              </label>
              
              {formData.category && characteristicFields[formData.category] && (
                <div className="mb-4">
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

            </div>

            {/* Avantages / Points forts */}
            <div>
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

            {/* Upload d'images */}
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Photos du produit (max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm lg:text-lg text-gray-600">
                    Cliquez pour ajouter des images
                  </p>
                </div>
              </label>

              {/* Prévisualisation des images */}
              {imageFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageFiles.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Image principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Étape 2: Localisation & Livraison */}
        {currentStep === 2 && (
          <>
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Ville <span className="text-red-500">*</span>
              </label>
              <select
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
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
                Options de livraison <span className="text-red-500">*</span>
              </label>
              <select
                name="deliveryOptions"
                value={formData.deliveryOptions}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionnez</option>
                <option value="pickup">Retrait sur place uniquement</option>
                <option value="delivery">Livraison disponible</option>
                <option value="both">Retrait ou livraison</option>
              </select>
            </div>
          </>
        )}

        {/* Navigation Buttons - Adapté mobile */}
        <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="hidden sm:inline">← Précédent</span>
              <span className="sm:hidden">←</span>
            </button>
          )}
          
          {currentStep < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <span className="hidden sm:inline">Suivant →</span>
              <span className="sm:hidden">→</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Publication...
                </>
              ) : (
                <>
                  Publier le produit
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
