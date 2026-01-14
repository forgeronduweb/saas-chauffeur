import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { User, Building, Mail, Phone, Calendar, CheckCircle, XCircle, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/common/Breadcrumb'

const EmployersManagement = () => {
  const navigate = useNavigate()
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchEmployers()
  }, [filters])

  const fetchEmployers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminEmployers(filters)
      setEmployers(response.data.employers)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Erreur lors du chargement des employeurs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (employerId, isActive) => {
    try {
      await apiService.updateEmployerStatus(employerId, { isActive })
      toast.success(`Employeur ${isActive ? 'activé' : 'suspendu'} avec succès`)
      fetchEmployers()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Date inscription']
      
      const rows = employers.map(employer => [
        employer.lastName || '',
        employer.firstName || '',
        employer.email || '',
        employer.phone || '',
        employer.isActive ? 'Actif' : 'Suspendu',
        new Date(employer.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `employeurs_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {isActive ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </>
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1" />
            Suspendu
          </>
        )}
      </span>
    )
  }

  /* Modal supprimée - utilisation de la page EmployerDetails à la place */
  
  const EmployerModal_REMOVED = ({ employer, onClose }) => {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg border border-gray-200 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Détails de l'Employeur</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations Personnelles
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nom:</span> {employer.firstName} {employer.lastName}</p>
                  <p><span className="font-medium">Email:</span> {employer.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {employer.phone || 'Non renseigné'}</p>
                  <p><span className="font-medium">Statut:</span> {getStatusBadge(employer.isActive)}</p>
                  <p><span className="font-medium">Inscrit le:</span> {new Date(employer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Entreprise
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> {employer.companyName ? 'Entreprise' : 'Particulier'}</p>
                  {employer.companyName && (
                    <p><span className="font-medium">Nom:</span> {employer.companyName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents - CNI et documents d'entreprise */}
            {employer.documents && Object.keys(employer.documents).some(key => employer.documents[key]) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" />
                  Documents
                </h3>
                <div className="space-y-6">
                  {/* CNI / Carte d'identité */}
                  {(employer.documents.idCard || employer.documents.idCardFront || employer.documents.idCardBack) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">🪪 Carte Nationale d'Identité</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employer.documents.idCardFront && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">Recto</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.idCardFront} 
                                alt="CNI recto" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.idCardFront, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {employer.documents.idCardBack && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">Verso</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.idCardBack} 
                                alt="CNI verso" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.idCardBack, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {employer.documents.idCard && !employer.documents.idCardFront && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">Photo</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.idCard} 
                                alt="CNI" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.idCard, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents d'entreprise */}
                  {(employer.documents.kbis || employer.documents.companyRegistration || employer.documents.businessLicense) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">🏢 Documents d'Entreprise</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employer.documents.kbis && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">KBIS</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.kbis} 
                                alt="KBIS" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.kbis, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {employer.documents.companyRegistration && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">Registre de Commerce</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.companyRegistration} 
                                alt="Registre" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.companyRegistration, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {employer.documents.businessLicense && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <p className="text-xs font-medium text-gray-600">Licence d'Exploitation</p>
                            </div>
                            <div className="p-2">
                              <img 
                                src={employer.documents.businessLicense} 
                                alt="Licence" 
                                className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(employer.documents.businessLicense, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Autres documents */}
                  {Object.entries(employer.documents).filter(([key]) => 
                    !['idCardFront', 'idCardBack', 'idCard', 'kbis', 'companyRegistration', 'businessLicense'].includes(key)
                  ).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">📎 {key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-2">
                            <img 
                              src={value} 
                              alt={key} 
                              className="w-full h-48 object-contain bg-gray-50 rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(value, '_blank')}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              <div className="flex gap-4 justify-end">
                {employer.isActive ? (
                  <button
                    onClick={() => handleStatusUpdate(employer._id, false)}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Suspendre
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(employer._id, true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Tableau de bord', path: '/dashboard' },
        { label: 'Gestion des Employeurs' }
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
            <span className="text-sm text-gray-600">Actifs:</span>
            <span className="text-lg font-medium text-gray-700">{employers.filter(e => e.isActive).length}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Suspendus:</span>
            <span className="text-lg font-medium text-red-600">{employers.filter(e => !e.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Recherche et Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:border-gray-500 focus:outline-none text-gray-900"
            />
          </div>

          <button
            onClick={exportToCSV}
            disabled={employers.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Employers List - Format Table */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liste des Employeurs</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : employers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun employeur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employeur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employers.map((employer) => (
                  <tr key={employer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employer.firstName} {employer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employer.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {employer.phone || 'Non renseigné'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {employer.companyName ? 'Entreprise' : 'Particulier'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(employer.isActive)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(employer.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/employers/${employer._id}`)}
                          className="px-3 py-1.5 text-gray-700 hover:bg-orange-50 rounded text-xs font-medium"
                        >
                          Détails
                        </button>
                        {employer.isActive ? (
                          <button
                            onClick={() => handleStatusUpdate(employer._id, false)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                          >
                            Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(employer._id, true)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-xs font-medium"
                          >
                            Activer
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
              Page {pagination.page} sur {pagination.pages} ({pagination.total} employeurs)
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

export default EmployersManagement
