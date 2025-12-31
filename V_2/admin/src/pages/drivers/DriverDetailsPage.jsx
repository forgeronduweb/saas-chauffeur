import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { 
  ArrowLeft, User, Car, FileText, Calendar, MapPin, Phone, Mail, Clock, 
  CheckCircle, XCircle, AlertTriangle, Bell, MessageSquare, Activity, 
  Globe, Monitor, LogIn, Ban, RefreshCw, Star, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'

const DriverDetailsPage = () => {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const [driver, setDriver] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [notificationData, setNotificationData] = useState({ title: '', message: '' })
  const [messageData, setMessageData] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchDriverDetails()
  }, [driverId])

  const fetchDriverDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminDriverById(driverId)
      if (response.data) {
        setDriver(response.data.driver)
        setUserInfo(response.data.user)
        setStatistics(response.data.statistics)
        setActivities(response.data.recentActivities || [])
      } else {
        toast.error('Chauffeur non trouvé')
        navigate('/drivers')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
      navigate('/drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true)
      await apiService.updateDriverStatus(driver._id, { status, reason })
      toast.success(`Chauffeur ${status === 'approved' ? 'approuvé' : 'rejeté'}`)
      fetchDriverDetails()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendAccount = async () => {
    if (!suspendReason.trim()) {
      toast.error('Veuillez indiquer une raison de suspension')
      return
    }
    try {
      setActionLoading(true)
      await apiService.suspendAccount(driver.userId, { reason: suspendReason })
      toast.success('Compte suspendu avec succès')
      setShowSuspendForm(false)
      setSuspendReason('')
      fetchDriverDetails()
    } catch (error) {
      toast.error('Erreur lors de la suspension')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateAccount = async () => {
    try {
      setActionLoading(true)
      await apiService.reactivateAccount(driver.userId)
      toast.success('Compte réactivé avec succès')
      fetchDriverDetails()
    } catch (error) {
      toast.error('Erreur lors de la réactivation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageData.trim()) {
      toast.error('Veuillez saisir un message')
      return
    }
    try {
      setActionLoading(true)
      await apiService.sendMessageToUser(driver.userId, { message: messageData })
      toast.success('Message envoyé dans la messagerie')
      setShowMessageForm(false)
      setMessageData('')
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Remplissez tous les champs')
      return
    }
    try {
      setActionLoading(true)
      await apiService.sendNotificationToUser(driver.userId, notificationData)
      toast.success('Notification envoyée')
      setShowNotificationForm(false)
      setNotificationData({ title: '', message: '' })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}min`
    return `${mins} min`
  }

  const formatDateTime = (date) => {
    if (!date) return 'Non disponible'
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const config = {
      approved: { variant: 'default', text: 'Approuvé', icon: CheckCircle },
      pending: { variant: 'secondary', text: 'En attente', icon: Clock },
      rejected: { variant: 'destructive', text: 'Rejeté', icon: XCircle },
      suspended: { variant: 'outline', text: 'Suspendu', icon: AlertTriangle }
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

  if (!driver) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <p className="text-lg font-medium text-gray-900">
            {driver.firstName} {driver.lastName}
          </p>
        </div>
        {getStatusBadge(driver.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <span className="text-sm">{driver.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{driver.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{driver.workZone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Inscrit le {formatDateTime(userInfo?.createdAt || driver.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <LogIn className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Dernière connexion: {formatDateTime(userInfo?.lastLogin)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Temps total: {formatDuration(userInfo?.totalSessionDuration)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{driver.vehicleType || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Marque</p>
                <p className="text-sm font-medium">{driver.vehicleBrand || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Modèle</p>
                <p className="text-sm font-medium">{driver.vehicleModel || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Année</p>
                <p className="text-sm font-medium">{driver.vehicleYear || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Places</p>
                <p className="text-sm font-medium">{driver.vehicleSeats || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Permis</p>
                <p className="text-sm font-medium">{driver.licenseType || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expérience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Expérience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Années d'expérience</p>
              <p className="text-sm font-medium">{driver.experience || 0} ans</p>
            </div>
            {driver.specialties?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Spécialités</p>
                <div className="flex flex-wrap gap-1">
                  {driver.specialties.map((spec, i) => (
                    <Badge key={i} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Disponibilité</p>
              <Badge variant={driver.isAvailable ? 'default' : 'secondary'}>
                {driver.isAvailable ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions de validation */}
      {driver.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions de validation</CardTitle>
            <CardDescription>Approuver ou rejeter ce chauffeur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Raison (optionnel)</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Raison de la décision..."
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={() => handleStatusUpdate('approved')} disabled={actionLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
            <Button variant="outline" onClick={() => handleStatusUpdate('rejected')} disabled={actionLoading}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Actions - Gestion du statut */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Gérer le statut de ce chauffeur</CardDescription>
        </CardHeader>
        <CardFooter className="gap-2 flex-wrap">
          {userInfo?.isActive !== false ? (
            <Button variant="outline" onClick={() => setShowSuspendForm(true)} disabled={actionLoading}>
              <XCircle className="h-4 w-4 mr-2" />
              Suspendre
            </Button>
          ) : (
            <Button onClick={handleReactivateAccount} disabled={actionLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Réactiver
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowMessageForm(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Envoyer un message
          </Button>
          <Button variant="outline" onClick={() => setShowNotificationForm(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Envoyer une notification
          </Button>
        </CardFooter>
      </Card>

      {/* Formulaire suspension */}
      {showSuspendForm && (
        <Card>
          <CardHeader>
            <CardTitle>Suspendre le compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Raison de la suspension (obligatoire)..."
              rows={3}
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="destructive" onClick={handleSuspendAccount} disabled={actionLoading}>
              {actionLoading ? 'Suspension...' : 'Confirmer'}
            </Button>
            <Button variant="ghost" onClick={() => setShowSuspendForm(false)}>Annuler</Button>
          </CardFooter>
        </Card>
      )}

      {/* Formulaire message */}
      {showMessageForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Envoyer un message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={messageData}
              onChange={(e) => setMessageData(e.target.value)}
              placeholder="Votre message (sera envoyé dans la messagerie)..."
              rows={4}
            />
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSendMessage} disabled={actionLoading}>
              {actionLoading ? 'Envoi...' : 'Envoyer'}
            </Button>
            <Button variant="ghost" onClick={() => setShowMessageForm(false)}>Annuler</Button>
          </CardFooter>
        </Card>
      )}

      {/* Notification */}
      {showNotificationForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Envoyer une notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Titre</label>
              <Input
                value={notificationData.title}
                onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                placeholder="Titre de la notification"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Message</label>
              <Textarea
                value={notificationData.message}
                onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                placeholder="Message..."
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSendNotification} disabled={actionLoading}>
              {actionLoading ? 'Envoi...' : 'Envoyer'}
            </Button>
            <Button variant="ghost" onClick={() => setShowNotificationForm(false)}>Annuler</Button>
          </CardFooter>
        </Card>
      )}

      {/* Documents */}
      {driver.documents && Object.keys(driver.documents).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(driver.documents).map(([key, url]) => (
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

      {/* Historique des activités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historique des activités
          </CardTitle>
          <CardDescription>Les dernières actions de ce chauffeur</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activities.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(activity.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="secondary">{activity.activityType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {activity.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune activité enregistrée</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DriverDetailsPage
