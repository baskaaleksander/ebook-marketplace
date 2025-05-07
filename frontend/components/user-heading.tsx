'use client';
import { FaCheckCircle } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "./ui/button";
import { UserData } from "@/lib/definitions";
import StarRating from "./star-rating";
import UserHeadingSkeleton from "./user-heading-skeleton";

/**
 * UserHeading component displays user profile information in header format
 * Shows user avatar, name, verification status, ratings, and contact details
 * Conditionally renders edit button for the profile owner
 * 
 * @param {Object} props - Component props
 * @param {UserData} props.userData - User data object containing profile information
 * @param {boolean} props.loading - Optional flag indicating if data is still loading
 */
function UserHeading({userData, loading} : {userData: UserData, loading?: boolean}) {
    // Get current authenticated user to determine if viewing own profile
    const { user } = useAuth();
    
    /**
     * Show loading skeleton while data is being fetched
     * Also handles case where userData is not yet available
     */
    if (loading || !userData) {
        return <UserHeadingSkeleton />;
    }

    return (
        <div className="flex flex-col">
            {/* User information section */}
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    {/* User avatar - uses UI Avatars API as fallback if no custom avatar */}
                    <img
                        src={userData.avatarUrl || `https://ui-avatars.com/api/?name=${userData.name}+${userData.surname}&bold=true`}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full mr-4"
                    />
                    <div className="flex flex-col items-start w-full">
                        {/* User name with verification badge and ID tooltip */}
                        <h2 className="text-2xl font-semibold flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>{userData.name} {userData.surname}</TooltipTrigger>
                                    <TooltipContent>
                                        <p>{userData.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider> 
                            {/* Verification badge - only shown for verified sellers */}
                            {userData.stripeStatus === 'verified' && <FaCheckCircle className="text-blue-500 text-sm" />}
                        </h2>
                        
                        {/* User rating with link to reviews */}
                        <Link href={`/user/${userData.id}/reviews`}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1">
                                        <StarRating rating={userData.rating} />
                                        <span className="text-gray-500 text-sm">({userData.rating.toFixed(1)})</span>                            
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Average rating</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Link>
                        
                        {/* Conditional rendering for user description */}
                        {userData.description && <p className="text-gray-600 mb-4">{userData.description}</p>}
                        
                        {/* Email contact link */}
                        <a className='hover:underline text-gray-600 mt-4' href={`mailto:${userData.email}`}>{userData.email}</a>
                    </div>
                </div>
            </div>
            
            {/* Footer section with join date and conditional edit button */}
            <div className="flex items-start">
                <div className="flex w-full justify-between items-center">
                    {/* Member since information */}
                    <p className="text-gray-600">Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
                    
                    {/* Edit button - only shown if viewing own profile */}
                    {user?.id === userData.id && (
                        <Link href={'/user/dashboard/settings'}>
                            <Button>Edit Profile</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserHeading;