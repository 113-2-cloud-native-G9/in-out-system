import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/providers/themeProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User2, KeyRound } from "lucide-react";
import Spinner from "@/components/custom/spinner";
import { ForgetPasswordDialog } from "@/components/custom/ForgetPasswordDialog"
import { useLogin } from "@/hooks/queries/useAuth";

const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export function LoginPage() {
    const { theme } = useTheme();
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgetPasswordDialogOpen, setIsForgetPasswordDialogOpen] = useState(false);
    const { mutate: login, isPending } = useLogin();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (employeeId && password) {
                const hashedPassword = await hashPassword(password);
                login(
                    { 
                        employee_id: employeeId, 
                        hashed_password: hashedPassword 
                    },
                    {
                        onError: (error) => {
                            setError(error.message || 'Login failed. Please try again.');
                            setPassword("");
                        }
                    }
                );
            } else {
                setError('Please enter your employee id and password');
            }
        } catch (err: any) {
            setError('Error hashing password. Please try again.');
            setPassword("");
        }
    };

    return (
        <Card className="relative w-96 overflow-hidden border-none bg-card/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-center">
                    <div>
                        <img 
                            src={theme === 'dark' ? 'icon-dark.png' : 'icon.png'} 
                            alt="Yoyo點點名 Logo" 
                            className="h-12 w-12" 
                        />
                    </div>
                </div>
                <CardTitle className="text-2xl text-center font-semibold tracking-tight">
                    Yoyo點點名
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    HR In & Out System
                </CardDescription>
            </CardHeader>
            <CardContent className="relative">
                <form onSubmit={handleLogin} className="relative space-y-4">
                    {error && (
                        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center justify-center font-medium animate-in fade-in-50 border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="employeeId" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Employee ID
                        </Label>
                        <div className="relative group">
                            <User2 className="absolute left-3 top-2.5 h-5 w-5 text-muted transition-colors group-hover:text-primary/50" />
                            <Input
                                id="employeeId"
                                type="text"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="pl-10 bg-background border-secondary/50 transition-colors focus:border-primary/50 font-medium"
                                placeholder="Enter your ID"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Password
                        </Label>
                        <div className="relative group">
                            <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted transition-colors group-hover:text-primary/50" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 border-secondary/50 transition-colors focus:border-primary/50 font-medium"
                                placeholder="Enter your password"
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                variant="default"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:text-foreground transition-colors "
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-muted hover:text-primary/50" />
                                ) : (
                                    <Eye className="h-5 w-5 text-muted hover:text-primary/50" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-base font-medium tracking-wide bg-accent text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                        disabled={isPending}
                    >
                        {isPending ? <Spinner /> : 'SIGN IN'}
                    </Button>

                    <div className="text-center pt-2">
                        <Button
                            variant="link"
                            type="button"
                            className="cursor-pointer text-sm text-foreground hover:text-primary transition-colors font-medium"
                            onClick={() => setIsForgetPasswordDialogOpen(true)}
                        >
                            Forgot Password?
                        </Button>
                    </div>
                </form>
                <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-background/5 pointer-events-none" />
            </CardContent>
            <ForgetPasswordDialog
                isOpen={isForgetPasswordDialogOpen}
                onClose={() => setIsForgetPasswordDialogOpen(false)}
            />
        </Card>
    );
}

export default LoginPage;
