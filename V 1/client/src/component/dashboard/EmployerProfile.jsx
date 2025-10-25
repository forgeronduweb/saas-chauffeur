import { useState } from 'react';

export default function EmployerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Informations personnelles (particulier)
    firstName: 'Kouassi',
    lastName: 'Yao',
    email: 'kouassi.yao@gmail.com',
    phone: '07 12 34 56 78',
    
    // Type de profil
    isCompany: false,
    
    // Informations entreprise (si isCompany = true)
    companyName: '',
    legalForm: 'SARL',
    companyNumber: '',
    sector: 'Transport de personnes',
    companyEmail: '',
    companyPhone: '',
    contactName: '',
    contactFunction: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Côte d\'Ivoire',
    activityZone: '',
    description: '',
    missionTypes: [],
    needsFrequency: 'Occasionnel',
    companyLogo: null,
    companyLogoUrl: ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Logique de sauvegarde ici
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanyToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      isCompany: checked
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Seuls les fichiers JPG et PNG sont autorisés pour le logo');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Le logo ne doit pas dépasser 2MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        companyLogo: file
      }));
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      companyLogo: null,
      companyLogoUrl: ''
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-sm lg:text-base text-gray-600">Gérez les informations de votre entreprise</p>
        </div>
        
        {/* Bouton Modifier en haut à droite (desktop uniquement) */}
        {!isEditing && (
          <div className="hidden lg:block">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
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
        {/* Informations du compte */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">
              {formData.isCompany ? 'Informations de l\'entreprise' : 'Informations personnelles'}
            </h3>
          </div>
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            
            {/* Option type de profil */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Type de profil</h4>
                  <p className="text-sm text-gray-500">
                    {formData.isCompany ? 'Profil entreprise avec informations légales' : 'Profil particulier'}
                  </p>
                </div>
                {isEditing && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isCompany}
                      onChange={(e) => handleCompanyToggle(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {formData.isCompany ? 'Entreprise' : 'Particulier'}
                    </span>
                  </label>
                )}
                {!isEditing && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.isCompany 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.isCompany ? 'Entreprise' : 'Particulier'}
                  </span>
                )}
              </div>
            </div>

            {/* Photo de profil / Logo entreprise */}
            <div className="mb-4 lg:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {formData.isCompany ? 'Logo de l\'entreprise' : 'Photo de profil'}
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {formData.companyLogoUrl ? (
                    <img 
                      src={formData.companyLogoUrl} 
                      alt={formData.isCompany ? "Logo entreprise" : "Photo de profil"}
                      className={`w-24 h-24 lg:w-32 lg:h-32 ${formData.isCompany ? 'rounded-lg' : 'rounded-full'} object-cover border-4 border-white shadow-lg`}
                    />
                  ) : (
                    <div className={`w-24 h-24 lg:w-32 lg:h-32 ${formData.isCompany ? 'rounded-lg' : 'rounded-full'} bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center`}>
                      <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {formData.isCompany ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        )}
                      </svg>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="text-center">
                    <input
                      type="file"
                      id="companyLogoUpload"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="companyLogoUpload"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Changer le logo
                    </label>
                    {formData.companyLogoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Informations de base - Particulier */}
            {!formData.isCompany && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Informations personnelles</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
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
                        className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
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
                        className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
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
                        className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
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
            )}

            {/* Informations de base - Entreprise */}
            {formData.isCompany && (
              <>
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Informations de l'entreprise</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                          required
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.companyName || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forme juridique</label>
                      {isEditing ? (
                        <select 
                          name="legalForm"
                          value={formData.legalForm}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        >
                          <option>SARL</option>
                          <option>SA</option>
                          <option>SAS</option>
                          <option>EURL</option>
                          <option>SNC</option>
                          <option>Entreprise individuelle</option>
                          <option>GIE</option>
                          <option>Coopérative</option>
                          <option>Association</option>
                          <option>ONG</option>
                          <option>Autre</option>
                        </select>
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.legalForm || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro d'entreprise</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="companyNumber"
                          value={formData.companyNumber}
                          onChange={handleInputChange}
                          placeholder="CI-ABJ-2024-B-001234"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.companyNumber || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité</label>
                      {isEditing ? (
                        <select 
                          name="sector"
                          value={formData.sector}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        >
                          <option>Transport de personnes</option>
                          <option>Transport de marchandises</option>
                          <option>Livraison</option>
                          <option>Logistique</option>
                          <option>Commerce</option>
                          <option>Agriculture</option>
                          <option>BTP</option>
                          <option>Industrie</option>
                          <option>Services</option>
                          <option>Santé</option>
                          <option>Éducation</option>
                          <option>Tourisme</option>
                          <option>Autre</option>
                        </select>
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.sector || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact entreprise */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Informations de contact</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email principal *</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="companyEmail"
                          value={formData.companyEmail}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                          required
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.companyEmail || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="companyPhone"
                          value={formData.companyPhone}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                          required
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.companyPhone || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du contact</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          placeholder="Kouadio Koffi"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.contactName || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fonction du contact</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contactFunction"
                          value={formData.contactFunction}
                          onChange={handleInputChange}
                          placeholder="Directeur RH"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.contactFunction || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adresse entreprise */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Adresse de l'entreprise</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Cocody, Riviera Golf, Rue des Jardins"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                          required
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.address || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Boîte postale</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="01 BP 1234 Abidjan 01"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.postalCode || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Abidjan"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                          required
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.city || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                      {isEditing ? (
                        <select 
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        >
                          <option>Côte d'Ivoire</option>
                          <option>Ghana</option>
                          <option>Burkina Faso</option>
                          <option>Mali</option>
                          <option>Guinée</option>
                          <option>Liberia</option>
                          <option>Sénégal</option>
                          <option>France</option>
                          <option>Autre</option>
                        </select>
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.country || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zone d'activité principale</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="activityZone"
                          value={formData.activityZone}
                          onChange={handleInputChange}
                          placeholder="District d'Abidjan"
                          className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                        />
                      ) : (
                        <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base">
                          {formData.activityZone || 'Non renseigné'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description entreprise */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Description de l'entreprise</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Présentation</label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Décrivez votre entreprise, vos activités principales, vos valeurs..."
                        className="w-full p-2 lg:p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base"
                      />
                    ) : (
                      <div className="w-full p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm lg:text-base min-h-[100px]">
                        {formData.description || 'Non renseigné'}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions en mode édition */}
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
              className="w-full lg:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
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
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-base font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier le profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
