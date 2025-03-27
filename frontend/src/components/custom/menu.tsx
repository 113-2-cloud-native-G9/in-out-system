import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, MenuIcon } from "lucide-react";
import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";
import { useEffect, useState } from "react";

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
    const location = useLocation();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <nav
            className={`bg-background text-foreground p-2 flex items-center justify-between ${className} h-20 relative`}
        >
            <Button
                size="icon"
                variant="ghost"
                className="xl:hidden text-primary cursor-pointer mr-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <MenuIcon size={24} />
            </Button>

            <div className="flex items-center space-x-2 flex-grow">
                <img src="vite.svg" alt="Yoyo點點名 Logo" className="h-8 w-8" />
                <span className="font-bold text-xl text-foreground">
                    Yoyo點點名
                </span>
                <span className="font-semibold text-foreground">
                    HR In & Out System
                </span>
            </div>

            <div className="flex items-center space-x-4">
                <div
                    className={`${
                        isMenuOpen ? "flex" : "hidden"
                    } absolute top-20 left-0 w-full bg-background z-10 flex-col xl:flex-row xl:space-x-4 xl:static xl:flex`}
                >
                    <div className="flex flex-col xl:flex-row xl:space-x-1">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`hover:cursor-pointer text-foreground px-3 py-4 xl:py-1 rounded-sm text-sm font-medium hover:bg-popover transition duration-150 ease-in-out ${
                                    location.pathname === item.path
                                        ? "bg-popover "
                                        : ""
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {isMenuOpen && (
                            <div className="flex justify-between px-2 items-center space-x-4 my-5 sm:hidden">
                                <UserHead user={user} />
                                <ModeToggle />
                            </div>
                        )}
                    </div>
                </div>

                <Button size="icon" variant="ghost" className="text-secondary">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="hidden sm:flex justify-center items-center space-x-4 ">
                    <UserHead user={user} />

                    <ModeToggle />
                </div>
            </div>
        </nav>
    );
}
