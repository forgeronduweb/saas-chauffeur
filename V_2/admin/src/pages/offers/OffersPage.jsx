import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createOfferColumns } from './columns'

const OffersPage = () => {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAdminOffers({})
      setOffers(response.data.offers || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des offres')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Titre', 'Employeur', 'Type', 'Ville', 'Salaire', 'Statut', 'Date']
      const rows = offers.map(offer => [
        offer.title || '',
        `${offer.employerId?.firstName || ''} ${offer.employerId?.lastName || ''}`.trim(),
        offer.type || '',
        offer.location?.city || '',
        `${offer.conditions?.salary || 0}€`,
        offer.status || '',
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

  const columns = useMemo(() => createOfferColumns(navigate), [navigate])

  const stats = useMemo(() => ({
    total: offers.length,
    active: offers.filter(o => o.status === 'active').length,
    paused: offers.filter(o => o.status === 'paused').length,
    closed: offers.filter(o => o.status === 'closed').length,
  }), [offers])

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
            data={offers}
            searchKey="title"
            searchPlaceholder="Rechercher par titre..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={offers.length === 0}>
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

export default OffersPage
