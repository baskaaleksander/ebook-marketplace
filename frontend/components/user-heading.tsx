import { LiaCheckCircle } from "react-icons/lia";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface UserData {
    id: string;
    name: string;
    surname: string;
    email: string;
    stripeStatus: string;
    description?: string;
    avatarUrl?: string;
    createdAt: string;
}

function UserHeading(userData : UserData) {

    return (
        <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-4">User Profile</h1>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>{userData.name} {userData.surname}</TooltipTrigger>
                            <TooltipContent>
                                <p>{userData.id}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> 
                    {userData.stripeStatus === 'verified' && <LiaCheckCircle />}
                </h2>
                <a className='hover:underline' href={`mailto:${userData.email}`}>{userData.email}</a>
                {userData.description && <p className="text-gray-600 mb-4">{userData.description}</p>}
                {userData.avatarUrl && (
                    <img
                        src={userData.avatarUrl}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full mb-4"
                    />
                )}
                <p className="text-gray-600">Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
            )

}

export default UserHeading;