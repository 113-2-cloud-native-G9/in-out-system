import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

export function UserHead({ user }: { user: User | null }) {
    if (!user) {
        return null;
    }
    return (
        <div className="flex items-center space-x-2">
            <Avatar>
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src={user.avatar} />
            </Avatar>
            <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.role}</p>
            </div>
        </div>
    );
}
