import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header'

export const createEmployerColumns = (navigate, onStatusUpdate) => [
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
    accessorKey: "companyName",
    header: "Entreprise",
    cell: ({ row }) => row.getValue("companyName") || "-",
  },
  {
    accessorKey: "isActive",
    header: "Statut",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Actif</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Suspendu</>
          )}
        </Badge>
      )
    },
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
      const employer = row.original
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/employers/${employer._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {employer.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(employer._id, false)}
            >
              Suspendre
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onStatusUpdate(employer._id, true)}
            >
              Réactiver
            </Button>
          )}
        </div>
      )
    },
  },
]
