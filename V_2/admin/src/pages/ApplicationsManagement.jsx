import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { FileText, User, Briefcase, MapPin, Calendar, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/common/Breadcrumb'

const ApplicationsManagement = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchApplications()
  }, [filters])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminApplications(filters)
      setApplications(response.data.applications)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erreur lors du chargement des candidatures')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Chauffeur', 'Email', 'Offre', 'Type', 'Statut', 'Date']
      
      const rows = applications.map(app => [
        `${app.driverId?.firstName || ''} ${app.driverId?.lastName || ''}`.trim(),
        app.driverId?.email || '',
        app.offerId?.title || '',
        app.offerId?.type || '',
        app.status || '',
        new Date(app.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'En attente' },
      accepted: { color: 'bg-gray-100 text-gray-700', icon: CheckCircle, text: 'Acceptée' },
      rejected: { color: 'bg-gray-100 text-gray-600', icon: XCircle, text: 'Rejetée' }
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
        { label: 'Gestion des Candidatures' }
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
            <span className="text-lg font-medium text-gray-700">{applications.filter(a => a.status === 'pending').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Acceptées:</span>
            <span className="text-lg font-medium text-gray-700">{applications.filter(a => a.status === 'accepted').length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rejetées:</span>
            <span className="text-lg font-medium text-red-600">{applications.filter(a => a.status === 'rejected').length}</span>
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
              placeholder="Rechercher par chauffeur ou offre..."
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
              <option value="accepted">Acceptées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>

          {/* Bouton Export */}
          <button
            onClick={exportToCSV}
            disabled={applications.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune candidature trouvée</p>
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
                    Offre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.driverId?.firstName} {application.driverId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{application.driverId?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {application.offerId?.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {application.offerId?.location?.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.offerId?.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/applications/${application._id}`)}
                        className="px-3 py-1.5 text-gray-700 hover:bg-orange-50 rounded text-xs font-medium"
                      >
                        Détails
                      </button>
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
              Page {pagination.page} sur {pagination.pages} ({pagination.total} candidatures)
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

export default ApplicationsManagement
