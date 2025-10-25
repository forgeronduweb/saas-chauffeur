import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { driversApi } from '../../services/api';

export default function DriverProfile() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
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
    licenseDocumentRecto: null,
    licenseDocumentVerso: null,
    licenseDocumentRectoUrl: '',
    licenseDocumentVersoUrl: '',
    profilePhoto: null,
    profilePhotoUrl: '',
    
    // Véhicule
    vehicleType: '',
    vehicleBrand: '',
    vehicleYear: '',
    vehicleSeats: '',
    
    // Expérience
    experience: '',
    workZone: '',
    specialties: [],
    
    // Expérience professionnelle (lieux de travail)
    workExperience: [
      // { company: '', location: '', position: '', startDate: '', endDate: '', description: '' }
    ]
  });

  // Charger les données du profil au montage
  useEffect(() => {
    console.log('=== USEEFFECT DÉCLENCHÉ ===');
    console.log('user disponible:', user);
    console.log('user.sub:', user?.sub);
    console.log('authLoading:', authLoading);
    
    // Ne charger que si l'utilisateur est disponible et l'auth n'est pas en cours
    if (!user || authLoading) {
      console.log('Utilisateur non disponible ou auth en cours, skip du chargement');
      return;
    }
    
    console.log('Chargement du profil...');
    const loadProfile = async () => {
      try {
        const response = await driversApi.getMyProfile();
        console.log('Force load response:', response);
        
        const profile = response.data?.driver || response.data;
        if (profile) {
          const processedData = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            licenseType: profile.licenseType || 'B',
            licenseDate: profile.licenseDate ? new Date(profile.licenseDate).toISOString().split('T')[0] : '',
            licenseNumber: profile.licenseNumber || '',
            vtcCard: profile.vtcCard || '',
            licenseDocumentRecto: null,
            licenseDocumentVerso: null,
            licenseDocumentRectoUrl: '',
            licenseDocumentVersoUrl: '',
            vehicleType: profile.vehicleType || '',
            vehicleBrand: profile.vehicleBrand || '',
            vehicleYear: profile.vehicleYear ? profile.vehicleYear.toString() : '',
            vehicleSeats: profile.vehicleSeats ? profile.vehicleSeats.toString() : '',
            experience: profile.experience || '',
            workZone: profile.workZone || '',
            specialties: profile.specialties || []
          };
          
          console.log('FORCE LOAD - Données traitées:', processedData);
          setFormData(processedData);
          setProfileLoaded(true);
        }
      } catch (error) {
        console.error('Erreur force load:', error);
      }
    };
    
    loadProfile();
  }, [user, authLoading]); // Dépendances : user et authLoading

  const loadDriverProfile = async () => {
    const userId = user?.sub || user?._id || user?.id;
    if (!userId) {
      console.log('Aucun utilisateur connecté, impossible de charger le profil');
      return;
    }
    
    console.log('Chargement du profil chauffeur pour l\'utilisateur:', userId);
    setLoading(true);
    
    try {
      const response = await driversApi.getMyProfile();
      console.log('Réponse API complète:', response);
      console.log('Structure response.data:', response.data);
      
      
      // Traiter les données exactement comme dans Force API qui fonctionne
      const profile = response.data?.driver || response.data;
      console.log('Profile extrait:', profile);
      
      if (profile) {
        const processedData = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          licenseType: profile.licenseType || 'B',
          licenseDate: profile.licenseDate ? new Date(profile.licenseDate).toISOString().split('T')[0] : '',
          licenseNumber: profile.licenseNumber || '',
          vtcCard: profile.vtcCard || '',
          licenseDocumentRecto: null,
          licenseDocumentVerso: null,
          licenseDocumentRectoUrl: '',
          licenseDocumentVersoUrl: '',
          profilePhoto: null,
          profilePhotoUrl: profile?.profilePhotoUrl || '',
          vehicleType: profile.vehicleType || '',
          vehicleBrand: profile.vehicleBrand || '',
          vehicleYear: profile.vehicleYear ? profile.vehicleYear.toString() : '',
          vehicleSeats: profile.vehicleSeats ? profile.vehicleSeats.toString() : '',
          experience: profile.experience || '',
          workZone: profile.workZone || '',
          specialties: profile.specialties || [],
          workExperience: profile.workExperience || []
        };
        
        console.log('Données traitées dans loadDriverProfile:', processedData);
        console.log('workExperience récupéré:', processedData.workExperience);
        setFormData(processedData);
        setProfileLoaded(true);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      
      // Si le profil n'existe pas, on utilise les données de base de l'utilisateur
      console.log('Utilisation des données utilisateur de base:', user);
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
    const { name, value } = e.target;
    console.log('=== CHANGEMENT CHAMP ===');
    console.log('Champ:', name, 'Valeur:', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log('FormData mis à jour');
  };

  const handleSpecialtyChange = (specialty, checked) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  // Fonctions pour gérer l'expérience professionnelle
  const addWorkExperience = () => {
    try {
      setFormData(prev => ({
        ...prev,
        workExperience: [
          ...(prev.workExperience || []),
          {
            company: '',
            location: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
          }
        ]
      }));
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'expérience:', error);
    }
  };

  const updateWorkExperience = (index, field, value) => {
    try {
      setFormData(prev => ({
        ...prev,
        workExperience: (prev.workExperience || []).map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        )
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour d\'expérience:', error);
    }
  };

  const removeWorkExperience = (index) => {
    try {
      setFormData(prev => ({
        ...prev,
        workExperience: (prev.workExperience || []).filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression d\'expérience:', error);
    }
  };

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Seuls les fichiers JPG, PNG et PDF sont autorisés');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [side === 'recto' ? 'licenseDocumentRecto' : 'licenseDocumentVerso']: file
      }));
    }
  };

  const handleRemoveDocument = (side) => {
    setFormData(prev => ({
      ...prev,
      [side === 'recto' ? 'licenseDocumentRecto' : 'licenseDocumentVerso']: null,
      [side === 'recto' ? 'licenseDocumentRectoUrl' : 'licenseDocumentVersoUrl']: ''
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Seuls les fichiers JPG et PNG sont autorisés pour la photo');
        return;
      }
      
      // Vérifier la taille (max 2MB pour une photo)
      if (file.size > 2 * 1024 * 1024) {
        alert('La photo ne doit pas dépasser 2MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }));
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profilePhoto: null,
      profilePhotoUrl: ''
    }));
  };

  const handleSave = async () => {
    console.log('=== DÉBUT SAUVEGARDE ===');
    console.log('Utilisateur:', user);
    console.log('User.sub:', user?.sub);
    console.log('Données à sauvegarder:', formData);
    
    // Vérification plus robuste de l'utilisateur
    if (!user) {
      alert('Erreur: Aucun utilisateur connecté. Veuillez vous reconnecter.');
      return;
    }
    
    // Vérifier l'ID utilisateur (peut être sub, _id, ou id selon le système)
    const userId = user.sub || user._id || user.id;
    if (!userId) {
      console.error('Structure utilisateur:', user);
      alert('Erreur: ID utilisateur manquant. Veuillez vous reconnecter.');
      return;
    }
    
    console.log('ID utilisateur trouvé:', userId);
    
    setSaving(true);
    try {
      // Si des fichiers sont sélectionnés, on utilise FormData
      if (formData.licenseDocumentRecto || formData.licenseDocumentVerso || formData.profilePhoto) {
        const formDataToSend = new FormData();
        
        // Ajouter tous les champs du profil
        Object.keys(formData).forEach(key => {
          if (!key.includes('licenseDocument') && !key.includes('profilePhoto') && key !== 'specialties' && key !== 'workExperience') {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // Ajouter les spécialités
        formDataToSend.append('specialties', JSON.stringify(formData.specialties));
        
        // Ajouter l'expérience professionnelle
        formDataToSend.append('workExperience', JSON.stringify(formData.workExperience || []));
        
        // Ajouter les fichiers s'ils existent
        if (formData.licenseDocumentRecto) {
          formDataToSend.append('licenseDocumentRecto', formData.licenseDocumentRecto);
        }
        if (formData.licenseDocumentVerso) {
          formDataToSend.append('licenseDocumentVerso', formData.licenseDocumentVerso);
        }
        if (formData.profilePhoto) {
          formDataToSend.append('profilePhoto', formData.profilePhoto);
        }
        
        // Ajouter l'ID utilisateur
        formDataToSend.append('userId', userId);
        
        // Envoyer avec FormData
        console.log('Envoi avec FormData...');
        await driversApi.updateProfileWithFile(userId, formDataToSend);
        console.log('FormData envoyé avec succès');
      } else {
        // Sauvegarde normale sans fichier
        console.log('Envoi sans fichier...');
        const profileData = {
          ...formData,
          userId: userId
        };
        console.log('Données à envoyer:', profileData);
        console.log('workExperience à envoyer:', profileData.workExperience);
        
        await driversApi.updateProfile(userId, profileData);
        console.log('Données envoyées avec succès');
      }
      
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
      
      // Recharger le profil pour récupérer l'URL du document uploadé
      await loadDriverProfile();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      
      let errorMessage = 'Erreur lors de la sauvegarde du profil';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDriverProfile(); // Recharger les données originales
  };

  const handleEdit = () => {
    console.log('=== ACTIVATION MODE ÉDITION ===');
    console.log('isEditing avant:', isEditing);
    setIsEditing(true);
    console.log('Mode édition activé');
  };

  // Attendre que l'authentification soit complète
  if (authLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Vérifier que l'utilisateur est connecté
  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Non connecté</h2>
            <p className="text-gray-600">Veuillez vous connecter pour accéder à votre profil.</p>
          </div>
        </div>
      </div>
    );
  }

  // Gestion d'erreur pour éviter la page blanche
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  console.log('=== RENDU COMPOSANT ===');
  console.log('isEditing:', isEditing);
  console.log('user complet:', user);
  console.log('user.sub:', user?.sub);
  console.log('user._id:', user?._id);
  console.log('user.id:', user?.id);
  console.log('formData:', formData);

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mon profil</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-sm lg:text-base text-gray-600">Gérez vos informations personnelles et professionnelles</p>
            {profileLoaded && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Données chargées
              </span>
            )}
            {!profileLoaded && !loading && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Profil vide
              </span>
            )}
          </div>
        </div>
        
        {/* Bouton Modifier en haut à droite (desktop uniquement) */}
        {!isEditing && (
          <div className="hidden lg:block">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
          </div>
        )}
      </div>


      <div className="space-y-4 lg:space-y-6">
        {/* Photo et informations de base */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Informations personnelles</h3>
          </div>
          <div className="p-4 lg:p-6">
            {/* Photo de profil */}
            <div className="mb-4 lg:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Photo de profil</label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {formData.profilePhotoUrl ? (
                    <img 
                      src={formData.profilePhotoUrl} 
                      alt="Photo de profil"
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                      <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="text-center">
                    <input
                      type="file"
                      id="profilePhotoUpload"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handlePhotoUpload(e)}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePhotoUpload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Changer la photo
                    </label>
                    {formData.profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                    required
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.firstName || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                    required
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.lastName || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                    required
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.email || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                    required
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.phone || 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permis et documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Permis et documents</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de permis *</label>
                {isEditing ? (
                  <select 
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base" 
                    required
                  >
                    <option value="B">Permis B</option>
                    <option value="B+">Permis B + Formation 7h</option>
                    <option value="C">Permis C</option>
                    <option value="D">Permis D</option>
                  </select>
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.licenseType === 'B' ? 'Permis B' :
                     formData.licenseType === 'B+' ? 'Permis B + Formation 7h' :
                     formData.licenseType === 'C' ? 'Permis C' :
                     formData.licenseType === 'D' ? 'Permis D' : 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'obtention *</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="licenseDate"
                    value={formData.licenseDate}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                    required
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.licenseDate ? new Date(formData.licenseDate).toLocaleDateString() : 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de permis</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="CI240001234"
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.licenseNumber || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carte professionnelle VTC</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="vtcCard"
                    value={formData.vtcCard}
                    onChange={handleInputChange}
                    placeholder="Numéro de carte VTC (optionnel)"
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.vtcCard || 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>

            {/* Upload du permis de conduire recto-verso */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-4">Documents du permis de conduire (recto-verso)</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* RECTO */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Recto (face avant)
                  </h5>
                  
                  {/* Document recto existant */}
                  {(formData.licenseDocumentRectoUrl || formData.licenseDocumentRecto) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {formData.licenseDocumentRecto ? formData.licenseDocumentRecto.name : 'Recto uploadé'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formData.licenseDocumentRecto 
                                ? `${(formData.licenseDocumentRecto.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Document disponible'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {formData.licenseDocumentRectoUrl && !formData.licenseDocumentRecto && (
                            <a
                              href={formData.licenseDocumentRectoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Voir
                            </a>
                          )}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument('recto')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zone d'upload recto */}
                  {isEditing && !(formData.licenseDocumentRectoUrl || formData.licenseDocumentRecto) && (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-blue-50">
                      <input
                        type="file"
                        id="licenseUploadRecto"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'recto')}
                        className="hidden"
                      />
                      <label htmlFor="licenseUploadRecto" className="cursor-pointer block">
                        <svg className="mx-auto h-8 w-8 text-blue-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-xs text-blue-600">
                          <span className="font-medium">Uploader le recto</span>
                        </div>
                        <p className="text-xs text-blue-500 mt-1">
                          PNG, JPG, PDF (5MB max)
                        </p>
                      </label>
                    </div>
                  )}

                  {/* Bouton remplacer recto */}
                  {isEditing && (formData.licenseDocumentRectoUrl || formData.licenseDocumentRecto) && (
                    <div>
                      <input
                        type="file"
                        id="licenseReplaceRecto"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'recto')}
                        className="hidden"
                      />
                      <label
                        htmlFor="licenseReplaceRecto"
                        className="inline-flex items-center px-2 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Remplacer
                      </label>
                    </div>
                  )}

                  {!isEditing && !formData.licenseDocumentRectoUrl && !formData.licenseDocumentRecto && (
                    <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs">Recto non uploadé</p>
                    </div>
                  )}
                </div>

                {/* VERSO */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Verso (face arrière)
                  </h5>
                  
                  {/* Document verso existant */}
                  {(formData.licenseDocumentVersoUrl || formData.licenseDocumentVerso) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {formData.licenseDocumentVerso ? formData.licenseDocumentVerso.name : 'Verso uploadé'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formData.licenseDocumentVerso 
                                ? `${(formData.licenseDocumentVerso.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Document disponible'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {formData.licenseDocumentVersoUrl && !formData.licenseDocumentVerso && (
                            <a
                              href={formData.licenseDocumentVersoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Voir
                            </a>
                          )}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument('verso')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zone d'upload verso */}
                  {isEditing && !(formData.licenseDocumentVersoUrl || formData.licenseDocumentVerso) && (
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors bg-green-50">
                      <input
                        type="file"
                        id="licenseUploadVerso"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'verso')}
                        className="hidden"
                      />
                      <label htmlFor="licenseUploadVerso" className="cursor-pointer block">
                        <svg className="mx-auto h-8 w-8 text-green-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-xs text-green-600">
                          <span className="font-medium">Uploader le verso</span>
                        </div>
                        <p className="text-xs text-green-500 mt-1">
                          PNG, JPG, PDF (5MB max)
                        </p>
                      </label>
                    </div>
                  )}

                  {/* Bouton remplacer verso */}
                  {isEditing && (formData.licenseDocumentVersoUrl || formData.licenseDocumentVerso) && (
                    <div>
                      <input
                        type="file"
                        id="licenseReplaceVerso"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'verso')}
                        className="hidden"
                      />
                      <label
                        htmlFor="licenseReplaceVerso"
                        className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 cursor-pointer"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Remplacer
                      </label>
                    </div>
                  )}

                  {!isEditing && !formData.licenseDocumentVersoUrl && !formData.licenseDocumentVerso && (
                    <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs">Verso non uploadé</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message d'aide */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-amber-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-amber-800 font-medium">Conseil :</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Assurez-vous que les deux faces de votre permis sont bien visibles et lisibles. 
                      Les documents flous ou partiellement cachés peuvent retarder la validation de votre profil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Véhicule */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Mon véhicule</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de véhicule *</label>
                {isEditing ? (
                  <select 
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base" 
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="berline">Berline</option>
                    <option value="suv">SUV</option>
                    <option value="utilitaire">Utilitaire</option>
                    <option value="moto">Moto</option>
                    <option value="van">Van</option>
                    <option value="camion">Camion</option>
                  </select>
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.vehicleType ? formData.vehicleType.charAt(0).toUpperCase() + formData.vehicleType.slice(1) : 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marque et modèle</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="vehicleBrand"
                    value={formData.vehicleBrand}
                    onChange={handleInputChange}
                    placeholder="Ex: Toyota Corolla"
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.vehicleBrand || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1990"
                    max="2024"
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.vehicleYear || 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de places</label>
                {isEditing ? (
                  <select 
                    name="vehicleSeats"
                    value={formData.vehicleSeats}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  >
                    <option value="">Sélectionner</option>
                    <option value="2">2 places</option>
                    <option value="4">4 places</option>
                    <option value="5">5 places</option>
                    <option value="7">7 places</option>
                    <option value="9">9 places</option>
                    <option value="9+">Plus de 9 places</option>
                  </select>
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.vehicleSeats ? `${formData.vehicleSeats} places` : 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expérience et disponibilités */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Expérience et disponibilités</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience *</label>
                {isEditing ? (
                  <select 
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base" 
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="<1">Moins d'1 an</option>
                    <option value="1-3">1-3 ans</option>
                    <option value="3-5">3-5 ans</option>
                    <option value="5-10">5-10 ans</option>
                    <option value="10+">Plus de 10 ans</option>
                  </select>
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.experience === '<1' ? 'Moins d\'1 an' :
                     formData.experience === '1-3' ? '1-3 ans' :
                     formData.experience === '3-5' ? '3-5 ans' :
                     formData.experience === '5-10' ? '5-10 ans' :
                     formData.experience === '10+' ? 'Plus de 10 ans' : 'Non renseigné'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone de travail préférée</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="workZone"
                    value={formData.workZone}
                    onChange={handleInputChange}
                    placeholder="Ex: Abidjan et environs"
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                  />
                ) : (
                  <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                    {formData.workZone || 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spécialités</label>
              {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {['Transport personnel', 'Livraison', 'VTC', 'Déménagement', 'Transport groupe', 'Longue distance'].map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500" 
                      />
                      <span className="ml-2 text-sm text-gray-600">{specialty}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                  {formData.specialties.length > 0 ? formData.specialties.join(', ') : 'Aucune spécialité sélectionnée'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expérience professionnelle */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base lg:text-lg font-medium text-gray-900">Expérience professionnelle</h3>
              {isEditing && (
                <button
                  onClick={addWorkExperience}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              )}
            </div>
          </div>
          <div className="p-4 lg:p-6">
            {(!formData.workExperience || formData.workExperience.length === 0) ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune expérience ajoutée</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter vos expériences professionnelles.</p>
                {isEditing && (
                  <div className="mt-6">
                    <button
                      onClick={addWorkExperience}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une expérience
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {(formData.workExperience || []).map((experience, index) => {
                  // Vérification de sécurité pour chaque expérience
                  const safeExperience = experience || {};
                  
                  return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {isEditing && (
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise/Employeur</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={safeExperience.company || ''}
                            onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                            placeholder="Ex: Taxi Abidjan, Uber, Bolt..."
                            className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                          />
                        ) : (
                          <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                            {safeExperience.company || 'Non renseigné'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={safeExperience.location || ''}
                            onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                            placeholder="Ex: Abidjan, Yamoussoukro..."
                            className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                          />
                        ) : (
                          <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                            {safeExperience.location || 'Non renseigné'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Poste</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={safeExperience.position || ''}
                            onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                            placeholder="Ex: Chauffeur VTC, Livreur..."
                            className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                          />
                        ) : (
                          <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                            {safeExperience.position || 'Non renseigné'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                        {isEditing ? (
                          <input
                            type="month"
                            value={safeExperience.startDate || ''}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                            className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                          />
                        ) : (
                          <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                            {safeExperience.startDate ? new Date(safeExperience.startDate + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'Non renseigné'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                        {isEditing ? (
                          <input
                            type="month"
                            value={safeExperience.endDate || ''}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                            className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                          />
                        ) : (
                          <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                            {safeExperience.endDate ? new Date(safeExperience.endDate + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'En cours'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      {isEditing ? (
                        <textarea
                          value={safeExperience.description || ''}
                          onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                          placeholder="Décrivez vos missions et responsabilités..."
                          rows="3"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {safeExperience.description || 'Aucune description'}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex flex-col lg:flex-row justify-end gap-3">
            <button 
              onClick={handleCancel}
              className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm lg:text-base"
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full lg:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {/* Bouton Modifier en bas (mobile uniquement) */}
        {!isEditing && (
          <div className="mt-6 lg:hidden">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 text-base font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier mon profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
