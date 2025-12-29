import { Settings2 } from "lucide-react"
import { Button } from "./button"

export function DataTableViewOptions({ table }) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="ml-auto hidden h-8 lg:flex"
        onClick={() => {
          const dropdown = document.getElementById('column-dropdown')
          if (dropdown) {
            dropdown.classList.toggle('hidden')
          }
        }}
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Colonnes
      </Button>
      <div
        id="column-dropdown"
        className="hidden absolute right-0 top-10 z-50 min-w-[150px] rounded-md border bg-white p-1 shadow-md"
      >
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <label
                key={column.id}
                className="flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={(e) => column.toggleVisibility(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="capitalize">{column.id}</span>
              </label>
            )
          })}
      </div>
    </div>
  )
}

export default DataTableViewOptions
