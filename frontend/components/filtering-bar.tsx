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

function FilteringBar() {
    const { filtering, setFiltering } = useFiltering();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({ ...filtering });
    const searchParams = useSearchParams();
    
    useEffect(() => {
        const query = searchParams.get('query') || undefined;
        const category = searchParams.get('category') || undefined;
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const featured = searchParams.get('featured') === 'true' ? true : undefined;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        
        setLocalFilters({
            query,
            category,
            minPrice,
            maxPrice,
            featured,
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder
        });
    }, [searchParams]);

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-');
        setFiltering(prev => ({ 
            ...prev, 
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder: sortOrder as 'asc' | 'desc'
        }));
    };

    const applyFilters = () => {
        setFiltering(localFilters);
        setIsDialogOpen(false);
    };

    const resetFilters = () => {
        const resetState = {
            query: undefined,
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            featured: undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
        setLocalFilters(resetState);
        setFiltering(resetState);
        setIsDialogOpen(false);
    };

    const currentSortValue = `${filtering.sortBy || 'createdAt'}-${filtering.sortOrder || 'desc'}`;

    return (
        <div className="flex justify-between items-center mb-4">
            <div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            {(filtering.query || filtering.category || filtering.minPrice || 
                             filtering.maxPrice || filtering.featured) && 
                                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
                                    
                                </span>
                            }
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Filter Products</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input 
                                    id="search" 
                                    value={localFilters.query || ''} 
                                    onChange={(e) => setLocalFilters({...localFilters, query: e.target.value || undefined})}
                                    placeholder="Search products..."
                                />
                            </div>
                            
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