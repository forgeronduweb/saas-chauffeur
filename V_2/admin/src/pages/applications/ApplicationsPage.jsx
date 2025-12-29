import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createApplicationColumns } from './columns'

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminApplications({})
      setApplications(response.data.applications || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des candidatures')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Chauffeur', 'Email', 'Offre', 'Statut', 'Date']
      const rows = applications.map(app => [
        `${app.driverId?.firstName || ''} ${app.driverId?.lastName || ''}`.trim(),
        app.driverId?.email || '',
        app.offerId?.title || '',
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

  const columns = useMemo(() => createApplicationColumns(navigate), [navigate])

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }), [applications])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={applications}
            searchKey="driverEmail"
            searchPlaceholder="Rechercher par email..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={applications.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ApplicationsPage
