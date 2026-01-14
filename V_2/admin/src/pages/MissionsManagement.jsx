import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { MapPin, Calendar, DollarSign, User, Clock, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const MissionsManagement = () => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})
  const [selectedMission, setSelectedMission] = useState(null)

  useEffect(() => {
    fetchMissions()
  }, [filters])

  const fetchMissions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMissions()
      setMissions(response.data || [])
      setPagination({ total: response.data?.length || 0 })
    } catch (error) {
      toast.error('Erreur lors du chargement des missions')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Titre', 'Type', 'Montant', 'Statut', 'Paiement', 'Date début', 'Date fin']
      
      const rows = missions.map(mission => [
        mission.title || '',
        mission.type || '',
        `${mission.payment?.amount || 0}€`,
        mission.status || '',
        mission.payment?.status || '',
        new Date(mission.startDate).toLocaleDateString(),
        mission.endDate ? new Date(mission.endDate).toLocaleDateString() : 'En cours'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `missions_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'En attente' },
      active: { color: 'bg-gray-100 text-gray-700', icon: AlertTriangle, text: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle, text: 'Terminée' },
      cancelled: { color: 'bg-gray-100 text-gray-600', icon: XCircle, text: 'Annulée' }
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

  const getPaymentStatusBadge = (paymentStatus) => {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-700', text: 'En attente' },
      paid: { color: 'bg-gray-100 text-gray-700', text: 'Payé' },
      cancelled: { color: 'bg-gray-100 text-gray-600', text: 'Annulé' }
    }
    
    const badge = badges[paymentStatus] || badges.pending
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const MissionModal = ({ mission, onClose }) => {
    if (!mission) return null

    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded border border-gray-200 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Détails de la Mission</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* En-tête de la mission */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{mission.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(mission.status)}
                  {getPaymentStatusBadge(mission.payment?.status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Créée le</p>
                <p className="font-medium">{new Date(mission.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Description */}
            {mission.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{mission.description}</p>
              </div>
            )}

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informations générales</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> {mission.type}</p>
                  <p><span className="font-medium">Date de début:</span> {new Date(mission.startDate).toLocaleDateString()}</p>
                  {mission.endDate && (
                    <p><span className="font-medium">Date de fin:</span> {new Date(mission.endDate).toLocaleDateString()}</p>
                  )}
                  {mission.schedule && (
                    <p><span className="font-medium">Horaires:</span> {mission.schedule}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Paiement</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Montant:</span> {mission.payment?.amount}€</p>
                  <p><span className="font-medium">Type:</span> {mission.payment?.type}</p>
                  <p><span className="font-medium">Statut:</span> {getPaymentStatusBadge(mission.payment?.status)}</p>
                  {mission.payment?.paidAt && (
                    <p><span className="font-medium">Payé le:</span> {new Date(mission.payment.paidAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Localisation */}
            {(mission.location?.startAddress || mission.location?.endAddress) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localisation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mission.location.startAddress && (
                    <p><span className="font-medium">Départ:</span> {mission.location.startAddress}</p>
                  )}
                  {mission.location.endAddress && (
                    <p><span className="font-medium">Arrivée:</span> {mission.location.endAddress}</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            {mission.contact && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mission.contact.name && (
                    <p><span className="font-medium">Nom:</span> {mission.contact.name}</p>
                  )}
                  {mission.contact.phone && (
                    <p><span className="font-medium">Téléphone:</span> {mission.contact.phone}</p>
                  )}
                  {mission.contact.email && (
                    <p><span className="font-medium">Email:</span> {mission.contact.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Évaluations */}
            {(mission.rating?.driverRating || mission.rating?.employerRating) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Évaluations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mission.rating.driverRating && (
                    <div>
                      <p className="font-medium">Note du chauffeur: {mission.rating.driverRating}/5</p>
                      {mission.rating.driverComment && (
                        <p className="text-sm text-gray-600 mt-1">"{mission.rating.driverComment}"</p>
                      )}
                    </div>
                  )}
                  {mission.rating.employerRating && (
                    <div>
                      <p className="font-medium">Note de l'employeur: {mission.rating.employerRating}/5</p>
                      {mission.rating.employerComment && (
                        <p className="text-sm text-gray-600 mt-1">"{mission.rating.employerComment}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {mission.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{mission.notes}</p>
              </div>
            )}

            {/* Dates importantes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {mission.completedAt && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">Terminée le</p>
                  <p className="font-medium">{new Date(mission.completedAt).toLocaleDateString()}</p>
                </div>
              )}
              {mission.cancelledAt && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">Annulée le</p>
                  <p className="font-medium">{new Date(mission.cancelledAt).toLocaleDateString()}</p>
                </div>
              )}
              {mission.cancelReason && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">Raison d'annulation</p>
                  <p className="font-medium text-red-600">{mission.cancelReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filtrer les missions par recherche
  const filteredMissions = missions.filter(mission => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return mission.title?.toLowerCase().includes(searchLower) ||
           mission.type?.toLowerCase().includes(searchLower) ||
           mission.location?.startAddress?.toLowerCase().includes(searchLower)
  })

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-lg font-medium text-gray-900">{missions.length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">En attente:</span>
            <span className="text-lg font-medium text-gray-700">{missions.filter(m => m.status === 'pending').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Actives:</span>
            <span className="text-lg font-medium text-gray-700">{missions.filter(m => m.status === 'active').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Terminées:</span>
            <span className="text-lg font-medium text-gray-600">{missions.filter(m => m.status === 'completed').length}</span>
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
              placeholder="Rechercher par titre, type ou adresse..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
            />
          </div>
          
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Statut:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="active">Active</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>
          </div>
          
          {/* Bouton Export */}
          <button
            onClick={exportToCSV}
            disabled={missions.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Missions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune mission trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
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
                {filteredMissions.map((mission) => (
                  <tr key={mission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {mission.title}
                        </div>
                        {mission.location?.startAddress && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {mission.location.startAddress}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {mission.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {mission.payment?.amount || 0}€
                      </div>
                      <div className="text-xs text-gray-500">{mission.payment?.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(mission.payment?.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mission.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedMission(mission)}
                        className="text-gray-700 hover:text-orange-700"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMission && (
        <MissionModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  )
}

export default MissionsManagement
