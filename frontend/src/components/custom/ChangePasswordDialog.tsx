import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ChangePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (passwordForm: { employeeId: string, oldPassword: string, newPassword: string, confirmPassword: string }) => void;
    passwordForm: { employeeId: string, oldPassword: string, newPassword: string, confirmPassword: string };
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export function ChangePasswordDialog({
    isOpen,
    onClose,
    onSubmit,
    passwordForm,
    onPasswordChange
}: ChangePasswordDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(passwordForm); }}>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Please enter your current password and new password below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Employee ID (readonly) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="employeeId" className="text-right">
                                Employee ID
                            </Label>
                            <Input
                                id="employeeId"
                                value={passwordForm.employeeId}
                                className="col-span-3"
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Old Password */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="oldPassword" className="text-right">
                                Current Password
                            </Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                value={passwordForm.oldPassword}
                                onChange={onPasswordChange}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={onPasswordChange}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirmPassword" className="text-right">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={onPasswordChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            type="submit"
                            disabled={
                                !passwordForm.oldPassword ||
                                !passwordForm.newPassword ||
                                passwordForm.newPassword !== passwordForm.confirmPassword
                            }
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
