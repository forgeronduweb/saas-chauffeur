import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { User, Car, FileText, Calendar, MapPin, Star, CheckCircle, XCircle, Clock, AlertTriangle, Bell, ArrowLeft, Shield, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

const DriverDetails = () => {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: ''
  })
  const [reason, setReason] = useState('')
  const [verificationIssues, setVerificationIssues] = useState({
    personalInfo: false,
    license: false,
    vehicle: false,
    documents: false
  })
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueData, setIssueData] = useState({
    section: '',
    description: ''
  })

  useEffect(() => {
    fetchDriverDetails()
  }, [driverId])

  const fetchDriverDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminDrivers({ search: '', status: '' })
      const foundDriver = response.data.drivers.find(d => d._id === driverId)
      if (foundDriver) {
        setDriver(foundDriver)
      } else {
        toast.error('Chauffeur non trouvé')
        navigate('/drivers')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
      navigate('/drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status, reason = '') => {
    try {
      setActionLoading(true)
      await apiService.updateDriverStatus(driver._id, { status, reason })
      toast.success(`Chauffeur ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'rejeté' : 'mis à jour'} avec succès`)
      fetchDriverDetails()
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
      await apiService.sendNotificationToDriver(driver._id, notificationData)
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
      // Envoyer une notification au chauffeur pour corriger les informations
      await apiService.sendNotificationToDriver(driver._id, {
        title: '⚠️ Vérification de vos informations',
        message: `Nous avons détecté un problème avec votre ${issueData.section}. ${issueData.description}. Merci de corriger ces informations dans votre profil.`,
        type: 'admin_message'
      })
      
      // Marquer la section comme ayant un problème
      setVerificationIssues(prev => ({ ...prev, [issueData.section]: true }))
      
      toast.success('Le chauffeur a été notifié du problème')
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approuvé' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejeté' },
      suspended: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, text: 'Suspendu' }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
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

  if (!driver) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 font-medium">
        <button 
          onClick={() => navigate('/drivers')}
          className="hover:text-gray-700"
        >
          Chauffeurs
        </button>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.784 15.68 11.46 4.13h1.75L8.534 15.68z" fill="#CBD5E1"/>
        </svg>
        <span className="text-orange-500">{driver.firstName} {driver.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {driver.firstName} {driver.lastName}
          </h1>
          <p className="text-gray-600">{driver.email}</p>
        </div>
        {getStatusBadge(driver.status)}
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
                <p className="text-gray-900">{driver.firstName} {driver.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-900">{driver.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-gray-900">{driver.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date d'inscription</p>
                <p className="text-gray-900">{new Date(driver.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Permis de conduire */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Permis de Conduire
                {verificationIssues.license && (
                  <ShieldAlert className="w-5 h-5 text-red-500" title="Problème signalé" />
                )}
              </h2>
              <div className="flex gap-2">
                {!verificationIssues.license ? (
                  <button
                    onClick={() => {
                      setIssueData({ section: 'license', description: '' })
                      setShowIssueForm(true)
                    }}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    Signaler un problème
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsVerified('license')}
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
                <p className="text-xs text-gray-500 mb-1">Type de permis</p>
                <p className="text-gray-900">{driver.licenseType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Numéro</p>
                <p className="text-gray-900">{driver.licenseNumber || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date d'obtention</p>
                <p className="text-gray-900">{new Date(driver.licenseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Carte VTC</p>
                <p className="text-gray-900">{driver.vtcCard || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Expérience</p>
                <p className="text-gray-900">{driver.experience}</p>
              </div>
            </div>
          </div>

          {/* Véhicule */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Car className="w-5 h-5" />
                Véhicule
                {verificationIssues.vehicle && (
                  <ShieldAlert className="w-5 h-5 text-red-500" title="Problème signalé" />
                )}
              </h2>
              <div className="flex gap-2">
                {!verificationIssues.vehicle ? (
                  <button
                    onClick={() => {
                      setIssueData({ section: 'vehicle', description: '' })
                      setShowIssueForm(true)
                    }}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                  >
                    Signaler un problème
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsVerified('vehicle')}
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
                <p className="text-gray-900 capitalize">{driver.vehicleType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Marque & Modèle</p>
                <p className="text-gray-900">{driver.vehicleBrand} {driver.vehicleModel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Année</p>
                <p className="text-gray-900">{driver.vehicleYear}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Places</p>
                <p className="text-gray-900">{driver.vehicleSeats} places</p>
              </div>
            </div>
          </div>

          {/* Zone de travail */}
          {driver.workZone && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Zone de Travail
              </h2>
              <p className="text-gray-900">{driver.workZone}</p>
            </div>
          )}

          {/* Spécialités */}
          {driver.specialties && driver.specialties.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {driver.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {specialty.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents - Photos du Permis et CNI */}
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
            
            {driver.documents && Object.keys(driver.documents).some(key => driver.documents[key]) ? (
              <div className="space-y-6">
                {/* Permis de conduire */}
                {(driver.documents.licensePhoto || driver.documents.licenseFront || driver.documents.licenseBack) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">📄 Permis de Conduire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {driver.documents.licenseFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Recto</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.licenseFront} 
                              alt="Permis recto" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.licenseFront, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {driver.documents.licenseBack && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Verso</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.licenseBack} 
                              alt="Permis verso" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.licenseBack, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {driver.documents.licensePhoto && !driver.documents.licenseFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Photo</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.licensePhoto} 
                              alt="Permis" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.licensePhoto, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CNI / Carte d'identité */}
                {(driver.documents.idCard || driver.documents.idCardFront || driver.documents.idCardBack) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🪪 Carte Nationale d'Identité</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {driver.documents.idCardFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Recto</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.idCardFront} 
                              alt="CNI recto" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.idCardFront, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {driver.documents.idCardBack && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Verso</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.idCardBack} 
                              alt="CNI verso" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.idCardBack, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {driver.documents.idCard && !driver.documents.idCardFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-600">Photo</p>
                          </div>
                          <div className="p-2">
                            <img 
                              src={driver.documents.idCard} 
                              alt="CNI" 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(driver.documents.idCard, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Autres documents */}
                {Object.entries(driver.documents).filter(([key]) => 
                  !['licenseFront', 'licenseBack', 'licensePhoto', 'idCardFront', 'idCardBack', 'idCard'].includes(key)
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
                <p className="text-sm mt-1">Le chauffeur n'a pas encore téléchargé ses documents</p>
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
                <Star className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{driver.rating || 0}</p>
                <p className="text-sm text-gray-600">Note moyenne</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-2xl font-bold">{driver.totalRides || 0}</p>
                <p className="text-sm text-gray-600">Trajets effectués</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{driver.totalEarnings?.toFixed(2) || 0}€</p>
                <p className="text-sm text-gray-600">Gains totaux</p>
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
                    <option value="license">Permis de conduire</option>
                    <option value="vehicle">Véhicule</option>
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
                    {actionLoading ? 'Envoi...' : 'Notifier le chauffeur'}
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
                    className="w-full p-3 bg-transparent border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900"
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

          {/* Actions de validation */}
          {driver.status === 'pending' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Actions de validation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-gray-900"
                    rows="3"
                    placeholder="Ajoutez un commentaire..."
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleStatusUpdate('approved', reason)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected', reason)}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions pour chauffeurs approuvés */}
          {driver.status === 'approved' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <button
                onClick={() => handleStatusUpdate('suspended', 'Suspendu par admin')}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Suspendre le compte
              </button>
            </div>
          )}

          {/* Actions pour chauffeurs suspendus */}
          {driver.status === 'suspended' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <button
                onClick={() => handleStatusUpdate('approved', 'Réactivé par admin')}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Réactiver le compte
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverDetails
