'use client';

import { 
    LiaAngleDownSolid, 
    LiaBookOpenSolid, 
    LiaUser,
    LiaSearchSolid
} from "react-icons/lia";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Navbar component provides site-wide navigation and search functionality
 * Contains conditional UI elements based on authentication status
 * Includes responsive design for mobile and desktop viewports
 */
function Navbar() {
    // State for search functionality
    const [searchQuery, setSearchQuery] = useState(""); // Tracks current search input text
    const [isFocused, setIsFocused] = useState(false); // Controls search suggestion visibility
    
    // Authentication hooks for user status and actions
    const { user, logout } = useAuth();
    
    // Router for programmatic navigation
    const router = useRouter();

    /**
     * Handles user logout action
     * Calls the logout function from auth context
     */
    const handleLogout = () => {
        logout();
    }

    /**
     * Handles search form submission
     * Redirects to product search page with query parameter
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
        }
    }

    return (
        <nav className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-[80%] px-4 py-2 mx-auto flex items-center justify-between">
                {/* Logo and brand name */}
                <div className="flex items-center gap-8">
                    <Link className="flex items-center gap-2" href="/">
                        <LiaBookOpenSolid className="text-xl" />
                        <span className="font-medium">bookify</span>
                    </Link>
                </div>
                
                {/* Desktop Search Bar - Hidden on mobile */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md px-4">
                    <div className="relative w-full">
                        <Input
                            type="text"
                            placeholder="Search for ebooks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-md"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                // Delayed blur to allow clicking on suggestions
                                setTimeout(() => setIsFocused(false), 200);
                            }}
                        />
                        {/* Search suggestions dropdown - shown when typing and input is focused */}
                        {searchQuery.trim() && isFocused && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                <div 
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                >
                                    Search for &apos;{searchQuery}&apos;
                                </div>
                            </div>
                        )}
                        {/* Search icon button */}
                        <button 
                            type="submit" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <LiaSearchSolid className="text-lg" />
                        </button>
                    </div>
                </form>
                
                {/* User actions section (right side of navbar) */}
                <div className="flex items-center gap-4">
                 {/* Conditional rendering based on authentication status */}
                 {user ? (
                    <>
                    {/* User dropdown menu for authenticated users */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="flex items-center gap-1">
                                <LiaUser />
                                <LiaAngleDownSolid />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* User account options */}
                            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/user/${user.id}`)}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/user/dashboard')}>Dashboard</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/user/dashboard/wallet')}>Wallet</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/user/dashboard/settings')}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="font-medium text-red-500" onClick={() => handleLogout()}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> 
                    {/* Create product button - only shown for verified sellers */}
                    {user.stripeStatus === 'verified' && (
                        <Button className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/product/create')}>
                            List product
                        </Button>
                    )}
                    </>
                    ) : (
                        <>
                        {/* Authentication buttons for non-authenticated users */}
                        <Button variant="outline" className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/login')}>
                            Sign In
                        </Button>
                        <Button className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/register')}>
                            Sign Up
                        </Button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Mobile Search Bar - Only visible on small screens */}
            <div className="md:hidden px-4 pb-3">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative w-full">
                        <Input
                            type="text"
                            placeholder="Search for ebooks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-md"
                        />
                        <button 
                            type="submit" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <LiaSearchSolid className="text-lg" />
                        </button>
                    </div>
                </form>
            </div>
        </nav>
    )
}

export default Navbar;