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

/**
 * UserProductsTable displays a sortable, interactive table of user's products
 * Provides functionality for viewing, editing, deleting and featuring products
 * Implements client-side sorting and optimistic UI updates
 * 
 * @param {Object} props - Component props
 * @param {Product[]} props.products - Array of product objects to display
 */
function UserProductsTable({ products }: { products: Product[] }) {
  // Table state management
  const [sorting, setSorting] = useState<SortingState>([]) // Controls table sorting state
  const [tableProducts, setTableProducts] = useState<Product[]>(products) // Local table data state
  
  // Dialog visibility state
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Controls delete confirmation dialog
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false) // Controls feature product dialog
  
  // Product action state
  const [deletedProductId, setDeletedProductId] = useState<string | null>(null) // Tracks product being deleted
  const [productToFeature, setProductToFeature] = useState<Product | null>(null) // Tracks product being featured
  const [featureLoading, setFeatureLoading] = useState(false) // Controls feature button loading state

  // Constants for product featuring
  const FEATURE_COST = 15.00; // Price for featuring a product
  const FEATURE_CURRENCY = "PLN"; // Currency for featuring cost

  /**
   * Initiates product deletion process
   * Opens confirmation dialog and sets the product ID for deletion
   * 
   * @param {string} productId - ID of product to delete
   */
  const handleDelete = async (productId: string) => {
    setIsDialogOpen(true)
    setDeletedProductId(productId)
  }
  
  /**
   * Initiates product featuring process
   * Opens feature dialog if product isn't already featured
   * 
   * @param {Product} product - Product object to feature
   */
  const handleFeature = async (product: Product) => {
    // Skip if product is already featured
    if (product.isFeatured) return;
    
    setProductToFeature(product);
    setIsFeatureDialogOpen(true);
  }
  
  /**
   * Handles feature payment confirmation
   * Creates Stripe checkout session and redirects to payment page
   * Manages loading state during API call
   */
  const handleFeatureConfirm = async () => {
    if (!productToFeature) return;
    
    try {
      // Set loading state while processing
      setFeatureLoading(true);
      
      // Create Stripe checkout session for feature payment
      const response = await api.post(`/stripe/checkout-featuring/${productToFeature.id}/`, {time: 30});
      
      // Redirect to Stripe checkout if URL is returned
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
  
  // Create column helper for type safety with Product interface
  const columnHelper = createColumnHelper<Product>()
  
  /**
   * Define table columns with sorting, formatting and click handlers
   * Uses memoization to prevent unnecessary re-renders
   */
  const columns = useMemo(() => [
    // Title column with link to product detail
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <Link href={`/product/${info.row.original.id}`}>{info.getValue()}</Link>,
    }),
    // Price column with currency formatting
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => `${info.getValue().toFixed(2)}PLN`,
    }),
    // Date column with formatting and special sort function
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
      sortingFn: 'datetime',
    }),
    // View count column
    columnHelper.accessor('views', {
      header: 'Views',
      cell: info => info.getValue(),
    }),
    // Featured status column with interactive button
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
    // Edit link column
    columnHelper.display({
      id: 'modify',
      header: 'Modify',
      cell: info => <Link href={`/product/${info.row.original.id}/modify`} className="text-blue-600 hover:text-blue-800">Edit</Link>,
    }),
    // Delete button column
    columnHelper.display({
      id: 'delete',
      header: 'Delete',
      cell: info => <Button variant='destructive' onClick={() => handleDelete(info.row.original.id)}>Delete</Button>,
    }),
  ], [columnHelper])

  /**
   * Configure the table instance with sorting and data
   * Uses TanStack Table (React Table) for features like sorting and row model generation
   */
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
      {/* Main product table */}
      <Table>
        <TableCaption>All your products</TableCaption>
        <TableHeader>
          {/* Map header groups to rows */}
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {/* Map headers to cells with sort indicators */}
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                  <div className="flex items-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Conditional sort direction indicators */}
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
          {/* Map rows to table rows */}
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {/* Map cells to table cells with rendered content */}
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Delete confirmation dialog component */}
      <DeleteDialog 
        isDialogOpen={isDialogOpen} 
        setIsDialogOpen={setIsDialogOpen} 
        productId={deletedProductId!}
        onProductDeleted={() => {
          // Optimistically remove deleted product from UI
          setTableProducts(prev => prev.filter(p => p.id !== deletedProductId))
        }}
      />
      
      {/* Feature product dialog */}
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
          
          {/* Product and cost information */}
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
          
          {/* Dialog action buttons */}
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

/**
 * DeleteDialog component handles product deletion confirmation
 * Provides a modal dialog with confirmation and handles the API call
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.isDialogOpen - Whether the dialog is currently visible
 * @param {Function} props.setIsDialogOpen - Function to control dialog visibility
 * @param {string} props.productId - ID of the product to delete
 * @param {Function} props.onProductDeleted - Callback for successful deletion
 */
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
  /**
   * Performs the actual product deletion via API
   * Calls success callback when deletion completes
   * 
   * @param {string} productId - ID of product to delete
   */
  const handleDelete = async (productId: string) => {
    try {
      // API call to delete the product
      await api.delete(`/listing/${productId}`)
      
      // Trigger callback for parent component to update UI
      onProductDeleted()
    }
    catch (err) {
      console.error("Error deleting product:", err)
    }
    finally {
      // Always close the dialog when operation completes
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