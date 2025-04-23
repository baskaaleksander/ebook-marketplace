'use client'
import { Product } from "@/lib/definitions"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import Link from "next/link"
import { useState, useMemo } from "react"
import { 
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import api from "@/utils/axios"

function UserProductsTable({ products }: { products: Product[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletedProductId, setDeletedProductId] = useState<string | null>(null)

  const handleDelete = async (productId: string) => {
    setIsDialogOpen(true)
    setDeletedProductId(productId)
  }
  
  const columnHelper = createColumnHelper<Product>()
  
  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <Link href={`/product/${info.row.original.id}`}>{info.getValue()}</Link>,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => `${info.getValue().toFixed(2)}PLN`,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
      sortingFn: 'datetime',
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'modify',
      header: 'Modify',
      cell: info => <Link href={`/product/${info.row.original.id}/modify`} className="text-blue-600 hover:text-blue-800">Edit</Link>,
    }),
    columnHelper.display({
      id: 'delete',
      header: 'Delete',
      cell: info => <Button variant='destructive' onClick={() => handleDelete(info.row.original.id)}>Delete</Button>,
    }),
  ], [columnHelper])

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <Table>
        <TableCaption>All your products</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                  <div className="flex items-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ChevronUp className="ml-1 h-4 w-4" />,
                      desc: <ChevronDown className="ml-1 h-4 w-4" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} productId={deletedProductId!} />
    </>
  )
}

function DeleteDialog({ isDialogOpen, setIsDialogOpen, productId }: { 
  isDialogOpen: boolean, 
  setIsDialogOpen: (open: boolean) => void, 
  productId: string 
}) {
  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/listing/${productId}`)
    }
    catch (err) {
      console.error("Error deleting product:", err)
    }
    finally {
      setIsDialogOpen(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={() => handleDelete(productId)}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserProductsTable