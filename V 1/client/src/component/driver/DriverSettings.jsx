import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { driversApi } from '../../services/api';

export default function DriverSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Permis et documents
    licenseType: 'B',
    licenseDate: '',
    licenseNumber: '',
    vtcCard: '',
    
    // Véhicule
    vehicleType: '',
    vehicleBrand: '',
    vehicleYear: '',
    vehicleSeats: '',
    
    // Expérience
    experience: '',
    workZone: '',
    specialties: [],
    
    // Notifications
    notifications: {
      newOffers: true,
      profileValidation: true,
      payments: true,
      missionUpdates: true
    }
  });

  // Charger les données du profil au montage
  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    if (!user?.sub) return;
    
    setLoading(true);
    try {
      const response = await driversApi.getMyProfile();
      const profile = response.data.driver;
      
      setFormData({
        firstName: profile?.userId?.firstName || profile?.firstName || user.firstName || '',
        lastName: profile?.userId?.lastName || profile?.lastName || user.lastName || '',
        email: profile?.userId?.email || profile?.email || user.email || '',
        phone: profile?.userId?.phone || profile?.phone || user.phone || '',
        licenseType: profile.licenseType || 'B',
        licenseDate: profile.licenseDate ? new Date(profile.licenseDate).toISOString().split('T')[0] : '',
        licenseNumber: profile.licenseNumber || '',
        vtcCard: profile.vtcCard || '',
        vehicleType: profile.vehicleType || '',
        vehicleBrand: profile.vehicleBrand || '',
        vehicleYear: profile.vehicleYear || '',
        vehicleSeats: profile.vehicleSeats || '',
        experience: profile.experience || '',
        workZone: profile.workZone || '',
        specialties: profile.specialties || [],
        notifications: {
          newOffers: profile.notifications?.newOffers ?? true,
          profileValidation: profile.notifications?.profileValidation ?? true,
          payments: profile.notifications?.payments ?? true,
          missionUpdates: profile.notifications?.missionUpdates ?? true
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      // Si le profil n'existe pas, on utilise les données de base de l'utilisateur
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSpecialtyChange = (specialty, checked) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        userId: user.sub
      };
      
      await driversApi.updateProfile(user.sub, profileData);
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDriverProfile(); // Recharger les données originales
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Fonction helper pour créer des champs en lecture/édition
  const renderField = (label, name, value, type = 'text', options = null, placeholder = '') => {
    if (!isEditing) {
      let displayValue = value || 'Non renseigné';
      
      // Formatage spécial pour certains types
      if (type === 'date' && value) {
        displayValue = new Date(value).toLocaleDateString();
      } else if (type === 'select' && options && value) {
        const option = options.find(opt => opt.value === value);
        displayValue = option ? option.label : value;
      }
      
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
            {displayValue}
          </div>
        </div>
      );
    }

    // Mode édition
    if (type === 'select' && options) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-sm lg:text-base text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="space-y-6">

        {/* Paramètres de notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Paramètres de notification</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Nouvelles offres</h4>
                  <p className="text-sm text-gray-500">Recevoir des notifications pour les nouvelles offres correspondant à votre profil</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="notifications.newOffers"
                    checked={formData.notifications.newOffers}
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Validation de profil</h4>
                  <p className="text-sm text-gray-500">Notifications concernant la validation de vos documents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Paiements reçus</h4>
                  <p className="text-sm text-gray-500">Confirmation de réception des paiements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Mises à jour de missions</h4>
                  <p className="text-sm text-gray-500">Changements dans vos missions acceptées</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres de sécurité */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Sécurité</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              <div>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Changer le mot de passe</h4>
                      <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
              <div>
                <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-500">Sécurisez votre compte avec 2FA</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
