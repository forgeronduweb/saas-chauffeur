import { useState, useEffect } from 'react';
import { offersApi } from '../../services/api';
import Modal from '../common/Modal';
import CustomSelect from '../common/CustomSelect';

// Style pour masquer la barre de défilement
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function EditOffer({ offer, showEditForm, setShowEditForm, onOfferUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    requirements: {
      licenseType: 'B',
      experience: '1-3 ans',
      vehicleType: '',
      zone: ''
    },
    conditions: {
      salary: '',
      salaryType: 'horaire',
      workType: 'temps_plein',
      startDate: '',
      endDate: '',
      schedule: ''
    },
    location: {
      address: '',
      city: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      preferredContact: 'platform'
    },
    isUrgent: false,
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Charger les données de l'offre quand le composant se monte
  useEffect(() => {
    if (offer && showEditForm) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        type: offer.type || '',
        requirements: {
          licenseType: offer.requirements?.licenseType || 'B',
          experience: offer.requirements?.experience || '1-3 ans',
          vehicleType: offer.requirements?.vehicleType || '',
          zone: offer.requirements?.zone || ''
        },
        conditions: {
          salary: offer.conditions?.salary || '',
          salaryType: offer.conditions?.salaryType || 'horaire',
          workType: offer.conditions?.workType || 'temps_plein',
          startDate: offer.conditions?.startDate ? new Date(offer.conditions.startDate).toISOString().split('T')[0] : '',
          endDate: offer.conditions?.endDate ? new Date(offer.conditions.endDate).toISOString().split('T')[0] : '',
          schedule: offer.conditions?.schedule || ''
        },
        location: {
          address: offer.location?.address || '',
          city: offer.location?.city || ''
        },
        contactInfo: {
          phone: offer.contactInfo?.phone || '',
          email: offer.contactInfo?.email || '',
          preferredContact: offer.contactInfo?.preferredContact || 'platform'
        },
        isUrgent: offer.isUrgent || false,
        tags: offer.tags || []
      });
    }
  }, [offer, showEditForm]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Helper pour CustomSelect (qui passe directement la valeur)
  const handleSelectChange = (name) => (value) => {
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Le titre est obligatoire';
    if (!formData.description.trim()) newErrors.description = 'La description est obligatoire';
    if (!formData.type) newErrors.type = 'Le type de mission est obligatoire';
    if (!formData.requirements.zone.trim()) newErrors.zone = 'La zone géographique est obligatoire';
    if (!formData.location.city.trim()) newErrors.city = 'La ville est obligatoire';
    if (!formData.conditions.startDate) newErrors.startDate = 'La date de début est obligatoire';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Nettoyer les données avant envoi
      const cleanedData = { ...formData };
      
      if (!cleanedData.conditions.salary) {
        delete cleanedData.conditions.salary;
      }
      if (!cleanedData.requirements.vehicleType) {
        delete cleanedData.requirements.vehicleType;
      }
      
      console.log('Données de modification envoyées:', cleanedData);
      const response = await offersApi.update(offer._id, cleanedData);
      const result = response.data;
      
      setShowEditForm(false);
      if (onOfferUpdated) {
        onOfferUpdated(result.offer);
      }
      
      alert('Offre modifiée avec succès !');
      
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse du serveur:', error.response?.data);
      
      let errorMessage = 'Erreur lors de la modification de l\'offre';
      
      if (error.response?.data?.details) {
        errorMessage += ':\n' + error.response.data.details.join('\n');
      } else if (error.response?.data?.error) {
        errorMessage += ': ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!showEditForm || !offer) return null;

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <Modal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Modifier l'offre"
        size="lg"
      >
        <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Titre de l'offre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Chauffeur personnel pour Abidjan"
                className={`w-full p-2 lg:p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Type et Durée */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Type de mission *</label>
                <CustomSelect
                  value={formData.type}
                  onChange={handleSelectChange('type')}
                  placeholder="Sélectionner un type"
                  options={[
                    { value: '', label: 'Sélectionner un type' },
                    { value: 'Personnel', label: 'Transport personnel' },
                    { value: 'Livraison', label: 'Livraison' },
                    { value: 'VTC', label: 'VTC' },
                    { value: 'Transport', label: 'Transport' },
                    { value: 'Autre', label: 'Autre' }
                  ]}
                />
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Type de travail</label>
                <CustomSelect
                  value={formData.conditions.workType}
                  onChange={handleSelectChange('conditions.workType')}
                  placeholder="Type de travail"
                  options={[
                    { value: 'temps_plein', label: 'Temps plein' },
                    { value: 'temps_partiel', label: 'Temps partiel' },
                    { value: 'ponctuel', label: 'Ponctuel' },
                    { value: 'weekend', label: 'Weekend' }
                  ]}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Décrivez la mission, les horaires, les quartiers à desservir..."
                className={`w-full p-2 lg:p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Zone et Ville */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Zone géographique *</label>
                <input
                  type="text"
                  name="requirements.zone"
                  value={formData.requirements.zone}
                  onChange={handleInputChange}
                  placeholder="Ex: Cocody, Plateau, Marcory, Treichville, Yopougon..."
                  className={`w-full p-2 lg:p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base ${errors.zone ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.zone && <p className="text-red-500 text-sm mt-1">{errors.zone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">Ville *</label>
                <CustomSelect
                  value={formData.location.city}
                  onChange={handleSelectChange('location.city')}
                  placeholder="Sélectionner une ville"
                  options={[
                    { value: '', label: 'Sélectionner une ville' },
                    { value: 'Abidjan', label: 'Abidjan' },
                    { value: 'Bouaké', label: 'Bouaké' },
                    { value: 'Daloa', label: 'Daloa' },
                    { value: 'Yamoussoukro', label: 'Yamoussoukro' },
                    { value: 'San-Pédro', label: 'San-Pédro' },
                    { value: 'Korhogo', label: 'Korhogo' },
                    { value: 'Man', label: 'Man' },
                    { value: 'Divo', label: 'Divo' },
                    { value: 'Gagnoa', label: 'Gagnoa' },
                    { value: 'Abengourou', label: 'Abengourou' }
                  ]}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Mission urgente</span>
              </label>
            </div>

            {/* Boutons */}
            <div className="flex flex-col lg:flex-row justify-end gap-3 pt-4 lg:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm lg:text-base"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm lg:text-base"
              >
                {loading ? 'Modification...' : 'Modifier l\'offre'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
