import { Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

const getStatusBadge = (status) => {
  const badges = {
    draft: { variant: 'secondary', text: 'Brouillon' },
    active: { variant: 'default', text: 'Active' },
    paused: { variant: 'secondary', text: 'En pause' },
    closed: { variant: 'secondary', text: 'Fermée' },
    completed: { variant: 'secondary', text: 'Terminée' }
  }
  
  const badge = badges[status] || badges.draft
  return <Badge variant={badge.variant}>{badge.text}</Badge>
}

export const createOfferColumns = (navigate) => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
  },
  {
    id: "employer",
    header: "Employeur",
    cell: ({ row }) => {
      const offer = row.original
      return (
        <div className="text-sm">
          {offer.employerId?.firstName} {offer.employerId?.lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "location",
    header: "Ville",
    cell: ({ row }) => row.original.location?.city || "-",
  },
  {
    id: "salary",
    header: "Salaire",
    cell: ({ row }) => {
      const offer = row.original
      return `${offer.conditions?.salary || 0}€`
    },
  },
  {
    accessorKey: "applicationCount",
    header: "Candidatures",
    cell: ({ row }) => row.getValue("applicationCount") || 0,
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
      const offer = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/offers/${offer._id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  },
]
