import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

const getStatusBadge = (status) => {
  const badges = {
    pending: { variant: 'secondary', icon: Clock, text: 'En attente' },
    active: { variant: 'default', icon: AlertTriangle, text: 'Active' },
    completed: { variant: 'default', icon: CheckCircle, text: 'Terminée' },
    cancelled: { variant: 'secondary', icon: XCircle, text: 'Annulée' }
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

export const createMissionColumns = (onViewDetails) => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "driver",
    header: "Chauffeur",
    cell: ({ row }) => {
      const mission = row.original
      return mission.driverId ? `${mission.driverId.firstName} ${mission.driverId.lastName}` : "-"
    },
  },
  {
    id: "employer",
    header: "Employeur",
    cell: ({ row }) => {
      const mission = row.original
      return mission.employerId ? `${mission.employerId.firstName} ${mission.employerId.lastName}` : "-"
    },
  },
  {
    id: "amount",
    header: "Montant",
    cell: ({ row }) => `${row.original.payment?.amount || 0}€`,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString('fr-FR'),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const mission = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(mission)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  },
]
