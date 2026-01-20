import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Briefcase, MapPin, DollarSign, Calendar, Eye, Download, Clock, Power, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/common/Breadcrumb'

const OffersModeration = () => {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    flagged: '',
    category: 'job', // 'job', 'marketing'
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchOffers()
  }, [filters])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminOffers(filters)
      setOffers(response.data.offers)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erreur lors du chargement des offres')
    } finally {
      setLoading(false)
    }
  }


  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      active: { color: 'bg-gray-100 text-gray-700', text: 'Active' },
      paused: { color: 'bg-gray-100 text-gray-800', text: 'En pause' },
      closed: { color: 'bg-gray-100 text-gray-600', text: 'Fermée' },
      completed: { color: 'bg-gray-100 text-gray-800', text: 'Terminée' }
    }
    
    const badge = badges[status] || badges.draft
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getWorkTypeBadge = (workType) => {
    const badges = {
      temps_plein: { color: 'bg-gray-100 text-gray-700', text: 'Temps plein' },
      temps_partiel: { color: 'bg-gray-100 text-gray-800', text: 'Temps partiel' },
      ponctuel: { color: 'bg-gray-100 text-gray-700', text: 'Ponctuel' },
      weekend: { color: 'bg-gray-100 text-gray-800', text: 'Weekend' }
    }
    
    const badge = badges[workType] || { color: 'bg-gray-100 text-gray-800', text: workType }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }


  const exportToCSV = () => {
    try {
      const headers = ['Titre', 'Employeur', 'Type', 'Ville', 'Salaire', 'Statut', 'Candidatures', 'Date']
      
      const rows = offers.map(offer => [
        offer.title || '',
        `${offer.employerId?.firstName || ''} ${offer.employerId?.lastName || ''}`.trim(),
        offer.type || '',
        offer.location?.city || '',
        `${offer.conditions?.salary || 0}€`,
        offer.status || '',
        offer.applicationCount || 0,
        new Date(offer.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `offres_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    try {
      const response = await apiService.updateOfferStatus(offerId, newStatus)
      
      // Mettre à jour l'offre localement
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer._id === offerId 
            ? { ...offer, status: newStatus }
            : offer
        )
      )
      
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
    }
  }

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) {
      return
    }
    
    try {
      await apiService.deleteOffer(offerId)
      
      // Retirer l'offre de la liste
      setOffers(prevOffers => prevOffers.filter(offer => offer._id !== offerId))
      
      toast.success('Offre supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de l\'offre')
    }
  }

  const getActionButtons = (offer) => {
    const isActive = offer.status === 'active'
    const isPaused = offer.status === 'paused'
    const isClosed = offer.status === 'closed'
    
    return (
      <div className="flex flex-col gap-2">
        {/* Voir détails */}
        <button
          onClick={() => navigate(`/offers/${offer._id}`)}
          className="text-gray-600 hover:text-gray-800 text-left"
        >
          Voir détails
        </button>
        
        {/* Actions selon le statut */}
        {isActive && (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateOfferStatus(offer._id, 'paused')}
              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs"
            >
              Désactiver
            </button>
            <button
              onClick={() => handleUpdateOfferStatus(offer._id, 'closed')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
            >
              Fermer
            </button>
          </div>
        )}
        
        {isPaused && (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateOfferStatus(offer._id, 'active')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
            >
              Activer
            </button>
            <button
              onClick={() => handleUpdateOfferStatus(offer._id, 'closed')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
            >
              Fermer
            </button>
          </div>
        )}
        
        {isClosed && (
          <button
            onClick={() => handleUpdateOfferStatus(offer._id, 'active')}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs text-left"
          >
            Réactiver
          </button>
        )}
        
        {/* Supprimer */}
        <button
          onClick={() => handleDeleteOffer(offer._id)}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs text-left"
        >
          Supprimer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Tableau de bord', path: '/dashboard' },
        { label: 'Modération des Offres' }
      ]} />

      {/* Menu déroulant */}
      <div className="flex items-center justify-end">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none text-sm text-gray-900 cursor-pointer"
        >
          <option value="job">Offres d'emploi</option>
          <option value="marketing">Offres marketing</option>
        </select>
      </div>

      {/* Statistiques rapides */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-lg font-medium text-gray-900">{pagination.total || 0}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Actives:</span>
            <span className="text-lg font-medium text-gray-700">{offers.filter(o => o.status === 'active').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">En pause:</span>
            <span className="text-lg font-medium text-gray-700">{offers.filter(o => o.status === 'paused').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Signalées:</span>
            <span className="text-lg font-medium text-gray-700">{offers.filter(o => o.isFlagged).length}</span>
          </div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre, employeur ou ville..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-3 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="active">Active</option>
            <option value="paused">En pause</option>
            <option value="closed">Fermée</option>
            <option value="completed">Terminée</option>
          </select>
          
          <select
            value={filters.flagged}
            onChange={(e) => setFilters({ ...filters, flagged: e.target.value, page: 1 })}
            className="px-3 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
          >
            <option value="">Toutes les offres</option>
            <option value="true">Signalées uniquement</option>
            <option value="false">Non signalées</option>
          </select>
          
          {/* Bouton Export */}
          <button
            onClick={exportToCSV}
            disabled={offers.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune offre trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Salaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidatures
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {offer.isFlagged && <Flag className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {offer.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {offer.location?.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.employerId?.firstName} {offer.employerId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{offer.employerId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.type}</div>
                      <div className="text-sm text-gray-500">
                        {offer.conditions?.salary}€ / {offer.conditions?.salaryType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-medium text-gray-700">
                        {offer.applicationCount || 0}
                      </span>
                      <div className="text-xs text-gray-500">
                        / {offer.maxApplications}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getActionButtons(offer)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.current} sur {pagination.pages} ({pagination.total} offres)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default OffersModeration
