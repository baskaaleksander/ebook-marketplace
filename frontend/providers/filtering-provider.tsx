'use client';
import { createContext, useContext, useState } from "react";

interface FilteringState {
    query: string | undefined;
    category: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    sortOrder: string;
    sortBy: 'title' | 'price' | 'createdAt' | 'rating' | 'views';
    featured: boolean | undefined;
}

interface FilteringContextType {
    filtering: FilteringState;
    setFiltering: React.Dispatch<React.SetStateAction<FilteringState>>;
}

const FilteringContext = createContext<FilteringContextType | undefined>(undefined);

export function FilteringProvider({ children } : { children: React.ReactNode }) {
    const [filtering, setFiltering] = useState<FilteringState>({
        query: undefined,
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortOrder: 'desc',
        sortBy: 'createdAt',
        featured: undefined,
    });

    return (
        <FilteringContext.Provider value={{ filtering, setFiltering }}>
            {children}
        </FilteringContext.Provider>
    );
}

export function useFiltering() {
    const context = useContext(FilteringContext);
    if (context === undefined) {
        throw new Error('useFiltering must be used within a FilteringProvider');
    }
    return context;
}