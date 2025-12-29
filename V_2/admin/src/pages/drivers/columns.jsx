import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

const getStatusBadge = (status) => {
  const badges = {
    pending: { variant: 'secondary', icon: Clock, text: 'En attente' },
    approved: { variant: 'default', icon: CheckCircle, text: 'Approuvé' },
    rejected: { variant: 'secondary', icon: XCircle, text: 'Rejeté' },
    suspended: { variant: 'secondary', icon: AlertTriangle, text: 'Suspendu' }
  }
  
  const badge = badges[status] || badges.pending
  const Icon = badge.icon
  
  return (
    <Badge variant={badge.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {badge.text}
    </Badge>
  )
}

export const createDriverColumns = (navigate, onStatusUpdate) => [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
  },
  {
    id: "vehicle",
    header: "Véhicule",
    cell: ({ row }) => {
      const driver = row.original
      return (
        <div className="text-sm">
          {driver.vehicleBrand} {driver.vehicleModel}
        </div>
      )
    },
  },
  {
    accessorKey: "experience",
    header: "Expérience",
    cell: ({ row }) => `${row.getValue("experience") || 0} ans`,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inscription" />
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('fr-FR'),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const driver = row.original
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/drivers/${driver._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {driver.status === 'pending' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onStatusUpdate(driver._id, 'approved')}
              >
                Approuver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(driver._id, 'rejected')}
              >
                Rejeter
              </Button>
            </>
          )}
          {driver.status === 'approved' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(driver._id, 'suspended')}
            >
              Suspendre
            </Button>
          )}
          {driver.status === 'suspended' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onStatusUpdate(driver._id, 'approved')}
            >
              Réactiver
            </Button>
          )}
        </div>
      )
    },
  },
]
