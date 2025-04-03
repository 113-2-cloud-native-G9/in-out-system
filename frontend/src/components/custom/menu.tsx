import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, MenuIcon, Lock, LogOut } from "lucide-react"; // Import icons for the dropdown
import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";
import { useEffect, useState, useRef } from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu";  // Import NavigationMenu

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
    const { user, logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);  // Track dropdown visibility
    const location = useLocation();
    
    // Reference to the dropdown menu for detecting clicks outside
    const dropdownRef = useRef<HTMLDivElement | null>(null); // Explicitly type the ref

    useEffect(() => {
        // Close the dropdown when a click outside occurs
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownVisible(false);
            }
        };

        // Add event listener to detect outside clicks
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout(); // Call logout function from auth provider
        setIsDropdownVisible(false); // Close the dropdown after logout
    };

    const handleChangePassword = () => {
        setIsDropdownVisible(false); // Close the dropdown after clicking on Change Password
        // Add logic to handle password change (e.g., navigate to change password page)
    };

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
                <span className="font-bold text-xl text-foreground">Yoyo點點名</span>
                <span className="font-semibold text-foreground">HR In & Out System</span>
            </div>

            <div className="flex items-center space-x-4">
                <div
                    className={`${isMenuOpen ? "flex" : "hidden"} absolute top-20 left-0 w-full bg-background z-10 flex-col xl:flex-row xl:space-x-4 xl:static xl:flex`}
                >
                    <div className="flex flex-col xl:flex-row xl:space-x-1">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`hover:cursor-pointer text-foreground px-3 py-4 xl:py-1 rounded-sm text-sm font-medium hover:bg-popover transition duration-150 ease-in-out ${location.pathname === item.path ? "bg-popover" : ""
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <Button size="icon" variant="ghost" className="text-secondary">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="hidden sm:flex justify-center items-center space-x-4 ">
                    <UserHead
                        user={user}
                        onClick={() => setIsDropdownVisible(!isDropdownVisible)} // Toggle dropdown on click
                    />
                    <ModeToggle />
                </div>
            </div>

            {/* Dropdown menu using shadcn NavigationMenu */}
            {isDropdownVisible && (
                <NavigationMenu className="absolute top-20 right-10 w-56 bg-card shadow-lg rounded-md z-20 border border-popover" ref={dropdownRef}>
                    <NavigationMenuList className="flex flex-col items-start">
                        {/* Change Password Item */}
                        <NavigationMenuItem>
                            <div
                                className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full"  // Ensure full width for the item
                                onClick={handleChangePassword}
                            >
                                <Lock className="h-5 w-5 text-primary" />
                                <span>Change Password</span>
                            </div>
                        </NavigationMenuItem>

                        {/* Logout Item */}
                        <NavigationMenuItem>
                            <div
                                className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full"  // Ensure full width for the item
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5 text-destructive" />
                                <span>Logout</span>
                            </div>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            )}
        </nav>
    );
}
