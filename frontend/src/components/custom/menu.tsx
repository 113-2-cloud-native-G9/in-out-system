import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, MenuIcon, Lock, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/custom/modeToggle";
import { UserHead } from "@/components/custom/userHead";
import { useUser } from "@/providers/authProvider";
import { useEffect, useState, useRef } from "react";
import { ChangePasswordDialog } from "@/components/custom/ChangePasswordDialog";

interface MenuItem {
    name: string;
    path: string;
    count?: number | null;
}

interface MenuProps {
    className?: string;
    items?: MenuItem[];
}

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export function Menu({ className, items = [] }: MenuProps) {
    const { user, logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        employeeId: user?.employee_id || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const location = useLocation();

    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const userHeadRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                userHeadRef.current &&
                !userHeadRef.current.contains(event.target as Node)
            ) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsDropdownVisible(false);
    };

    const handleChangePassword = () => {
        setIsDropdownVisible(false);
        setIsPasswordDialogOpen(true);
    };

    const closePasswordDialog = () => {
        setIsPasswordDialogOpen(false);
        setPasswordForm({
            employeeId: user?.employee_id || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
    };

    const handlePasswordSubmit = async (passwordForm: { employeeId: string, oldPassword: string, newPassword: string, confirmPassword: string }) => {
        const hashedOldPassword = await hashPassword(passwordForm.oldPassword);
        const hashedNewPassword = await hashPassword(passwordForm.newPassword);
        const hashedConfirmPassword = await hashPassword(passwordForm.confirmPassword);

        console.log("Hashed Passwords submitted:", {
            oldPassword: hashedOldPassword,
            newPassword: hashedNewPassword,
            confirmPassword: hashedConfirmPassword
        });

        // Here you would add your logic to handle the password change
        // Example: call an API to update the password

        closePasswordDialog();
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUserHeadClick = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    return (
        <>
            <nav
                className={`bg-background text-foreground p-2 flex items-center justify-between ${className} h-20 relative`}
            >
                <Button
                    size="icon"
                    variant="ghost"
                    className="xl:hidden text-primary cursor-pointer mr-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <MenuIcon size={24} />
                </Button>

                {/* Logo Section */}
                <div className="flex items-center space-x-2 flex-grow">
                    <img src="vite.svg" alt="Yoyo點點名 Logo" className="h-8 w-8" />
                    <span className="font-bold text-xl text-foreground hidden sm:block">Yoyo點點名</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">HR In & Out System</span>
                </div>

                {/* Right Side Controls Section */}
                <div className="flex items-center space-x-2">
                    <div
                        className={`${isMenuOpen ? "flex" : "hidden"
                            } absolute top-20 left-0 w-full bg-background z-10 flex-col xl:flex-row xl:space-x-4 xl:static xl:flex shadow-md xl:shadow-none border-t xl:border-t-0`}
                    >
                        <div className="flex flex-col xl:flex-row xl:space-x-2">
                            {items.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`hover:cursor-pointer text-foreground px-3 py-3 xl:py-2 rounded-sm text-sm font-medium hover:bg-popover transition duration-150 ease-in-out ${location.pathname === item.path ? "bg-popover" : ""
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Mobile User Controls - Only shown in mobile menu when open */}
                            {isMenuOpen && (
                                <div className="flex justify-between px-4 items-center space-x-4 my-4 xl:hidden">
                                    <div
                                        ref={userHeadRef}
                                        className="relative"
                                    >
                                        <UserHead
                                            user={user}
                                            onClick={handleUserHeadClick}
                                        />

                                        {/* Mobile dropdown appears under the user avatar in the mobile menu */}
                                        {isDropdownVisible && (
                                            <div
                                                className="absolute left-0 top-full mt-2 w-56 bg-card shadow-lg rounded-md z-30 border border-popover"
                                                ref={dropdownRef}
                                            >
                                                <div className="flex flex-col items-start w-full">
                                                    <button
                                                        className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full rounded-sm"
                                                        onClick={handleChangePassword}
                                                    >
                                                        <Lock className="h-5 w-5 text-primary" />
                                                        <span>Change Password</span>
                                                    </button>

                                                    <button
                                                        className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full rounded-sm"
                                                        onClick={handleLogout}
                                                    >
                                                        <LogOut className="h-5 w-5 text-destructive" />
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <ModeToggle />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notification Bell */}
                    <Button size="icon" variant="ghost" className="text-secondary">
                        <Bell className="h-5 w-5" />
                    </Button>

                    {/* Desktop User Controls */}
                    <div className="hidden xl:flex justify-center items-center space-x-4">
                        <ModeToggle />
                        <div
                            ref={userHeadRef}
                            className="relative"
                        >
                            <UserHead
                                user={user}
                                onClick={handleUserHeadClick}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop User Dropdown */}
                {isDropdownVisible && !isMenuOpen && (
                    <div
                        className="absolute top-20 right-4 w-56 bg-card shadow-lg rounded-md z-20 border border-popover hidden xl:block"
                        ref={dropdownRef}
                    >
                        <div className="flex flex-col items-start w-full">
                            <button
                                className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full rounded-sm"
                                onClick={handleChangePassword}
                            >
                                <Lock className="h-5 w-5 text-primary" />
                                <span>Change Password</span>
                            </button>

                            <button
                                className="flex items-center space-x-3 px-4 py-3 text-sm cursor-pointer hover:bg-background/50 w-full rounded-sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5 text-destructive" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            <ChangePasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={closePasswordDialog}
                onSubmit={handlePasswordSubmit}
                passwordForm={passwordForm}
                onPasswordChange={handlePasswordChange}
            />
        </>

    );
}