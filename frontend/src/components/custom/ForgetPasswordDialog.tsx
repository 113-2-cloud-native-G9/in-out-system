import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ForgetPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ForgetPasswordDialog({ isOpen, onClose }: ForgetPasswordDialogProps) {
    const tenorScriptRef = useRef<HTMLScriptElement | null>(null);

    // Load Tenor script when component mounts or when dialog opens
    useEffect(() => {
        if (isOpen && !tenorScriptRef.current) {
            const script = document.createElement("script");
            script.src = "https://tenor.com/embed.js";
            script.async = true;
            script.type = "text/javascript";
            document.body.appendChild(script);
            tenorScriptRef.current = script;
        }

        // Cleanup function to remove the script when component unmounts
        return () => {
            if (tenorScriptRef.current && !isOpen) {
                document.body.removeChild(tenorScriptRef.current);
                tenorScriptRef.current = null;
            }
        };
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forget Password</DialogTitle>
                    <DialogDescription>
                        請聯繫系統管理員重置密碼
                        email: <a
                            href="mailto:nanyibi@ntu.edu.tw"
                            className="text-primary hover:underline">nanyibi@ntu.edu.tw
                        </a>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Tenor GIF embed */}
                    <div
                        className="tenor-gif-embed"
                        data-postid="25939163"
                        data-share-method="host"
                        data-aspect-ratio="1"
                        data-width="100%"
                    >
                        <a href="https://tenor.com/view/5555-gif-25939163">5555 GIF</a>
                        from <a href="https://tenor.com/search/5555-gifs">5555 GIFs</a>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>關閉</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}