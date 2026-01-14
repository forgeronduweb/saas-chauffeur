import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { User, Car, FileText, Calendar, MapPin, Star, CheckCircle, XCircle, Clock, AlertTriangle, Download, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/common/Breadcrumb'

const DriversValidation = () => {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchDrivers()
  }, [filters])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminDrivers(filters)
      setDrivers(response.data.drivers)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erreur lors du chargement des chauffeurs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (driverId, status, reason = '') => {
    try {
      await apiService.updateDriverStatus(driverId, { status, reason })
      toast.success(`Chauffeur ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`)
      fetchDrivers()
      setSelectedDriver(null)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const exportToCSV = () => {
    try {
      // Créer les en-têtes CSV
      const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Véhicule', 'Expérience', 'Date inscription']
      
      // Créer les lignes de données
      const rows = drivers.map(driver => [
        driver.lastName || '',
        driver.firstName || '',
        driver.email || '',
        driver.phone || '',
        driver.status || '',
        `${driver.vehicleBrand || ''} ${driver.vehicleModel || ''}`.trim(),
        `${driver.experience || 0} ans`,
        new Date(driver.createdAt).toLocaleDateString()
      ])
      
      // Combiner headers et rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Créer et télécharger le fichier
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `chauffeurs_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'En attente' },
      approved: { color: 'bg-gray-200 text-gray-800', icon: CheckCircle, text: 'Approuvé' },
      rejected: { color: 'bg-gray-100 text-gray-600', icon: XCircle, text: 'Rejeté' },
      suspended: { color: 'bg-gray-100 text-gray-600', icon: AlertTriangle, text: 'Suspendu' }
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Tableau de bord', path: '/dashboard' },
        { label: 'Gestion des Chauffeurs' }
      ]} />

      {/* Statistiques rapides */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-lg font-medium text-gray-900">{pagination.total || 0}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">En attente:</span>
            <span className="text-lg font-medium text-gray-700">{drivers.filter(d => d.status === 'pending').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Approuvés:</span>
            <span className="text-lg font-medium text-gray-700">{drivers.filter(d => d.status === 'approved').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rejetés:</span>
            <span className="text-lg font-medium text-gray-700">{drivers.filter(d => d.status === 'rejected').length}</span>
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
              placeholder="Rechercher par nom, email ou téléphone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
            />
          </div>
          
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Statut:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>

          {/* Bouton Export */}
          <button
            onClick={exportToCSV}
            disabled={drivers.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun chauffeur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chauffeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expérience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {driver.vehicleBrand} {driver.vehicleModel}
                      </div>
                      <div className="text-sm text-gray-500">{driver.vehicleType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.experience} ans
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/drivers/${driver._id}`)}
                          className="text-gray-600 hover:text-gray-800 text-left"
                        >
                          Voir détails
                        </button>
                        {driver.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(driver._id, 'approved')}
                              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(driver._id, 'rejected')}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                        {driver.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(driver._id, 'suspended', 'Suspendu par admin')}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs text-left"
                          >
                            Suspendre
                          </button>
                        )}
                        {driver.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusUpdate(driver._id, 'approved', 'Réactivé par admin')}
                            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs text-left"
                          >
                            Réactiver
                          </button>
                        )}
                      </div>
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
              Page {pagination.current} sur {pagination.pages} ({pagination.total} chauffeurs)
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

export default DriversValidation
