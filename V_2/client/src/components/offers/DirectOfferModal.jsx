import React, { useState } from 'react';
import { X } from 'lucide-react';
import { offersApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Modal pour créer une offre d'emploi directe à un chauffeur spécifique
 * @param {Object} props - Props du composant
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {Object} props.driver - Chauffeur ciblé
 * @param {Function} props.onSuccess - Callback de succès
 */
export default function DirectOfferModal({ isOpen, onClose, driver, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    description: ''
  });

  
  
  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 Données du chauffeur:', driver);
      console.log('🔍 ID utilisateur:', user.id);
      console.log('🔍 ID chauffeur:', driver.id || driver._id);

      const offerData = {
        title: formData.title,
        description: formData.description,
        // Type d'offre d'emploi générique (doit être compatible avec l'énum du modèle)
        type: 'Transport',
        employerId: user.id,
        targetDriverId: driver._id || driver.id, // Essayer _id en premier
        status: 'active',
        isDirect: true,
        location: {
          address: '',
          city: formData.location,
        },
        conditions: {
          salary: Number(formData.salary) || 0,
          salaryType: 'mensuel',
          workType: 'temps_plein',
        },
      };

      const response = await offersApi.create(offerData);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        location: '',
        salary: '',
        description: ''
      });
      
      // Callback de succès avec l'offre créée
      if (onSuccess) {
        onSuccess(response?.data || null);
      }
      
      // Fermer la modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur création offre directe:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'offre directe');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-transparent" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mt-10 sm:mt-16">
          {/* Header simple */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl text-gray-900">
              Offre pour {driver?.firstName} {driver?.lastName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Formulaire simplifié */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Titre */}
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Titre du poste *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Chauffeur livraison"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Lieu */}
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Lieu de travail *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Abidjan, Cocody"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Salaire */}
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Salaire mensuel (FCFA) *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Ex: 150000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le poste..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
