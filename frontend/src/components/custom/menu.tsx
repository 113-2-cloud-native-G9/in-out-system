import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, MenuIcon } from 'lucide-react';
import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";
import { useState } from "react";

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className={`bg-background text-foreground p-2 flex items-center justify-between ${className}`}>
            <Button
                size="icon"
                variant="ghost"
                className="sm:hidden text-secondary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <MenuIcon size={24} />
            </Button>

            <div className="flex items-center space-x-2 flex-grow">
                <img src="../../public/vite.svg" alt="Yoyo點點名 Logo" className="h-8 w-8" />
                <span className="font-bold text-xl text-foreground hidden sm:block">Yoyo點點名</span>
                <span className="font-semibold text-foreground hidden sm:block">HR In & Out System</span>
            </div>

            <div className="flex items-center space-x-4">
                <div className={`sm:flex ${isMenuOpen ? "flex" : "hidden"} flex-col sm:flex-row sm:space-x-4`}>
                    <div className="flex flex-col sm:flex-row sm:space-x-1">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-foreground px-3 py-1 rounded-full text-sm font-medium hover:bg-popover transition duration-150 ease-in-out"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <Button size="icon" variant="ghost" className="text-secondary">
                    <Bell className="h-5 w-5" />
                </Button>

                <UserHead user={user} />

                <ModeToggle />
            </div>
        </nav>
    );
}
