import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";

export function Menu({ className }: { className?: string }) {
    const user = useUser();

    return (
        <div className={`fixed top-0 h-12 min-w-dvw ${className}`}>
            <div className="container mx-auto p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Attendance Dashboard</h1>

                <div className="flex items-center space-x-4">
                    <UserHead user={user.user} />
                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}
