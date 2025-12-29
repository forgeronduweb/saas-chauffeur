import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { ArrowLeft, User, Building, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

const EmployerDetailsPage = () => {
  const { employerId } = useParams()
  const navigate = useNavigate()
  const [employer, setEmployer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchEmployerDetails()
  }, [employerId])

  const fetchEmployerDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminEmployers({})
      const found = response.data.employers?.find(e => e._id === employerId)
      if (found) {
        setEmployer(found)
      } else {
        toast.error('Employeur non trouvé')
        navigate('/employers')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      navigate('/employers')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (isActive) => {
    try {
      setActionLoading(true)
      await apiService.updateEmployerStatus(employer._id, { isActive })
      toast.success(`Employeur ${isActive ? 'réactivé' : 'suspendu'}`)
      fetchEmployerDetails()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!employer) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/employers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <p className="text-lg font-medium text-gray-900">
            {employer.firstName} {employer.lastName}
          </p>
        </div>
        <Badge variant={employer.isActive ? 'default' : 'secondary'}>
          {employer.isActive ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Actif</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Suspendu</>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{employer.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{employer.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Inscrit le {new Date(employer.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Nom de l'entreprise</p>
              <p className="text-sm font-medium">{employer.companyName || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Secteur d'activité</p>
              <p className="text-sm font-medium">{employer.sector || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Adresse</p>
              <p className="text-sm font-medium">{employer.address || 'Non renseigné'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Gérer le statut de cet employeur</CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          {employer.isActive ? (
            <Button variant="outline" onClick={() => handleStatusUpdate(false)} disabled={actionLoading}>
              <XCircle className="h-4 w-4 mr-2" />
              Suspendre
            </Button>
          ) : (
            <Button onClick={() => handleStatusUpdate(true)} disabled={actionLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Réactiver
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Documents */}
      {employer.documents && Object.keys(employer.documents).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(employer.documents).map(([key, url]) => (
                url && (
                  <div key={key} className="border rounded-lg overflow-hidden">
                    <img 
                      src={url} 
                      alt={key}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-80"
                      onClick={() => window.open(url, '_blank')}
                    />
                    <p className="text-xs text-center py-2 bg-gray-50">{key}</p>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EmployerDetailsPage
