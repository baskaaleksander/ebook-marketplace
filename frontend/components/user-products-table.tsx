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

function UserProductsTable({ products }: { products: Product[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  
  const columnHelper = createColumnHelper<Product>()
  
  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <Link href={`/product/${info.row.original.id}`}>{info.getValue()}</Link>,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => `$${info.getValue().toFixed(2)}`,
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
      cell: info => <Link href={`/product/${info.row.original.id}/delete`} className="text-red-600 hover:text-red-800">Delete</Link>,
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
    </>
  )
}

export default UserProductsTable