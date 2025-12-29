import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Users, Car, Briefcase, AlertTriangle, Clock, Eye, CheckCircle, XCircle, FileText, ShoppingBag, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  // Fonctionnalités avancées désactivées pour simplifier
  // const [autoRefresh, setAutoRefresh] = useState(true)
  // const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
    // Auto-refresh désactivé pour simplifier
  }, [])

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      } else {
        setRefreshing(true)
      }
      
      const response = await apiService.getAdminDashboard()
      setDashboardData(response.data)
      setLastUpdate(new Date())
      
      if (silent) {
        toast.success('Données mises à jour', { duration: 2000 })
      }
    } catch (err) {
      console.error('Erreur dashboard:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors du chargement du dashboard'
      setError(errorMsg)
      if (silent) {
        toast.error('Erreur de mise à jour')
      } else {
        console.error('Détails erreur:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Actions rapides
  const handleQuickAction = async (action, id) => {
    try {
      switch (action) {
        case 'approve_driver':
          await apiService.updateDriverStatus(id, { status: 'approved', reason: 'Validation rapide depuis le dashboard' })
          toast.success('Chauffeur approuvé')
          fetchDashboardData(true)
          break
        case 'reject_driver':
          await apiService.updateDriverStatus(id, { status: 'rejected', reason: 'Rejeté depuis le dashboard' })
          toast.success('Chauffeur rejeté')
          fetchDashboardData(true)
          break
        default:
          break
      }
    } catch (error) {
      toast.error('Erreur lors de l\'action')
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const { overview, drivers, offers, missions, support, recentActivity, pendingValidation } = dashboardData || {}

  const StatCard = ({ title, value, icon: Icon, onClick }) => (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 ${onClick ? 'cursor-pointer hover:border-gray-400' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-medium text-gray-900">{value?.toLocaleString() || 0}</p>
        </div>
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Chauffeurs"
          value={overview?.totalDrivers}
          icon={Car}
          onClick={() => navigate('/drivers')}
        />
        <StatCard
          title="Total Employeurs"
          value={overview?.totalEmployers || 0}
          icon={Users}
          onClick={() => navigate('/employers')}
        />
        <StatCard
          title="Offres Actives"
          value={offers?.active}
          icon={Briefcase}
          onClick={() => navigate('/offers')}
        />
        <StatCard
          title="Candidatures"
          value={overview?.totalApplications || 0}
          icon={FileText}
          onClick={() => navigate('/applications')}
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Produits/Services</h3>
            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-medium text-gray-900">{overview?.totalProducts || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Publiés sur la plateforme</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Taux d'acceptation</h3>
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-medium text-gray-900">{overview?.acceptanceRate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Candidatures acceptées</p>
        </div>
      </div>

      {/* Alerte simple pour chauffeurs en attente */}
      {drivers?.pending > 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 cursor-pointer" onClick={() => navigate('/drivers?status=pending')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-800">Chauffeurs en attente de validation</h3>
            </div>
            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {drivers.pending}
            </span>
          </div>
        </div>
      )}

      {/* Gestion simplifiée des chauffeurs */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Gestion des Chauffeurs</h3>
          <button 
            onClick={() => navigate('/drivers')}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Voir tous les chauffeurs
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate('/drivers?status=approved')}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Approuvés</span>
            </div>
            <span className="text-xl font-medium text-gray-700">{drivers?.approved || 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate('/drivers?status=pending')}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">En attente</span>
            </div>
            <span className="text-xl font-medium text-gray-700">{drivers?.pending || 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Total</span>
            </div>
            <span className="text-xl font-medium text-gray-700">{overview?.totalDrivers || 0}</span>
          </div>
        </div>
      </div>

      {/* Derniers chauffeurs inscrits - Format Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Derniers Chauffeurs Inscrits</h3>
          <button 
            onClick={() => navigate('/drivers')}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Voir tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chauffeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingValidation?.slice(0, 5).map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-medium flex-shrink-0">
                        {driver.firstName?.[0]}{driver.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</p>
                        <p className="text-sm text-gray-500">{driver.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(driver.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      driver.status === 'approved' ? 'bg-green-100 text-green-700' :
                      driver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {driver.status === 'approved' ? 'Validé' : driver.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {driver.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleQuickAction('approve_driver', driver._id)}
                          className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickAction('reject_driver', driver._id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Aucun chauffeur récent
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dernières offres publiées - Format Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Dernières Offres Publiées</h3>
          <button 
            onClick={() => navigate('/offers')}
            className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Voir tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre de l'offre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de publication
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivity?.recentOffers?.slice(0, 5).map((offer) => (
                <tr key={offer._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{offer.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {offer.employerName || 'Employeur'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      offer.status === 'active' ? 'bg-green-100 text-green-700' :
                      offer.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {offer.status === 'active' ? 'Active' : offer.status === 'expired' ? 'Expirée' : 'En attente'}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Aucune offre récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profils en attente */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Profils en attente</h3>
              <p className="text-sm text-gray-500">Documents à vérifier</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-medium text-gray-900">{drivers?.pending || 0}</span>
            <button
              onClick={() => navigate('/drivers?status=pending')}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"
            >
              Valider maintenant
            </button>
          </div>
        </div>

        {/* Signalements */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Signalements</h3>
              <p className="text-sm text-gray-500">Contenus à modérer</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-medium text-gray-900">{support?.pendingReports || 0}</span>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium"
            >
              Voir les signalements
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
