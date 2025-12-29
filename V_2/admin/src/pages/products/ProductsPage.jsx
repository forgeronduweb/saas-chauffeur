import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createProductColumns } from './columns'
import api from '../../services/api'

const ProductsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/offers', { params: { type: 'marketing' } })
      setProducts(response.data.offers || response.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Titre', 'Catégorie', 'Vendeur', 'Prix', 'État', 'Ville', 'Statut', 'Date']
      const rows = products.map(product => [
        product.title || '',
        product.category || '',
        product.sellerId ? `${product.sellerId.firstName} ${product.sellerId.lastName}` : '',
        `${product.price || 0} FCFA`,
        product.condition === 'new' ? 'Neuf' : 'Occasion',
        product.location?.city || '',
        product.status || '',
        new Date(product.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `produits_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const columns = useMemo(() => createProductColumns(navigate), [navigate])

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    paused: products.filter(p => p.status === 'paused').length,
    sold: products.filter(p => p.status === 'sold').length,
  }), [products])

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
            data={products}
            searchKey="title"
            searchPlaceholder="Rechercher par titre..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={products.length === 0}>
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

export default ProductsPage
