'use client';
import { useFiltering } from "@/providers/filtering-provider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Filter } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

function FilteringBar() {
    const { filtering, setFiltering } = useFiltering();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({ ...filtering });

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-');
        setFiltering(prev => ({ 
            ...prev, 
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder: sortOrder
        }));
    };

    const applyFilters = () => {
        setFiltering(localFilters);
        setIsDialogOpen(false);
    };

    const resetFilters = () => {
        const resetState = {
            ...filtering,
            query: undefined,
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            featured: undefined
        };
        setLocalFilters(resetState);
        setFiltering(resetState);
        setIsDialogOpen(false);
    };

    return (
        <div className="flex justify-between items-center mb-4">
            <div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
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
                                    onValueChange={(value) => setLocalFilters({...localFilters, category: value || undefined})}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="fiction">Fiction</SelectItem>
                                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                                        <SelectItem value="science">Science</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Price Range</Label>
                                <div className="flex gap-4 items-center">
                                    <Input 
                                        type="number"
                                        placeholder="Min"
                                        value={localFilters.minPrice || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters, 
                                            minPrice: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                    />
                                    <span>to</span>
                                    <Input 
                                        type="number"
                                        placeholder="Max"
                                        value={localFilters.maxPrice || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters, 
                                            maxPrice: e.target.value ? Number(e.target.value) : undefined
                                        })}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox"
                                    id="featured"
                                    checked={!!localFilters.featured}
                                    onChange={(e) => setLocalFilters({...localFilters, featured: e.target.checked || undefined})}
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
                    defaultValue={`${filtering.sortBy}-${filtering.sortOrder}`}
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
                        {/* <SelectItem value="rating-desc">Highest Rated</SelectItem> */}
                        <SelectItem value="views-desc">Most Popular</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default FilteringBar;