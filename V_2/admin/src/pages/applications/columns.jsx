import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

const getStatusBadge = (status) => {
  const badges = {
    pending: { variant: 'secondary', icon: Clock, text: 'En attente' },
    accepted: { variant: 'default', icon: CheckCircle, text: 'Acceptée' },
    rejected: { variant: 'secondary', icon: XCircle, text: 'Rejetée' }
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

export const createApplicationColumns = (navigate) => [
  {
    id: "driver",
    header: "Chauffeur",
    cell: ({ row }) => {
      const app = row.original
      return (
        <div className="text-sm">
          {app.driverId?.firstName} {app.driverId?.lastName}
        </div>
      )
    },
  },
  {
    id: "driverEmail",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    accessorFn: (row) => row.driverId?.email,
    cell: ({ row }) => row.original.driverId?.email || "-",
  },
  {
    id: "offer",
    header: "Offre",
    cell: ({ row }) => row.original.offerId?.title || "-",
  },
  {
    id: "employer",
    header: "Employeur",
    cell: ({ row }) => {
      const offer = row.original.offerId
      return offer?.employerId ? `${offer.employerId.firstName} ${offer.employerId.lastName}` : "-"
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('fr-FR'),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const application = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/applications/${application._id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  },
]
