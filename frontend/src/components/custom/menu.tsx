import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";

interface MenuItem {
  name: string;
  path: string;
  count?: number | null;
}

interface MenuProps {
  className?: string;
  items?: MenuItem[];
}

export function Menu({ className, items = [] }: MenuProps) {
    const { user } = useUser();

    return (
        <nav className={`bg-foreground text-foreground p-2 flex items-center justify-between ${className}`}>
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                    <img src="../../public/vite.svg" alt="Tiimi Logo" className="h-8 w-8" />
                    <span className="font-bold text-xl text-primary-foreground">Yoyo點點名</span>
                </div>
                <span className="font-semibold text-primary-foreground">HR In & Out System</span>
                <div className="flex space-x-1">
                    {items.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className=" text-primary-foreground px-3 py-1 rounded-full text-sm font-medium hover:text-chart-3 hover:bg-accent transition duration-150 ease-in-out"
                        >
                            {item.name}
                            {item.count !== null && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-primary-foreground rounded-full">
                                    {item.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Button size="icon" variant="ghost" className="text-secondary">
                    <Bell className="h-5 w-5" />
                </Button>
                <UserHead user={user} />
                <ModeToggle />
            </div>
        </nav>
    );
}


