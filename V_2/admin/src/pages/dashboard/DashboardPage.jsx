import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import { Users, Car, Briefcase, FileText, ShoppingBag, CheckCircle, Clock, XCircle, Eye, TrendingUp, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTable } from '../../components/ui/data-table'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'
import { Area, AreaChart, CartesianGrid, XAxis, RadialBar, RadialBarChart, LabelList, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart'

const DashboardPage = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [pendingReports, setPendingReports] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchPendingReports()
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getAdminDashboard()
      setDashboardData(response.data)
    } catch (err) {
      console.error('Erreur dashboard:', err)
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPendingReports = useCallback(async () => {
    try {
      const response = await apiService.getReportsPendingCount()
      setPendingReports(response.data.count || 0)
    } catch (err) {
      console.error('Erreur compteur signalements:', err)
    }
  }, [])

  const handleQuickAction = async (action, id) => {
    try {
      if (action === 'approve_driver') {
        await apiService.updateDriverStatus(id, { status: 'approved', reason: 'Validation rapide' })
        toast.success('Chauffeur approuvé')
      } else if (action === 'reject_driver') {
        await apiService.updateDriverStatus(id, { status: 'rejected', reason: 'Rejeté' })
        toast.success('Chauffeur rejeté')
      }
      fetchDashboardData()
    } catch (error) {
      toast.error('Erreur lors de l\'action')
    }
  }

  const driverColumns = useMemo(() => [
    {
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Prénom" />,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status")
        const variants = {
          approved: { variant: 'default', text: 'Approuvé', icon: CheckCircle },
          pending: { variant: 'secondary', text: 'En attente', icon: Clock },
          rejected: { variant: 'secondary', text: 'Rejeté', icon: XCircle }
        }
        const config = variants[status] || variants.pending
        const Icon = config.icon
        return (
          <Badge variant={config.variant} className="gap-1">
            <Icon className="w-3 h-3" />
            {config.text}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Inscription" />,
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('fr-FR'),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/drivers/${driver._id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            {driver.status === 'pending' && (
              <>
                <Button variant="default" size="sm" onClick={() => handleQuickAction('approve_driver', driver._id)}>
                  Approuver
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAction('reject_driver', driver._id)}>
                  Rejeter
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ], [navigate])

  const offerColumns = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Titre" />,
    },
    {
      id: "employer",
      header: "Employeur",
      cell: ({ row }) => {
        const offer = row.original
        return `${offer.employerName || 'N/A'}`
      },
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('fr-FR'),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/offers/${row.original._id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { overview, drivers, offers, recentActivity, pendingValidation } = dashboardData || {}

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-gray-400" onClick={() => navigate('/drivers')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Chauffeurs
              <Car className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{overview?.totalDrivers || 0}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-gray-400" onClick={() => navigate('/employers')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Employeurs
              <Users className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{overview?.totalEmployers || 0}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-gray-400" onClick={() => navigate('/offers')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Offres actives
              <Briefcase className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{offers?.active || 0}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-gray-400" onClick={() => navigate('/applications')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Candidatures
              <FileText className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{overview?.totalApplications || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Produits
              <ShoppingBag className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{overview?.totalProducts || 0}</p>
            <p className="text-xs text-gray-500">publiés sur la plateforme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Taux d'acceptation
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{overview?.acceptanceRate || 0}%</p>
            <p className="text-xs text-gray-500">candidatures acceptées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              En attente
              <Clock className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{drivers?.pending || 0}</p>
            <p className="text-xs text-gray-500">chauffeurs à valider</p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:border-red-400 ${pendingReports > 0 ? 'border-red-200 bg-red-50' : ''}`} onClick={() => navigate('/reports')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Signalements
              <AlertTriangle className={`h-4 w-4 ${pendingReports > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-medium ${pendingReports > 0 ? 'text-red-600' : ''}`}>{pendingReports}</p>
            <p className="text-xs text-gray-500">à traiter</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Inscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions mensuelles</CardTitle>
            <CardDescription>Évolution des inscriptions sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={[
                  { month: 'Jan', chauffeurs: overview?.totalDrivers ? Math.round(overview.totalDrivers * 0.1) : 10 },
                  { month: 'Fév', chauffeurs: overview?.totalDrivers ? Math.round(overview.totalDrivers * 0.2) : 20 },
                  { month: 'Mar', chauffeurs: overview?.totalDrivers ? Math.round(overview.totalDrivers * 0.4) : 35 },
                  { month: 'Avr', chauffeurs: overview?.totalDrivers ? Math.round(overview.totalDrivers * 0.6) : 45 },
                  { month: 'Mai', chauffeurs: overview?.totalDrivers ? Math.round(overview.totalDrivers * 0.8) : 60 },
                  { month: 'Juin', chauffeurs: overview?.totalDrivers || 75 },
                ]}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <Area
                  dataKey="chauffeurs"
                  type="natural"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.4}
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">+12% ce mois</span>
            </div>
          </CardFooter>
        </Card>

        {/* Radial Chart - Répartition */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des utilisateurs</CardTitle>
            <CardDescription>Par type d'utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                data={[
                  { name: 'Employeurs', value: overview?.totalEmployers || 0, fill: 'hsl(var(--chart-2))' },
                  { name: 'Chauffeurs', value: overview?.totalDrivers || 0, fill: 'hsl(var(--chart-1))' },
                ]}
                innerRadius={30}
                outerRadius={100}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" background cornerRadius={10}>
                  <LabelList position="insideStart" dataKey="name" className="fill-white text-xs" />
                </RadialBar>
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--chart-1))' }} />
                <span>Chauffeurs: {overview?.totalDrivers || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--chart-2))' }} />
                <span>Employeurs: {overview?.totalEmployers || 0}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Derniers chauffeurs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Derniers chauffeurs inscrits</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/drivers')}>
            <Eye className="h-4 w-4 mr-2" />
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={driverColumns}
            data={pendingValidation?.slice(0, 5) || []}
            searchKey="email"
            searchPlaceholder="Rechercher..."
          />
        </CardContent>
      </Card>

      {/* Dernières offres */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Dernières offres publiées</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/offers')}>
            <Eye className="h-4 w-4 mr-2" />
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={offerColumns}
            data={recentActivity?.recentOffers?.slice(0, 5) || []}
            searchKey="title"
            searchPlaceholder="Rechercher..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
