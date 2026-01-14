import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { User, Briefcase, MapPin, Calendar, CheckCircle, XCircle, Clock, FileText, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/common/Breadcrumb'

const ApplicationDetails = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminApplications({ search: '' })
      const foundApplication = response.data.applications.find(a => a._id === applicationId)
      if (foundApplication) {
        setApplication(foundApplication)
      } else {
        toast.error('Candidature non trouvée')
        navigate('/applications')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
      navigate('/applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'En attente' },
      accepted: { color: 'bg-orange-100 text-orange-800', icon: CheckCircle, text: 'Acceptée' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejetée' }
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

  if (!application) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 font-medium">
        <button 
          onClick={() => navigate('/applications')}
          className="hover:text-gray-700"
        >
          Candidatures
        </button>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.784 15.68 11.46 4.13h1.75L8.534 15.68z" fill="#CBD5E1"/>
        </svg>
        <span className="text-orange-500">
          {application.driverId?.firstName} {application.driverId?.lastName} - {application.offerId?.title}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Détails de la Candidature</h1>
          <p className="text-sm text-gray-600 mt-1">
            Candidature du {new Date(application.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du chauffeur */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              Informations du Chauffeur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nom complet</p>
                <p className="text-gray-900">
                  {application.driverId?.firstName} {application.driverId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {application.driverId?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {application.driverId?.phone || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Expérience</p>
                <p className="text-gray-900">{application.driverId?.experience || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Informations de l'offre */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5" />
              Offre Concernée
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Titre de l'offre</p>
                <p className="text-gray-900 text-lg">{application.offerId?.title}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-gray-900">{application.offerId?.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Localisation</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {application.offerId?.location?.city || 'Non spécifié'}
                  </p>
                </div>
              </div>
              {application.offerId?.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description de l'offre</p>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                    {application.offerId.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lettre de motivation */}
          {application.coverLetter && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                Lettre de Motivation
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statut et dates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Informations</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Statut actuel</p>
                {getStatusBadge(application.status)}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date de candidature</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {application.updatedAt && application.updatedAt !== application.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dernière mise à jour</p>
                  <p className="text-gray-900 text-sm">
                    {new Date(application.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/drivers/${application.driverId?._id}`)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Voir le profil du chauffeur
              </button>
              <button
                onClick={() => navigate(`/offers/${application.offerId?._id}`)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Voir l'offre complète
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails
