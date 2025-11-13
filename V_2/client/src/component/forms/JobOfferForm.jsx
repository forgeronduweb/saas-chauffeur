import { useState } from 'react';

export default function JobOfferForm({ onSubmit, loading, error, initialData }) {
  const defaultData = {
    title: '',
    description: '',
    type: 'Personnel',
    
    requirements: {
      licenseType: 'B',
      experience: '1-3 ans',
      vehicleType: 'berline',
      zone: ''
    },
    
    conditions: {
      salary: '',
      salaryType: 'mensuel',
      workType: 'temps_plein',
      startDate: '',
      schedule: ''
    },
    
    location: {
      address: '',
      city: 'Abidjan'
    },
    
    contactInfo: {
      phone: '',
      email: '',
      preferredContact: 'platform'
    },
    
    requirementsList: [],
    benefits: []
  };

  const [formData, setFormData] = useState({
    ...defaultData,
    ...initialData,
    requirements: {
      ...defaultData.requirements,
      ...(initialData?.requirements || {})
    },
    conditions: {
      ...defaultData.conditions,
      ...(initialData?.conditions || {})
    },
    location: {
      ...defaultData.location,
      ...(initialData?.location || {})
    },
    contactInfo: {
      ...defaultData.contactInfo,
      ...(initialData?.contactInfo || {})
    },
    requirementsList: initialData?.requirementsList || [],
    benefits: initialData?.benefits || []
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (ex: requirements.licenseType)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirementsList: [...prev.requirementsList, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
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
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg ${
                currentStep >= step 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
                  currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 sm:mt-3 text-xs lg:text-sm text-gray-600">
          <span>Informations</span>
          <span>Exigences</span>
          <span>Conditions</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm lg:text-lg text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Step 1: Informations générales */}
        {currentStep === 1 && (
          <>
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Titre du poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Chauffeur personnel, Chauffeur VIP..."
              />
            </div>

            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Description du poste <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Décrivez les responsabilités et missions du poste..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Type d'offre <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="Personnel">Chauffeur personnel</option>
                  <option value="Livraison">Livraison</option>
                  <option value="VTC">VTC / Taxi</option>
                  <option value="Transport">Transport (Poids lourd, Marchandises)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Sélectionnez le type d'emploi correspondant à votre besoin
                </p>
              </div>

              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Type de travail <span className="text-red-500">*</span>
                </label>
                <select
                  name="conditions.workType"
                  value={formData.conditions.workType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="temps_plein">Temps plein</option>
                  <option value="temps_partiel">Temps partiel</option>
                  <option value="ponctuel">Ponctuel</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: Cocody, Plateau..."
                />
              </div>

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
            </div>
          </>
        )}

        {/* Step 2: Exigences */}
        {currentStep === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Permis requis <span className="text-red-500">*</span>
                </label>
                <select
                  name="requirements.licenseType"
                  value={formData.requirements.licenseType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="A">Permis A (Moto)</option>
                  <option value="B">Permis B (Voiture)</option>
                  <option value="C">Permis C (Poids lourd)</option>
                  <option value="D">Permis D (Transport en commun)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Expérience requise <span className="text-red-500">*</span>
                </label>
                <select
                  name="requirements.experience"
                  value={formData.requirements.experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">Sélectionnez</option>
                  <option value="Débutant">Débutant (moins d'1 an)</option>
                  <option value="1-3 ans">1 à 3 ans</option>
                  <option value="3-5 ans">3 à 5 ans</option>
                  <option value="5+ ans">Plus de 5 ans</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Type de véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="requirements.vehicleType"
                value={formData.requirements.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Sélectionnez</option>
                <option value="berline">Berline</option>
                <option value="suv">4x4 / SUV</option>
                <option value="utilitaire">Utilitaire</option>
                <option value="moto">Moto</option>
                <option value="van">Minibus / Van</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Zone de travail <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="requirements.zone"
                value={formData.requirements.zone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Cocody, Plateau, Yopougon..."
              />
            </div>

            {/* Profil recherché (Liste) */}
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Profil recherché (Exigences détaillées)
              </label>
              <p className="text-xs lg:text-sm text-gray-500 mb-2">
                Ajoutez les compétences et qualités requises pour le poste
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: Excellente connaissance d'Abidjan"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.requirementsList.length > 0 && (
                <ul className="space-y-2">
                  {formData.requirementsList.map((req, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700 flex-1">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-1 text-red-500 hover:bg-red-50 transition-colors"
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
          </>
        )}

        {/* Step 3: Conditions */}
        {currentStep === 3 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Salaire (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="conditions.salary"
                  value={formData.conditions.salary}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: 150000"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Type de salaire <span className="text-red-500">*</span>
                </label>
                <select
                  name="conditions.salaryType"
                  value={formData.conditions.salaryType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="horaire">Horaire</option>
                  <option value="journalier">Journalier</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="mission">Par mission</option>
                </select>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="conditions.startDate"
                  value={formData.conditions.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                  Horaires
                </label>
                <input
                  type="text"
                  name="conditions.schedule"
                  value={formData.conditions.schedule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: 8h-17h, Lundi-Vendredi"
                />
              </div>
            </div>

            {/* Avantages (Liste) */}
            <div>
              <label className="block text-sm lg:text-lg text-gray-700 mb-2">
                Avantages du poste
              </label>
              <p className="text-xs lg:text-sm text-gray-500 mb-2">
                Ajoutez les avantages offerts avec ce poste
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Ex: Assurance santé, Véhicule de fonction"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.benefits.length > 0 && (
                <ul className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-200">
                      <span className="text-sm text-gray-700 flex-1">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="p-1 text-red-500 hover:bg-red-50 transition-colors"
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
          
          {currentStep < 3 ? (
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
                  Publier l'offre
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
