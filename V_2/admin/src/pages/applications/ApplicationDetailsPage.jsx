import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { ArrowLeft, User, Briefcase, Calendar, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

const ApplicationDetailsPage = () => {
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
      const response = await apiService.getAdminApplications({})
      const found = response.data.applications?.find(a => a._id === applicationId)
      if (found) {
        setApplication(found)
      } else {
        toast.error('Candidature non trouvée')
        navigate('/applications')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      navigate('/applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      accepted: { variant: 'default', text: 'Acceptée', icon: CheckCircle },
      pending: { variant: 'secondary', text: 'En attente', icon: Clock },
      rejected: { variant: 'destructive', text: 'Rejetée', icon: XCircle }
    }
    const { variant, text, icon: Icon } = config[status] || config.pending
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!application) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <p className="text-lg font-medium text-gray-900">
            Candidature #{application._id?.slice(-6)}
          </p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chauffeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Nom complet</p>
              <p className="text-sm font-medium">
                {application.driverId?.firstName} {application.driverId?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{application.driverId?.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="text-sm">{application.driverId?.phone || '-'}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/drivers/${application.driverId?._id}`)}
            >
              Voir le profil du chauffeur
            </Button>
          </CardContent>
        </Card>

        {/* Offre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Offre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Titre</p>
              <p className="text-sm font-medium">{application.offerId?.title || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm">{application.offerId?.type || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employeur</p>
              <p className="text-sm">
                {application.offerId?.employerId?.firstName} {application.offerId?.employerId?.lastName}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/offers/${application.offerId?._id}`)}
            >
              Voir l'offre
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Détails de la candidature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Date de candidature</p>
              <p className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(application.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              {getStatusBadge(application.status)}
            </div>
          </div>
          {application.coverLetter && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Lettre de motivation</p>
              <div className="p-4 bg-gray-50 rounded-md text-sm">
                {application.coverLetter}
              </div>
            </div>
          )}
          {application.message && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Message</p>
              <div className="p-4 bg-gray-50 rounded-md text-sm">
                {application.message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ApplicationDetailsPage
