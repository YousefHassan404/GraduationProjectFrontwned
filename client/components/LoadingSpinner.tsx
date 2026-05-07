import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    /** Size in pixels (default: 32) */
    size?: number;
    /** Optional message shown below the spinner */
    message?: string;
    /** Fill the full viewport height */
    fullScreen?: boolean;
    /** Extra class names for the wrapper */
    className?: string;
}

/**
 * Shared loading spinner used across all pages.
 * Replaces the inconsistent inline spinners in Chat, Predict, Predict3d, etc.
 */
export function LoadingSpinner({
    size = 32,
    message,
    fullScreen = false,
    className,
}: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                fullScreen ? "min-h-screen" : "min-h-[calc(100vh-64px)]",
                className
            )}
        >
            <Loader2
                size={size}
                className="animate-spin text-blue-500"
                aria-label="Loading"
            />
            {message && (
                <p className="text-slate-400 text-sm">{message}</p>
            )}
        </div>
    );
}
