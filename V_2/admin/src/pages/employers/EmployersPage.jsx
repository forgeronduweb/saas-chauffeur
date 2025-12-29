import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createEmployerColumns } from './columns'

const EmployersPage = () => {
  const navigate = useNavigate()
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployers()
  }, [])

  const fetchEmployers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminEmployers({})
      setEmployers(response.data.employers || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des employeurs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (employerId, isActive) => {
    try {
      await apiService.updateEmployerStatus(employerId, { isActive })
      toast.success(`Employeur ${isActive ? 'réactivé' : 'suspendu'} avec succès`)
      fetchEmployers()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Entreprise', 'Statut', 'Date inscription']
      const rows = employers.map(employer => [
        employer.lastName || '',
        employer.firstName || '',
        employer.email || '',
        employer.phone || '',
        employer.companyName || '',
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

  const columns = useMemo(
    () => createEmployerColumns(navigate, handleStatusUpdate),
    [navigate]
  )

  const stats = useMemo(() => ({
    total: employers.length,
    active: employers.filter(e => e.isActive).length,
    suspended: employers.filter(e => !e.isActive).length,
  }), [employers])

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
            data={employers}
            searchKey="email"
            searchPlaceholder="Rechercher par email..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={employers.length === 0}>
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

export default EmployersPage
