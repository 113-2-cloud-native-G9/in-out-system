import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/providers/themeProvider";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User2, KeyRound } from "lucide-react";
import Spinner from "@/components/custom/spinner";
import { ForgetPasswordDialog } from "@/components/custom/ForgetPasswordDialog";
import { useLogin } from "@/hooks/queries/useAuth";

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
};

export function LoginPage() {
    const { theme } = useTheme();
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isForgetPasswordDialogOpen, setIsForgetPasswordDialogOpen] =
        useState(false);
    const { mutate: login, isPending } = useLogin();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (employeeId && password) {
                const hashedPassword = await hashPassword(password);
                login(
                    {
                        employee_id: employeeId,
                        hashed_password: hashedPassword,
                    },
                    {
                        onError: (error) => {
                            setError(
                                error.message ||
                                    "Login failed. Please try again."
                            );
                            setPassword("");
                        },
                    }
                );
            } else {
                setError("Please enter your employee id and password");
            }
        } catch (err: any) {
            setError("Error hashing password. Please try again.");
            setPassword("");
        }
    };

    return (
        <div className="w-full h-screen flex bg-background">
            {/* Left side - Login Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-background overflow-y-auto">
                <div className="w-full max-w-md">
                    <Card className="bg-card border shadow-xl">
                        <CardHeader className="space-y-1 pb-6">
                            <div className="flex flex-col items-center space-y-4">
                                {/* Logo */}
                                <div className="relative">
                                    <img
                                        src={
                                            theme === "dark"
                                                ? "/icon-dark.png"
                                                : "/icon.png"
                                        }
                                        alt="Yoyo Attendance Logo"
                                        className="h-12 w-12"
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        Yoyo 點點名
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <form onSubmit={handleLogin} className="space-y-5">
                                {error && (
                                    <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-slide-in">
                                        <div className="flex items-center justify-center font-medium">
                                            {error}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Employee ID Field */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="employeeId"
                                            className="text-sm font-medium"
                                        >
                                            EmployeeId:
                                        </Label>
                                        <div className="relative group">
                                            <Input
                                                id="employeeId"
                                                type="text"
                                                value={employeeId}
                                                onChange={(e) =>
                                                    setEmployeeId(
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-background border-border/50 focus:border-primary transition-all duration-200"
                                                placeholder="EX:EMP001"
                                                disabled={isPending}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            Password:
                                        </Label>
                                        <div className="relative group">
                                            <Input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                className="pr-10 bg-background border-border/50 focus:border-primary transition-all duration-200"
                                                placeholder="****"
                                                disabled={isPending}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                disabled={isPending}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Forgot Password */}
                                <div className="flex justify-start">
                                    <Button
                                        variant="link"
                                        type="button"
                                        className="cursor-pointer p-0 h-auto text-sm text-foreground hover:text-primary transition-colors underline"
                                        onClick={() =>
                                            setIsForgetPasswordDialogOpen(true)
                                        }
                                    >
                                        Forgot Password?
                                    </Button>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full py-6 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        "LogIn"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        <p>
                            © {new Date().getFullYear()} YoYo Attendance. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - System Showcase */}
            <div className="hidden lg:flex lg:w-3/5 bg-secondary/5 dark:bg-secondary/10 relative overflow-hidden items-center justify-center h-full">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-normal" />
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:mix-blend-normal" />
                    <div className="absolute -bottom-40 left-20 w-80 h-80 bg-chart-1/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:mix-blend-normal" />
                </div>

                {/* System showcase content */}
                <div className="relative z-10 px-12 text-center">
                    {/* Cute character illustration */}
                    <div className="mb-8">
                        {/* TSMC Logo placeholder */}
                        <div className="inline-block">
                            {/* TSMC Text Logo */}
                            <img
                                src="/tsmc-logo.png"
                                alt="TSMC Logo"
                                className="h-50 w-auto mx-auto"
                            />
                            {/* Additional branding */}
                            <div className="text-sm text-muted-foreground mt-2 text-center">
                                Taiwan Semiconductor Manufacturing Company
                            </div>
                        </div>
                    </div>

                    {/* Features showcase */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-lg border border-border/50 text-center">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="font-semibold mb-2">
                                Real-time
                                <br />
                                Tracking
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Monitor attendance
                                <br />
                                status instantly
                            </p>
                        </div>
                        <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-lg border border-border/50 text-center">
                            <div className="text-3xl mb-3">📱</div>
                            <h3 className="font-semibold mb-2">
                                Easy Check-in
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Simple one-click
                                <br />
                                attendance marking
                            </p>
                        </div>
                        <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-lg border border-border/50 text-center">
                            <div className="text-3xl mb-3">📈</div>
                            <h3 className="font-semibold mb-2">Analytics</h3>
                            <p className="text-sm text-muted-foreground">
                                Comprehensive
                                <br />
                                attendance reports
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forget Password Dialog */}
            <ForgetPasswordDialog
                isOpen={isForgetPasswordDialogOpen}
                onClose={() => setIsForgetPasswordDialogOpen(false)}
            />
        </div>
    );
}

export default LoginPage;
