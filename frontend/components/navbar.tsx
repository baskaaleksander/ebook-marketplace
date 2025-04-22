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

function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
        }
    }

    return (
        <nav className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-[80%] px-4 py-2 mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <a className="flex items-center gap-2" href="/">
                        <LiaBookOpenSolid className="text-xl" />
                        <span className="font-medium">bookify</span>
                    </a>
                </div>
                
                {/* Search Bar */}
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
                                setTimeout(() => setIsFocused(false), 200);
                            }}
                        />
                        {searchQuery.trim() && isFocused && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                <div 
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                >
                                    Search for '{searchQuery}'
                                </div>
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            <LiaSearchSolid className="text-lg" />
                        </button>
                    </div>
                </form>
                
                <div className="flex items-center gap-4">
                 {user ? (
                    <>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="flex items-center gap-1">
                                <LiaUser />
                                <LiaAngleDownSolid />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
                    {user.stripeStatus === 'verified' && (
                        <Button className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/product/create')}>
                            List product
                        </Button>
                    )}
                    </>
                    ) : (
                        <>
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
            
            {/* Mobile Search (visible only on small screens) */}
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