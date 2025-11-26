import { useState } from 'react';

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
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    // Filtrer les lignes vides avant soumission
    const dataToSubmit = {
      ...formData,
      requirementsList: formData.requirementsList.filter(line => line.trim()),
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
