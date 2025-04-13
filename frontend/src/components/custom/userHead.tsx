import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

interface UserHeadProps {
    user: User | null;
    onClick?: () => void;  
}

export function UserHead({ user, onClick }: UserHeadProps) {
    if (!user) {
        return null;
    }
    return (
        <div
            className="flex items-center space-x-2 min-w-40 cursor-pointer" 
            onClick={onClick} 
        >
            <Avatar>
                <AvatarFallback>
                    {user.first_name[0]}
                    {user.last_name[0]}
                </AvatarFallback>
                {/* <AvatarImage src={user.employee_icon} /> */}
            </Avatar>
            <div>
                <h2 className="text-lg text-foreground font-semibold">
                    {user.first_name} {user.last_name}
                </h2>
                <p className="text-sm text-foreground">{user.employee_id}</p>
            </div>
        </div>
    );
}
