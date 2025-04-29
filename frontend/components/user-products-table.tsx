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
import { ChevronDown, ChevronUp, Star } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import api from "@/utils/axios"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

function UserProductsTable({ products }: { products: Product[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [deletedProductId, setDeletedProductId] = useState<string | null>(null)
  const [tableProducts, setTableProducts] = useState<Product[]>(products)
  const [productToFeature, setProductToFeature] = useState<Product | null>(null)
  const [featureLoading, setFeatureLoading] = useState(false)

  const FEATURE_COST = 15.00;
  const FEATURE_CURRENCY = "PLN";

  const handleDelete = async (productId: string) => {
    setIsDialogOpen(true)
    setDeletedProductId(productId)
  }
  
  const handleFeature = async (product: Product) => {
    
    if (product.isFeatured) return;
    
    setProductToFeature(product);
    setIsFeatureDialogOpen(true);
   
  }
  
  const handleFeatureConfirm = async () => {
    if (!productToFeature) return;
    
    try {
      setFeatureLoading(true);
      
      const response = await api.post(`/stripe/checkout-featuring/${productToFeature.id}/`, {time: 30});
      
      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (error) {
      console.error("Error initiating feature payment:", error);
    } finally {
      setFeatureLoading(false);
    }
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
    columnHelper.accessor('isFeatured', {
      header: 'Featured',
      cell: info => {
        const product = info.row.original;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={product.isFeatured ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleFeature(product)}
                >
                  <Star className={`h-4 w-4 ${product.isFeatured ? "fill-yellow-400" : ""}`} />
                  {product.isFeatured ? "Featured" : "Feature"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {product.isFeatured 
                  ? `Featured until ${new Date(product.featuredForTime!).toLocaleDateString()}`
                  : "Feature this product to increase visibility"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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
    data: tableProducts,
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
      
      <DeleteDialog 
        isDialogOpen={isDialogOpen} 
        setIsDialogOpen={setIsDialogOpen} 
        productId={deletedProductId!}
        onProductDeleted={() => {
          setTableProducts(prev => prev.filter(p => p.id !== deletedProductId))
        }}
      />
      
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Feature Your Product</DialogTitle>
            <DialogDescription>
              <p className="mb-2">
                Featuring your product will give it special placement and visibility to potential buyers.
              </p>
              <p className="text-sm">
                Your product will be featured for 30 days and will appear at the top of search results and category pages.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center font-medium">
              <span>Product:</span> 
              <span>{productToFeature?.title}</span>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-lg font-bold">
              <span>Cost:</span> 
              <span>{FEATURE_COST.toFixed(2)} {FEATURE_CURRENCY}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFeatureConfirm}
              disabled={featureLoading}
              className="ml-2"
            >
              {featureLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DeleteDialog({ 
  isDialogOpen, 
  setIsDialogOpen, 
  productId,
  onProductDeleted
}: { 
  isDialogOpen: boolean, 
  setIsDialogOpen: (open: boolean) => void, 
  productId: string,
  onProductDeleted: () => void
}) {
  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/listing/${productId}`)
      onProductDeleted()
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