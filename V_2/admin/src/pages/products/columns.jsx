import { Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

const getStatusBadge = (status) => {
  const badges = {
    active: { variant: 'default', text: 'Actif' },
    paused: { variant: 'secondary', text: 'En pause' },
    sold: { variant: 'secondary', text: 'Vendu' },
    deleted: { variant: 'secondary', text: 'Supprimé' }
  }
  
  const badge = badges[status] || badges.active
  return <Badge variant={badge.variant}>{badge.text}</Badge>
}

export const createProductColumns = (navigate) => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
  },
  {
    accessorKey: "category",
    header: "Catégorie",
  },
  {
    id: "seller",
    header: "Vendeur",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="text-sm">
          {product.sellerId?.firstName} {product.sellerId?.lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix" />
    ),
    cell: ({ row }) => `${row.getValue("price")?.toLocaleString() || 0} FCFA`,
  },
  {
    accessorKey: "condition",
    header: "État",
    cell: ({ row }) => row.getValue("condition") === "new" ? "Neuf" : "Occasion",
  },
  {
    id: "location",
    header: "Ville",
    cell: ({ row }) => row.original.location?.city || "-",
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
      const product = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    },
  },
]
