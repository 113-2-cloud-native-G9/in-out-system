import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

export function UserHead({ user }: { user: User | null }) {
    if (!user) {
        return null;
    }
    return (
        <div className="flex items-center space-x-2">
            <Avatar>
                <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                <AvatarImage src={user.employee_icon} />
            </Avatar>
            <div>
                <h2 className="text-lg text-primary-foreground font-semibold">{user.first_name} {user.last_name}</h2>
                <p className="text-sm text-primary-foreground">{user.employee_id}</p>
            </div>
        </div>
    );
}
