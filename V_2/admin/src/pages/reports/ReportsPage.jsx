import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const REASON_LABELS = {
  spam: 'Spam ou publicité',
  inappropriate: 'Contenu inapproprié',
  fraud: 'Fraude ou arnaque',
  misleading: 'Information trompeuse',
  harassment: 'Harcèlement',
  other: 'Autre raison'
}

const TARGET_LABELS = {
  offer: 'Offre d\'emploi',
  product: 'Offre marketing',
  driver: 'Profil chauffeur',
  employer: 'Profil employeur'
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Eye },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  dismissed: { label: 'Rejeté', color: 'bg-gray-100 text-gray-800', icon: XCircle }
}

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [filter, setFilter] = useState({ status: '', targetType: '' })
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [updating, setUpdating] = useState(false)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.current, limit: 20 }
      if (filter.status) params.status = filter.status
      if (filter.targetType) params.targetType = filter.targetType

      const response = await apiService.getReports(params)
      setReports(response.data.reports || [])
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des signalements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [filter, pagination.current])

  const handleUpdateStatus = async (reportId, newStatus, adminNotes = '', action = 'none', warningMessage = '') => {
    try {
      setUpdating(true)
      await apiService.updateReportStatus(reportId, { status: newStatus, adminNotes, action, warningMessage })
      
      const actionMessages = {
        none: 'Signalement mis à jour',
        warn: 'Signalement traité - Avertissement envoyé',
        disable: 'Signalement traité - Contenu suspendu',
        delete: 'Signalement traité - Contenu supprimé'
      }
      toast.success(actionMessages[action] || 'Signalement mis à jour')
      setSelectedReport(null)
      fetchReports()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Sous-titre */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {pagination.total} signalement{pagination.total > 1 ? 's' : ''} au total
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              {pendingCount} en attente
            </span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 bg-transparent border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="reviewed">En cours</option>
          <option value="resolved">Résolu</option>
          <option value="dismissed">Rejeté</option>
        </select>
        <select
          value={filter.targetType}
          onChange={(e) => setFilter({ ...filter, targetType: e.target.value })}
          className="px-3 py-2 bg-transparent border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Tous les types</option>
          <option value="offer">Offres d'emploi</option>
          <option value="product">Offres marketing</option>
          <option value="driver">Profils chauffeurs</option>
          <option value="employer">Profils employeurs</option>
        </select>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun signalement trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signalé par</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => {
                const StatusIcon = STATUS_CONFIG[report.status]?.icon || Clock
                return (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {TARGET_LABELS[report.targetType] || report.targetType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                      {report.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {report.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {report.reporterId?.firstName} {report.reporterId?.lastName}
                      <br />
                      <span className="text-xs text-gray-400">{report.reporterId?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${STATUS_CONFIG[report.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[report.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      >
                        Traiter
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.current} sur {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
              disabled={pagination.current === pagination.pages}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de traitement */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleUpdateStatus}
          updating={updating}
        />
      )}
    </div>
  )
}

function ReportModal({ report, onClose, onUpdate, updating }) {
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '')
  const [action, setAction] = useState('none')
  const [warningMessage, setWarningMessage] = useState('')

  const handleSubmit = (newStatus) => {
    onUpdate(report._id, newStatus, adminNotes, action, warningMessage)
  }

  const getActionOptions = () => {
    if (report.targetType === 'offer' || report.targetType === 'product') {
      return [
        { value: 'none', label: 'Aucune action' },
        { value: 'warn', label: 'Avertir le propriétaire' },
        { value: 'disable', label: 'Suspendre l\'offre' },
        { value: 'delete', label: 'Supprimer l\'offre' }
      ]
    } else if (report.targetType === 'driver') {
      return [
        { value: 'none', label: 'Aucune action' },
        { value: 'warn', label: 'Avertir le chauffeur' },
        { value: 'disable', label: 'Suspendre le compte' }
      ]
    } else if (report.targetType === 'employer') {
      return [
        { value: 'none', label: 'Aucune action' },
        { value: 'warn', label: 'Avertir l\'employeur' },
        { value: 'disable', label: 'Suspendre le compte' }
      ]
    }
    return [{ value: 'none', label: 'Aucune action' }]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Traiter le signalement</h2>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Type de contenu</p>
              <p className="text-sm text-gray-900">{TARGET_LABELS[report.targetType]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Raison</p>
              <p className="text-sm text-gray-900">{REASON_LABELS[report.reason]}</p>
            </div>
          </div>
          
          {report.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{report.description}</p>
            </div>
          )}
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Signalé par</p>
            <p className="text-sm text-gray-900">
              {report.reporterId?.firstName} {report.reporterId?.lastName} ({report.reporterId?.email})
            </p>
          </div>

          {/* Action sur le contenu */}
          <div className="border-t border-gray-200 pt-4">
            <label className="text-xs text-gray-500 mb-2 block font-medium">Action sur le contenu signalé</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {getActionOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Message d'avertissement si action = warn */}
          {action === 'warn' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Message d'avertissement</label>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-transparent border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Message envoyé au propriétaire du contenu..."
              />
            </div>
          )}

          {/* Confirmation pour actions destructives */}
          {(action === 'disable' || action === 'delete') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>⚠️ Attention :</strong> {action === 'delete' ? 'Cette action est irréversible. Le contenu sera définitivement supprimé.' : 'Le contenu sera suspendu et ne sera plus visible.'}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes admin (interne)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-transparent border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Notes internes..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSubmit('resolved')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Résolu
          </button>
          <button
            onClick={() => handleSubmit('dismissed')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 inline mr-1" />
            Rejeter
          </button>
          <button
            onClick={() => handleSubmit('reviewed')}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            En cours
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
