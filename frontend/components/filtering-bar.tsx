'use client';
import { useFiltering } from "@/providers/filtering-provider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "./ui/checkbox";

/**
 * FilteringBar component provides UI for filtering and sorting products
 * Includes a filter dialog with multiple criteria and a sorting dropdown
 * Syncs with URL search parameters for shareable filtered views
 */
function FilteringBar() {
    // Get filtering state and setter from context provider
    const { filtering, setFiltering } = useFiltering();
    
    // Local component state
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls filter dialog visibility
    const [localFilters, setLocalFilters] = useState({ ...filtering }); // Temporary filter state for dialog
    
    // Access URL search parameters for initial filter values
    const searchParams = useSearchParams();
    
    /**
     * Effect to sync component state with URL search parameters
     * Updates local filter state when URL parameters change
     * Enables bookmarking and sharing filtered views
     */
    useEffect(() => {
        // Extract all filter parameters from URL
        const query = searchParams.get('query') || undefined;
        const category = searchParams.get('category') || undefined;
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const featured = searchParams.get('featured') === 'true' ? true : undefined;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        
        // Update local filter state with URL parameters
        setLocalFilters({
            query,
            category,
            minPrice,
            maxPrice,
            featured,
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder
        });
    }, [searchParams]); // Re-run when URL parameters change

    /**
     * Handles sort selection change
     * Parses the combined sort value into separate sortBy and sortOrder properties
     * Updates global filtering state immediately (no Apply button needed for sorting)
     * 
     * @param {string} value - Combined sort field and direction (e.g., "price-asc")
     */
    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-');
        setFiltering(prev => ({ 
            ...prev, 
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder: sortOrder as 'asc' | 'desc'
        }));
    };

    /**
     * Applies the temporary filter state to the global filtering state
     * Closes the filter dialog after applying changes
     */
    const applyFilters = () => {
        setFiltering(localFilters);
        setIsDialogOpen(false);
    };

    /**
     * Resets all filters to default values
     * Updates both local and global filter state
     * Closes the dialog after reset
     */
    const resetFilters = () => {
        const resetState = {
            query: undefined,
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            featured: undefined,
            sortBy: 'createdAt' as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder: 'desc'
        };
        setLocalFilters(resetState);
        setFiltering(resetState);
        setIsDialogOpen(false);
    };

    // Combine sort field and direction for the select component value
    const currentSortValue = `${filtering.sortBy || 'createdAt'}-${filtering.sortOrder || 'desc'}`;

    return (
        <div className="flex justify-between items-center mb-4">
            {/* Filter button and dialog */}
            <div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {/* Filter button with indicator for active filters */}
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            {/* Show indicator dot when any filter is active */}
                            {(filtering.query || filtering.category || filtering.minPrice || 
                             filtering.maxPrice || filtering.featured) && 
                                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
                                    
                                </span>
                            }
                        </Button>
                    </DialogTrigger>
                    
                    {/* Filter dialog content */}
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Filter Products</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Search term filter */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input 
                                    id="search" 
                                    value={localFilters.query || ''} 
                                    onChange={(e) => setLocalFilters({...localFilters, query: e.target.value || undefined})}
                                    placeholder="Search products..."
                                />
                            </div>
                            
                            {/* Category filter dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={localFilters.category || ''}
                                    onValueChange={(value) => setLocalFilters({...localFilters, category: value === 'all' ? undefined : value || undefined})}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="fiction">Fiction</SelectItem>
                                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                                        <SelectItem value="education">Education & Professional</SelectItem>
                                        <SelectItem value="creative">Creative & Lifestyle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Price range filter with min and max inputs */}
                            <div className="space-y-2">
                                <Label>Price Range</Label>
                                <div className="flex gap-4 items-center">
                                    <Input 
                                        type="number"
                                        placeholder="Min"
                                        value={localFilters.minPrice ?? ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters, 
                                            minPrice: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                    />
                                    <span>to</span>
                                    <Input 
                                        type="number"
                                        placeholder="Max"
                                        value={localFilters.maxPrice ?? ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters, 
                                            maxPrice: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                    />
                                </div>
                            </div>
                            
                            {/* Featured products checkbox filter */}
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="featured"
                                    checked={!!localFilters.featured}
                                    onCheckedChange={(checked) => 
                                        setLocalFilters({...localFilters, featured: checked ? true : undefined})
                                    }
                                />
                                <Label htmlFor="featured">Featured Only</Label>
                            </div>
                            
                            {/* Filter action buttons */}
                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={resetFilters}>
                                    Reset
                                </Button>
                                <Button onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Sort order dropdown */}
            <div>
                <Select 
                    value={currentSortValue}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt-desc">Newest First</SelectItem>
                        <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="title-asc">Title: A to Z</SelectItem>
                        <SelectItem value="title-desc">Title: Z to A</SelectItem>
                        <SelectItem value="views-desc">Most Popular</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default FilteringBar;