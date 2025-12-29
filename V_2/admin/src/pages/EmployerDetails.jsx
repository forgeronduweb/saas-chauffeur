import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { User, Building, Mail, Phone, Calendar, CheckCircle, XCircle, FileText, Bell, ArrowLeft, Shield, ShieldAlert, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

const EmployerDetails = () => {
  const { employerId } = useParams()
  const navigate = useNavigate()
  const [employer, setEmployer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: ''
  })
  const [verificationIssues, setVerificationIssues] = useState({
    personalInfo: false,
    company: false,
    documents: false
  })
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueData, setIssueData] = useState({
    section: '',
    description: ''
  })

  useEffect(() => {
    fetchEmployerDetails()
  }, [employerId])

  const fetchEmployerDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminEmployers({ search: '' })
      const foundEmployer = response.data.employers.find(e => e._id === employerId)
      if (foundEmployer) {
        setEmployer(foundEmployer)
      } else {
        toast.error('Employeur non trouvé')
        navigate('/employers')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
      navigate('/employers')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (isActive) => {
    try {
      setActionLoading(true)
      await apiService.updateEmployerStatus(employer._id, { isActive })
      toast.success(`Employeur ${isActive ? 'activé' : 'suspendu'} avec succès`)
      fetchEmployerDetails()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      setActionLoading(true)
      // API à implémenter côté serveur
      toast.success('Notification envoyée avec succès')
      setShowNotificationForm(false)
      setNotificationData({ title: '', message: '' })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la notification')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReportIssue = async () => {
    if (!issueData.section || !issueData.description) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      setActionLoading(true)
      setVerificationIssues(prev => ({ ...prev, [issueData.section]: true }))
      toast.success('L\'employeur a été notifié du problème')
      setShowIssueForm(false)
      setIssueData({ section: '', description: '' })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkAsVerified = (section) => {
    setVerificationIssues(prev => ({ ...prev, [section]: false }))
    toast.success('Section marquée comme vérifiée')
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </>
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1" />
            Suspendu
          </>
        )}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!employer) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 font-medium">
        <button 
          onClick={() => navigate('/employers')}
          className="hover:text-gray-700"
        >
          Employeurs
        </button>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.784 15.68 11.46 4.13h1.75L8.534 15.68z" fill="#CBD5E1"/>
        </svg>
        <span className="text-orange-500">{employer.firstName} {employer.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employer.firstName} {employer.lastName}
          </h1>
          <p className="text-gray-600">{employer.email}</p>
        </div>
        {getStatusBadge(employer.isActive)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Personnelles
                {verificationIssues.personalInfo && (
                  <ShieldAlert className="w-5 h-5 text-red-500" title="Problème signalé" />
                )}
              </h2>
              <div className="flex gap-2">
                {!verificationIssues.personalInfo ? (
                  <button
                    onClick={() => {
                      setIssueData({ section: 'personalInfo', description: '' })
                      setShowIssueForm(true)
                    }}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    Signaler un problème
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsVerified('personalInfo')}
                    className="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200 flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Marquer comme vérifié
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nom complet</p>
                <p className="text-gray-900">{employer.firstName} {employer.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-900">{employer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-gray-900">{employer.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date d'inscription</p>
                <p className="text-gray-900">{new Date(employer.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Entreprise
                {verificationIssues.company && (
                  <ShieldAlert className="w-5 h-5 text-red-500" title="Problème signalé" />
                )}
              </h2>
              <div className="flex gap-2">
                {!verificationIssues.company ? (
                  <button
                    onClick={() => {
                      setIssueData({ section: 'company', description: '' })
                      setShowIssueForm(true)
                    }}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    Signaler un problème
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsVerified('company')}
                    className="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200 flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Marquer comme vérifié
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-gray-900">{employer.companyName ? 'Entreprise' : 'Particulier'}</p>
              </div>
              {employer.companyName && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nom de l'entreprise</p>
                    <p className="text-gray-900">{employer.companyName}</p>
                  </div>
                  {employer.siret && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">SIRET</p>
                      <p className="text-gray-900">{employer.siret}</p>
                    </div>
                  )}
                  {employer.companyAddress && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Adresse</p>
                      <p className="text-gray-900">{employer.companyAddress}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Documents - CNI et documents d'entreprise */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents Officiels
                {verificationIssues.documents && (
                  <ShieldAlert className="w-5 h-5 text-red-500" title="Problème signalé" />
                )}
              </h2>
              <div className="flex gap-2">
                {!verificationIssues.documents ? (
                  <button
                    onClick={() => {
                      setIssueData({ section: 'documents', description: '' })
                      setShowIssueForm(true)
                    }}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    Signaler un problème
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsVerified('documents')}
                    className="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200 flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Marquer comme vérifié
                  </button>
                )}
              </div>
            </div>
            
            {employer.documents && Object.keys(employer.documents).some(key => employer.documents[key]) ? (
              <div className="space-y-6">
                {/* CNI / Carte d'identité */}
                {(employer.documents.idCard || employer.documents.idCardFront || employer.documents.idCardBack) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🪪 Carte Nationale d'Identité</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employer.documents.idCardFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Recto</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.idCardFront} 
                              alt="CNI recto" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.idCardFront, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {employer.documents.idCardBack && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Verso</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.idCardBack} 
                              alt="CNI verso" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.idCardBack, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {employer.documents.idCard && !employer.documents.idCardFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Photo</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.idCard} 
                              alt="CNI" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.idCard, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents d'entreprise */}
                {(employer.documents.kbis || employer.documents.companyRegistration || employer.documents.businessLicense) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🏢 Documents d'Entreprise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employer.documents.kbis && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">KBIS</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.kbis} 
                              alt="KBIS" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.kbis, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {employer.documents.companyRegistration && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Registre de Commerce</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.companyRegistration} 
                              alt="Registre" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.companyRegistration, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {employer.documents.businessLicense && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Licence d'Exploitation</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={employer.documents.businessLicense} 
                              alt="Licence" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(employer.documents.businessLicense, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Autres documents */}
                {Object.entries(employer.documents).filter(([key]) => 
                  !['idCardFront', 'idCardBack', 'idCard', 'kbis', 'companyRegistration', 'businessLicense'].includes(key)
                ).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">📎 {key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-2">
                          <img 
                            src={value} 
                            alt={key} 
                            className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(value, '_blank')}
                          />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Aucun document uploadé</p>
                <p className="text-sm mt-1">L'employeur n'a pas encore téléchargé ses documents</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{employer.totalOffers || 0}</p>
                <p className="text-sm text-gray-600">Offres publiées</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <User className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-2xl font-bold">{employer.totalHires || 0}</p>
                <p className="text-sm text-gray-600">Chauffeurs recrutés</p>
              </div>
            </div>
          </div>

          {/* Signaler un problème */}
          {showIssueForm && (
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Signaler un problème</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section concernée
                  </label>
                  <select
                    value={issueData.section}
                    onChange={(e) => setIssueData({ ...issueData, section: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:border-red-500 focus:outline-none text-gray-900"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="personalInfo">Informations personnelles</option>
                    <option value="company">Entreprise</option>
                    <option value="documents">Documents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du problème
                  </label>
                  <textarea
                    value={issueData.description}
                    onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:border-red-500 focus:outline-none text-gray-900"
                    rows="4"
                    placeholder="Décrivez le problème détecté..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReportIssue}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Envoi...' : 'Notifier l\'employeur'}
                  </button>
                  <button
                    onClick={() => {
                      setShowIssueForm(false)
                      setIssueData({ section: '', description: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Envoyer une notification */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Communication</h2>
            <button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Bell className="w-4 h-4" />
              {showNotificationForm ? 'Annuler' : 'Envoyer une notification'}
            </button>

            {showNotificationForm && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="Ex: Mise à jour importante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={notificationData.message}
                    onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900"
                    rows="4"
                    placeholder="Votre message..."
                  />
                </div>
                <button
                  onClick={handleSendNotification}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            {employer.isActive ? (
              <button
                onClick={() => handleStatusUpdate(false)}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Suspendre le compte
              </button>
            ) : (
              <button
                onClick={() => handleStatusUpdate(true)}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Activer le compte
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployerDetails
