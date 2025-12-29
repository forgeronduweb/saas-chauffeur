import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createDriverColumns } from './columns'

const DriversPage = () => {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminDrivers({})
      setDrivers(response.data.drivers)
    } catch (error) {
      toast.error('Erreur lors du chargement des chauffeurs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (driverId, status, reason = '') => {
    try {
      await apiService.updateDriverStatus(driverId, { status, reason })
      const messages = {
        approved: 'approuvé',
        rejected: 'rejeté',
        suspended: 'suspendu'
      }
      toast.success(`Chauffeur ${messages[status] || status} avec succès`)
      fetchDrivers()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Véhicule', 'Expérience', 'Date inscription']
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
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
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

  const columns = useMemo(
    () => createDriverColumns(navigate, handleStatusUpdate),
    [navigate]
  )

  const stats = useMemo(() => ({
    total: drivers.length,
    pending: drivers.filter(d => d.status === 'pending').length,
    approved: drivers.filter(d => d.status === 'approved').length,
    rejected: drivers.filter(d => d.status === 'rejected').length,
  }), [drivers])

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
            data={drivers}
            searchKey="email"
            searchPlaceholder="Rechercher par email..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={drivers.length === 0}>
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

export default DriversPage
