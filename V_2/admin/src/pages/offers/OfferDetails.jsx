import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Flag, Briefcase, MapPin, DollarSign, Calendar, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiService } from '../../services/api'
import Breadcrumb from '../../components/common/Breadcrumb'

const OfferDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchOffer()
  }, [id])

  const fetchOffer = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminOffer(id)
      setOffer(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'offre')
      navigate('/offers')
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (action) => {
    try {
      setActionLoading(true)
      await apiService.moderateOffer(id, { action, reason })
      toast.success(`Offre ${action === 'approve' ? 'approuvée' : action === 'reject' ? 'rejetée' : 'signalée'} avec succès`)
      navigate('/offers')
    } catch (error) {
      toast.error('Erreur lors de la modération')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Brouillon' },
      active: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Active' },
      paused: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'En pause' },
      closed: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Fermée' },
      completed: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Terminée' }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`inline-flex items-center px-3 py-1 border-2 text-sm font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!offer) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Tableau de bord', path: '/dashboard' },
        { label: 'Offres', path: '/offers' },
        { label: offer?.title || 'Détails de l\'offre' }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Détails de l'Offre</h1>
          <p className="text-sm text-gray-600 mt-1">
            Modération et validation
          </p>
        </div>
        {getStatusBadge(offer.status)}
      </div>

      {/* Offer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{offer.title}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{offer.type || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{offer.location?.city || offer.location?.address || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <span>{offer.salary ? `${offer.salary} FCFA` : 'Non spécifié'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{offer.description || 'Aucune description'}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informations Complémentaires</h3>
            
            <div className="space-y-3">
              {offer.workType && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type de travail</div>
                    <div className="text-gray-900">{offer.workType}</div>
                  </div>
                </div>
              )}

              {offer.requirements && typeof offer.requirements === 'string' && (
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Exigences</div>
                    <div className="text-gray-900">{offer.requirements}</div>
                  </div>
                </div>
              )}

              {offer.benefits && typeof offer.benefits === 'string' && (
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Avantages</div>
                    <div className="text-gray-900">{offer.benefits}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employer Info */}
          {offer.employerId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Employeur</h3>
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-900">{offer.employerId.firstName} {offer.employerId.lastName}</div>
                  <div className="text-sm text-gray-600">{offer.employerId.email}</div>
                  {offer.employerId.phone && (
                    <div className="text-sm text-gray-600">{offer.employerId.phone}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Moderation Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Actions de Modération</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => handleModeration('approve')}
                disabled={actionLoading || offer.status === 'active'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approuver</span>
              </button>

              <button
                onClick={() => handleModeration('reject')}
                disabled={actionLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                <span>Rejeter</span>
              </button>

              <button
                onClick={() => handleModeration('flag')}
                disabled={actionLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <Flag className="w-5 h-5" />
                <span>Signaler</span>
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-2">
                Raison (optionnel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="Expliquez la raison de votre décision..."
              />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Statistiques</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Candidatures</span>
                <span className="text-lg text-gray-900">{offer.applicationsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vues</span>
                <span className="text-lg text-gray-900">{offer.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Créée le</span>
                <span className="text-sm text-gray-900">
                  {new Date(offer.createdAt).toLocaleDateString()}
                </span>
              </div>
              {offer.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Modifiée le</span>
                  <span className="text-sm text-gray-900">
                    {new Date(offer.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferDetails
