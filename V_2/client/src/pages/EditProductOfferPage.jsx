import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';

export default function EditProductOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: '',
    location: {
      city: '',
      address: ''
    },
    contactPhone: '',
    contactEmail: '',
    mainImage: '',
    additionalImages: []
  });

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
        location: {
          city: offer.location?.city || '',
          address: offer.location?.address || ''
        },
        contactPhone: offer.contactPhone || '',
        contactEmail: offer.contactEmail || '',
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
      await offersApi.update(id, formData);
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
      <SimpleHeader />

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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium"
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
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
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
                    <span className="text-xs text-gray-500 group-hover:text-orange-600 font-medium">Ajouter</span>
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
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Véhicules">Véhicules</option>
              <option value="Pièces détachées">Pièces détachées</option>
              <option value="Accessoires">Accessoires</option>
              <option value="Services">Services</option>
              <option value="Formation">Formation</option>
              <option value="Équipements">Équipements</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          {/* Prix et Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Prix (FCFA) *
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
                État *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Sélectionnez l'état</option>
                <option value="Neuf">Neuf</option>
                <option value="Très bon état">Très bon état</option>
                <option value="Bon état">Bon état</option>
                <option value="État correct">État correct</option>
                <option value="À rénover">À rénover</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm lg:text-lg text-gray-700 mb-2">
              Description *
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

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Ville *
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
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour l\'offre'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
