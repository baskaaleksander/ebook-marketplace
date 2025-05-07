'use client';
import { createContext, useContext, useState } from "react";

/**
 * Interface defining the shape of filtering state
 * Contains all possible filter and sort options for product listings
 */
interface FilteringState {
    query: string | undefined;      // Text search query for filtering products
    category: string | undefined;   // Category filter to show products from a specific category
    minPrice: number | undefined;   // Minimum price boundary for price range filtering
    maxPrice: number | undefined;   // Maximum price boundary for price range filtering
    sortOrder: string;              // Sort direction ('asc' or 'desc')
    sortBy: 'title' | 'price' | 'createdAt' | 'rating' | 'views';  // Field to sort products by
    featured: boolean | undefined;  // Whether to show only featured products
}

/**
 * Interface for the filtering context
 * Provides both the current filtering state and a setter function
 */
interface FilteringContextType {
    filtering: FilteringState;      // Current filtering and sorting configuration
    setFiltering: React.Dispatch<React.SetStateAction<FilteringState>>;  // Function to update filtering state
}

/**
 * Create context for filtering with undefined default value
 * Will be populated by the FilteringProvider component
 */
const FilteringContext = createContext<FilteringContextType | undefined>(undefined);

/**
 * FilteringProvider component manages product filtering and sorting state
 * Provides filtering context to the component tree
 * Initializes with default sorting by creation date
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to filtering context
 */
export function FilteringProvider({ children } : { children: React.ReactNode }) {
    // Initialize filtering state with default values
    const [filtering, setFiltering] = useState<FilteringState>({
        query: undefined,          // No text search by default
        category: undefined,       // No category filter by default
        minPrice: undefined,       // No minimum price filter by default
        maxPrice: undefined,       // No maximum price filter by default
        sortOrder: 'desc',         // Default to descending order (newest first)
        sortBy: 'createdAt',       // Default to sorting by creation date
        featured: undefined,       // No featured filter by default
    });

    return (
        <FilteringContext.Provider value={{ filtering, setFiltering }}>
            {children}
        </FilteringContext.Provider>
    );
}

/**
 * Custom hook to access the filtering context
 * Provides strongly-typed access to filtering state and functions
 * 
 * @returns {FilteringContextType} Filtering context with state and setter function
 * @throws {Error} If used outside of a FilteringProvider component
 */
export function useFiltering() {
    const context = useContext(FilteringContext);
    if (context === undefined) {
        throw new Error('useFiltering must be used within a FilteringProvider');
    }
    return context;
}