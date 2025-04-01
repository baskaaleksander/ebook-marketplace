import { 
    LiaAngleDownSolid, 
    LiaUser 
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


function Navbar(
    
) {

    return (
        <nav className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-[80%] px-4 py-2 mx-auto flex items-center justify-between">
                <div>
                    <ul>
                        <li>
                            HOME
                        </li>
                    </ul>
                </div>
                <div>
                <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="flex items-center gap-1">
                                <LiaUser />
                                <LiaAngleDownSolid />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;