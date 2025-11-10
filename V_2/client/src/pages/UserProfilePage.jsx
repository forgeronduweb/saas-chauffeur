import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from '../component/common/SimpleHeader';
import api from '../services/api';

// Fonction utilitaire pour convertir un fichier en base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [employerType, setEmployerType] = useState('particulier');

  const [driverInfo, setDriverInfo] = useState({
    licenseNumber: '',
    licenseType: 'B',
    licenseExpiryDate: '',
    experience: '1-3',
    workZone: ''
  });

  const [workExperiences, setWorkExperiences] = useState([
    {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ]);

  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [employerInfo, setEmployerInfo] = useState({
    companyName: '',
    companyType: '',
    siret: '',
    address: '',
    city: 'Abidjan',
    website: '',
    description: '',
    sector: '',
    employeeCount: '',
    foundedYear: '',
    companyPhone: '',
    companyEmail: '',
    contactPerson: '',
    contactPosition: ''
  });

  const [documents, setDocuments] = useState({
    profilePhoto: null,
    idCard: null,
    companyRegistration: null,
    driverLicenseFront: null,
    driverLicenseBack: null
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setIsDriver(user.role === 'driver');

      if (user.role === 'employer') {
        loadEmployerProfile();
      }
      
      if (user.role === 'driver') {
        loadDriverProfile();
      }
    }
  }, [user]);
  
  const loadDriverProfile = async () => {
    try {
      const response = await api.get('/drivers/profile');
      if (response.data && response.data.driver) {
        const driver = response.data.driver;
        
        // Charger les infos du permis
        setDriverInfo({
          licenseNumber: driver.licenseNumber || '',
          licenseType: driver.licenseType || 'B',
          licenseExpiryDate: driver.licenseExpiryDate ? driver.licenseExpiryDate.split('T')[0] : '',
          experience: driver.experience || '1-3',
          workZone: driver.workZone || '',
          profilePhotoUrl: driver.profilePhotoUrl || ''
        });
        
        // Charger les expériences professionnelles
        if (driver.workExperience && driver.workExperience.length > 0) {
          setWorkExperiences(driver.workExperience.map(exp => ({
            company: exp.company || '',
            position: exp.position || '',
            startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
            endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
            description: exp.description || ''
          })));
        }
      }
    } catch (err) {
      console.log('Aucun profil chauffeur trouvé ou erreur:', err);
    }
  };

  const loadEmployerProfile = async () => {
    try {
      const response = await api.get('/employer/profile');
      if (response.data && response.data.employer) {
        const emp = response.data.employer;
        setEmployerType(emp.employerType || 'particulier');
        setEmployerInfo({
          companyName: emp.companyName || '',
          companyType: emp.companyType || '',
          siret: emp.siret || '',
          address: emp.address || '',
          city: emp.city || 'Abidjan',
          website: emp.website || '',
          description: emp.description || '',
          sector: emp.sector || '',
          employeeCount: emp.employeeCount || '',
          foundedYear: emp.foundedYear || '',
          companyPhone: emp.companyPhone || '',
          companyEmail: emp.companyEmail || '',
          contactPerson: emp.contactPerson || '',
          contactPosition: emp.contactPosition || ''
        });
      }
    } catch (err) {
      console.log('Aucun profil employeur trouvé');
    }
  };

  const handleUserInfoChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleEmployerInfoChange = (e) => {
    setEmployerInfo({
      ...employerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleDriverInfoChange = (e) => {
    setDriverInfo({
      ...driverInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const newExperiences = [...workExperiences];
    newExperiences[index][field] = value;
    setWorkExperiences(newExperiences);
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ]);
  };

  const removeWorkExperience = (index) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDocuments({
        ...documents,
        [name]: files[0]
      });
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convertir la photo de profil en base64 si elle existe
      let profilePhotoBase64 = null;
      if (documents.profilePhoto) {
        profilePhotoBase64 = await convertToBase64(documents.profilePhoto);
      }

      // Sauvegarder les informations personnelles avec la photo
      const userDataToUpdate = {
        ...userInfo,
        ...(profilePhotoBase64 && { profilePhoto: profilePhotoBase64 })
      };
      
      console.log('Mise à jour des infos personnelles:', userDataToUpdate);
      await api.put('/auth/me', userDataToUpdate);
      
      // Sauvegarder les informations chauffeur si l'utilisateur est chauffeur
      if (user?.role === 'driver') {
        console.log('Mise à jour du profil chauffeur...');
        
        // Préparer les données du chauffeur
        const driverData = {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone,
          licenseNumber: driverInfo.licenseNumber,
          licenseType: driverInfo.licenseType,
          licenseExpiryDate: driverInfo.licenseExpiryDate,
          experience: driverInfo.experience,
          workZone: driverInfo.workZone,
          workExperience: workExperiences.filter(exp => 
            exp.company || exp.position || exp.startDate || exp.endDate || exp.description
          ),
          ...(profilePhotoBase64 && { profilePhotoUrl: profilePhotoBase64 })
        };
        
        console.log('Données chauffeur à envoyer:', driverData);
        
        const response = await api.put('/drivers/profile', driverData);
        console.log('Réponse serveur:', response.data);
      }
      
      // Sauvegarder les informations employeur si l'utilisateur est employeur
      if (user?.role === 'employer') {
        console.log('Mise à jour du profil employeur...');
        
        // Filtrer les champs vides pour les enums
        const filteredEmployerInfo = {};
        Object.keys(employerInfo).forEach(key => {
          const value = employerInfo[key];
          // Ne pas envoyer les champs vides pour les enums
          if (value !== '' && value !== null && value !== undefined) {
            filteredEmployerInfo[key] = value;
          }
        });
        
        await api.post('/employer/profile', {
          employerType,
          ...filteredEmployerInfo
        });
      }
      
      setSuccess('Toutes les informations ont été mises à jour avec succès !');
      setIsEditing(false);
      
      // Recharger les données utilisateur depuis l'API
      await refreshUser();
      
      // Recharger les profils spécifiques
      if (user?.role === 'driver') {
        await loadDriverProfile();
      }
      if (user?.role === 'employer') {
        await loadEmployerProfile();
      }
    } catch (err) {
      console.error('Erreur de mise à jour complète:', err);
      console.error('Réponse erreur:', err.response);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message
        || 'Erreur lors de la mise à jour';
      
      setError(errorMessage);
      
      // Afficher les détails de validation si disponibles
      if (err.response?.data?.details) {
        console.error('Détails de validation:', err.response.data.details);
        const details = Array.isArray(err.response.data.details) 
          ? err.response.data.details.join(', ')
          : err.response.data.details;
        setError(errorMessage + ': ' + details);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl lg:text-3xl text-gray-900">Mon Profil</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors text-sm sm:text-base"
              >
                Éditer
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-sm sm:text-base text-green-700">{success}</p>
          </div>
        )}

        {/* Photo de profil */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl text-gray-900 mb-3 sm:mb-4">Photo de profil</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Aperçu de la photo */}
            <div className="flex-shrink-0">
              {(isDriver ? driverInfo?.profilePhotoUrl : user?.profilePhotoUrl) ? (
                <img 
                  src={isDriver ? driverInfo.profilePhotoUrl : user.profilePhotoUrl} 
                  alt="Photo de profil" 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-3xl sm:text-4xl text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Upload de la photo */}
            <div className="flex-1 w-full">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Changer la photo de profil
              </label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-sm ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
              />
              {documents.profilePhoto && (
                <p className="text-xs text-green-600 mt-2">✓ {documents.profilePhoto.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Format accepté : JPG, PNG, GIF (max 5 MB)
              </p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl text-gray-900 mb-3 sm:mb-4">Informations personnelles</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={userInfo.firstName}
                  onChange={handleUserInfoChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500 focus:border-transparent' : 'bg-gray-50 cursor-not-allowed'}`}
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={userInfo.lastName}
                  onChange={handleUserInfoChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500 focus:border-transparent' : 'bg-gray-50 cursor-not-allowed'}`}
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500 focus:border-transparent' : 'bg-gray-50 cursor-not-allowed'}`}
                />
              </div>

              {isDriver && (
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Lieu d'habitation</label>
                  <select
                    name="workZone"
                    value={driverInfo.workZone}
                    onChange={handleDriverInfoChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  >
                    <option value="">Sélectionnez une ville</option>
                    <option value="Abidjan">Abidjan</option>
                    <option value="Cocody">Cocody</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Yopougon">Yopougon</option>
                    <option value="Abobo">Abobo</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Treichville">Treichville</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                    <option value="San-Pédro">San-Pédro</option>
                    <option value="Daloa">Daloa</option>
                    <option value="Korhogo">Korhogo</option>
                    <option value="Man">Man</option>
                    <option value="Gagnoa">Gagnoa</option>
                    <option value="Divo">Divo</option>
                    <option value="Abengourou">Abengourou</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        </div>

        {isDriver && (
          <>
            {/* Informations Permis de conduire */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl text-gray-900 mb-4">Permis de conduire</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de permis</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={driverInfo.licenseNumber}
                    onChange={handleDriverInfoChange}
                    disabled={!isEditing}
                    placeholder="Ex: CI240001234"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de permis</label>
                  <select
                    name="licenseType"
                    value={driverInfo.licenseType}
                    onChange={handleDriverInfoChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  >
                    <option value="B">B (Voiture)</option>
                    <option value="C">C (Poids lourd)</option>
                    <option value="D">D (Transport de personnes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={driverInfo.licenseExpiryDate}
                    onChange={handleDriverInfoChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                  <select
                    name="experience"
                    value={driverInfo.experience}
                    onChange={handleDriverInfoChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  >
                    <option value="0-1">Moins d'1 an</option>
                    <option value="1-3">1 à 3 ans</option>
                    <option value="3-5">3 à 5 ans</option>
                    <option value="5+">Plus de 5 ans</option>
                  </select>
                </div>
              </div>

              {/* Documents du permis */}
              <div className="mt-6">
                <h3 className="text-lg text-gray-900 mb-4">Documents du permis de conduire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo recto du permis *
                    </label>
                    <input
                      type="file"
                      name="driverLicenseFront"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                    />
                    {documents.driverLicenseFront && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.driverLicenseFront.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo verso du permis *
                    </label>
                    <input
                      type="file"
                      name="driverLicenseBack"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                    />
                    {documents.driverLicenseBack && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.driverLicenseBack.name}</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Expérience professionnelle */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl text-gray-900">Expérience professionnelle</h2>
                {isEditing && (
                  <button
                    onClick={addWorkExperience}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    + Ajouter une expérience
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {isEditing && workExperiences.length > 1 && (
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 sm:p-0"
                        aria-label="Supprimer cette expérience"
                      >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Nom de l'entreprise"
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Poste occupé</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Ex: Chauffeur personnel"
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                          disabled={!isEditing}
                          rows="3"
                          placeholder="Décrivez vos responsabilités et réalisations..."
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  Ajoutez vos expériences professionnelles pour renforcer votre profil.
                </p>
              </div>
            </div>
          </>
        )}

        {user?.role === 'employer' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl text-gray-900 mb-4">Informations employeur</h2>

            <div className="mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
                Type d'employeur
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setEmployerType('particulier')}
                  disabled={!isEditing}
                  className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all ${
                    employerType === 'particulier'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Particulier</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setEmployerType('entreprise')}
                  disabled={!isEditing}
                  className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all ${
                    employerType === 'entreprise'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Entreprise</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employerType === 'entreprise' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                      <input
                        type="text"
                        name="companyName"
                        value={employerInfo.companyName}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="Ex: Transport Express CI"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type d'entreprise</label>
                      <select
                        name="companyType"
                        value={employerInfo.companyType}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="sarl">SARL</option>
                        <option value="sa">SA</option>
                        <option value="entreprise_individuelle">Entreprise individuelle</option>
                        <option value="association">Association</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro SIRET/RC</label>
                      <input
                        type="text"
                        name="siret"
                        value={employerInfo.siret}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="Ex: CI-ABJ-2024-B-12345"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
                      <select
                        name="sector"
                        value={employerInfo.sector}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="transport">Transport</option>
                        <option value="logistique">Logistique</option>
                        <option value="commerce">Commerce</option>
                        <option value="industrie">Industrie</option>
                        <option value="services">Services</option>
                        <option value="hotellerie">Hôtellerie/Restauration</option>
                        <option value="evenementiel">Événementiel</option>
                        <option value="tourisme">Tourisme</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Effectif</label>
                      <select
                        name="employeeCount"
                        value={employerInfo.employeeCount}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="1-10">1-10 employés</option>
                        <option value="11-50">11-50 employés</option>
                        <option value="51-200">51-200 employés</option>
                        <option value="201-500">201-500 employés</option>
                        <option value="500+">Plus de 500 employés</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Année de création</label>
                      <input
                        type="number"
                        name="foundedYear"
                        value={employerInfo.foundedYear}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="Ex: 2015"
                        min="1900"
                        max={new Date().getFullYear()}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={employerInfo.city}
                    onChange={handleEmployerInfoChange}
                    disabled={!isEditing}
                    placeholder="Ex: Abidjan"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone {employerType === 'entreprise' ? 'entreprise' : 'personnel'}
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={employerInfo.companyPhone}
                    onChange={handleEmployerInfoChange}
                    disabled={!isEditing}
                    placeholder="+225 27 00 00 00 00"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email {employerType === 'entreprise' ? 'entreprise' : 'personnel'}
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={employerInfo.companyEmail}
                    onChange={handleEmployerInfoChange}
                    disabled={!isEditing}
                    placeholder="contact@entreprise.com"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                  <input
                    type="text"
                    name="address"
                    value={employerInfo.address}
                    onChange={handleEmployerInfoChange}
                    disabled={!isEditing}
                    placeholder="Ex: Boulevard de la République, Plateau"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                  />
                </div>

                {employerType === 'entreprise' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                      <input
                        type="url"
                        name="website"
                        value={employerInfo.website}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="https://www.example.com"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'entreprise</label>
                      <textarea
                        name="description"
                        value={employerInfo.description}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        rows="4"
                        placeholder="Décrivez votre entreprise..."
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>
                  </>
                )}
              </div>

              {employerType === 'entreprise' && (
                <div className="mt-6">
                  <h3 className="text-lg text-gray-900 mb-4">Personne de contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={employerInfo.contactPerson}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="Ex: Jean Kouassi"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fonction/Poste</label>
                      <input
                        type="text"
                        name="contactPosition"
                        value={employerInfo.contactPosition}
                        onChange={handleEmployerInfoChange}
                        disabled={!isEditing}
                        placeholder="Ex: Directeur RH"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? 'focus:ring-2 focus:ring-orange-500' : 'bg-gray-50 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {!isDriver && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl text-gray-900">Devenir Chauffeur</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complétez vos informations pour apparaître dans la liste des chauffeurs
                </p>
              </div>
              
              {!showDriverForm && (
                <button
                  onClick={() => setShowDriverForm(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Commencer
                </button>
              )}
            </div>

            {showDriverForm && (
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p>Le formulaire "Devenir Chauffeur" sera affiché ici avec tous les champs nécessaires.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
