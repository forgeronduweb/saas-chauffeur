import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, Clock, User, FileText, Image, Power, XCircle, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const OfferDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOfferDetails()
  }, [id])

  const fetchOfferDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminOffer(id)
      if (response.data) {
        setOffer(response.data.offer || response.data)
      } else {
        toast.error('Offre non trouvée')
        navigate('/offers')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      navigate('/offers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true)
      await apiService.updateOfferStatus(id, newStatus)
      
      setOffer(prev => ({ ...prev, status: newStatus }))
      
      const statusMessages = {
        active: 'Offre activée avec succès',
        paused: 'Offre mise en pause',
        closed: 'Offre fermée',
        draft: 'Offre mise en brouillon'
      }
      
      toast.success(statusMessages[newStatus] || 'Statut mis à jour')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) {
      return
    }
    
    try {
      setActionLoading(true)
      await apiService.deleteOffer(id)
      toast.success('Offre supprimée avec succès')
      navigate('/offers')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      active: { variant: 'default', text: 'Active' },
      paused: { variant: 'secondary', text: 'En pause' },
      closed: { variant: 'outline', text: 'Fermée' },
      draft: { variant: 'secondary', text: 'Brouillon' },
      completed: { variant: 'default', text: 'Terminée' }
    }
    const { variant, text } = config[status] || config.draft
    return <Badge variant={variant}>{text}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!offer) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/offers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <p className="text-lg font-medium text-gray-900">{offer.title}</p>
        </div>
        {getStatusBadge(offer.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <Badge variant="outline">{offer.type || '-'}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Catégorie</p>
                <p className="text-sm font-medium">{offer.category || '-'}</p>
              </div>
            </div>
            {offer.description && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Description</p>
                <div className="p-4 bg-gray-50 rounded-md text-sm">
                  {offer.description}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Nom</p>
              <p className="text-sm font-medium">
                {offer.employerId?.firstName} {offer.employerId?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{offer.employerId?.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Entreprise</p>
              <p className="text-sm">{offer.employerId?.companyName || '-'}</p>
            </div>
            {offer.employerId?._id && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/employers/${offer.employerId._id}`)}
              >
                Voir le profil
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localisation et conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Ville</p>
                <p className="text-sm font-medium">{offer.location?.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p className="text-sm">{offer.location?.address || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Salaire</p>
                <p className="text-sm font-medium">
                  {(offer.conditions?.salary || 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type de contrat</p>
                <p className="text-sm">{offer.conditions?.contractType || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates et statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates & Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Publiée le</p>
                <p className="text-sm font-medium">
                  {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expire le</p>
                <p className="text-sm">
                  {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Candidatures</p>
                <p className="text-sm font-medium">{offer.applicationCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vues</p>
                <p className="text-sm">{offer.viewCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exigences */}
      {offer.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exigences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {offer.requirements.licenseType && (
                <Badge variant="outline">Permis: {offer.requirements.licenseType}</Badge>
              )}
              {offer.requirements.experience && (
                <Badge variant="outline">{offer.requirements.experience} ans d'expérience</Badge>
              )}
              {offer.requirements.vehicleType && (
                <Badge variant="outline">Véhicule: {offer.requirements.vehicleType}</Badge>
              )}
              {offer.requirements.languages?.map((lang, i) => (
                <Badge key={i} variant="secondary">{lang}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {offer.images && offer.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Images ({offer.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {offer.images.map((image, index) => {
                const img = typeof image === 'object' ? (image.url || image.path || image.src) : image
                const imageUrl = img ? (
                  img.startsWith('data:image/') ? img :
                  img.startsWith('http') ? img : 
                  img.startsWith('/') ? `${API_URL}${img}` :
                  `${API_URL}/uploads/${img}`
                ) : ''
                
                return (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border bg-gray-100"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f3f4f6" width="300" height="200"/><text fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image non disponible</text></svg>'
                      }}
                    />
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white text-sm">Voir en grand</span>
                    </a>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions administratives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Actions administratives
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          {/* Activer/Désactiver */}
          {offer.status === 'active' ? (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus('paused')} 
              disabled={actionLoading}
            >
              <Power className="h-4 w-4 mr-2" />
              Désactiver
            </Button>
          ) : offer.status !== 'closed' && (
            <Button 
              onClick={() => handleUpdateStatus('active')} 
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activer
            </Button>
          )}
          
          {/* Fermer */}
          {offer.status !== 'closed' && (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus('closed')} 
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Fermer
            </Button>
          )}
          
          {/* Réactiver si fermée */}
          {offer.status === 'closed' && (
            <Button 
              onClick={() => handleUpdateStatus('active')} 
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Réactiver
            </Button>
          )}
          
          {/* Supprimer */}
          <Button 
            variant="outline" 
            onClick={handleDelete} 
            disabled={actionLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default OfferDetailsPage
