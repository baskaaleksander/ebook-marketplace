import { FaCheckCircle, FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { useAuth } from "@/providers/authprovider";
import { Button } from "./ui/button";
import { UserData } from "@/lib/definitions";


function StarRating({ rating }: { rating: number }) {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i - 0.5 === roundedRating) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }
    
    return <div className="flex">{stars}</div>;
}

function UserHeading(userData : UserData) {
    const { user } = useAuth();
    

    return (
        <div className="flex flex-col">
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <img
                        src={userData.avatarUrl || `https://ui-avatars.com/api/?name=${userData.name}+${userData.surname}&bold=true`}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full mr-4"
                    />
                    <div className="flex flex-col items-start w-full">
                        <h2 className="text-2xl font-semibold flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>{userData.name} {userData.surname}</TooltipTrigger>
                                    <TooltipContent>
                                        <p>{userData.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider> 
                            {userData.stripeStatus === 'verified' && <FaCheckCircle className="text-blue-500 text-sm" />}
                        </h2>
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
                    {userData.description && <p className="text-gray-600 mb-4">{userData.description}</p>}
                    <a className='hover:underline text-gray-600 mt-4' href={`mailto:${userData.email}`}>{userData.email}</a>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex w-full justify-between items-center">
                    <p className="text-gray-600">Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
                    {user?.id === userData.id && (
                        <Link href={'/user/dashboard/settings'}>
                            <Button>Edit Profile</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    </div>
            )

}

export default UserHeading;