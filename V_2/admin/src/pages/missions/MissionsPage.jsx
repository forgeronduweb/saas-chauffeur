import { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '../../components/ui/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { createMissionColumns } from './columns'

const MissionsPage = () => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMission, setSelectedMission] = useState(null)

  useEffect(() => {
    fetchMissions()
  }, [])

  const fetchMissions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMissions({})
      setMissions(response.data.missions || response.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des missions')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Titre', 'Type', 'Chauffeur', 'Employeur', 'Montant', 'Statut', 'Date']
      const rows = missions.map(mission => [
        mission.title || '',
        mission.type || '',
        mission.driverId ? `${mission.driverId.firstName} ${mission.driverId.lastName}` : '',
        mission.employerId ? `${mission.employerId.firstName} ${mission.employerId.lastName}` : '',
        `${mission.payment?.amount || 0}€`,
        mission.status || '',
        new Date(mission.startDate).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `missions_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Export CSV réussi !')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const columns = useMemo(() => createMissionColumns(setSelectedMission), [])

  const stats = useMemo(() => ({
    total: missions.length,
    pending: missions.filter(m => m.status === 'pending').length,
    active: missions.filter(m => m.status === 'active').length,
    completed: missions.filter(m => m.status === 'completed').length,
  }), [missions])

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
            data={missions}
            searchKey="title"
            searchPlaceholder="Rechercher par titre..."
            actions={
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={exportToCSV} disabled={missions.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            }
          />
        </CardContent>
      </Card>

      {selectedMission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMission(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-medium mb-4">Détails de la mission</h2>
            <div className="space-y-2">
              <p><strong>Titre:</strong> {selectedMission.title}</p>
              <p><strong>Type:</strong> {selectedMission.type}</p>
              <p><strong>Statut:</strong> {selectedMission.status}</p>
              <p><strong>Montant:</strong> {selectedMission.payment?.amount || 0}€</p>
            </div>
            <Button className="mt-4" onClick={() => setSelectedMission(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MissionsPage
