import { cn } from "@/lib/utils";

interface LoaderProps {
  variant?: "pulse" | "dots" | "spinner";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ variant = "spinner", size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "rounded-full bg-purple-500 animate-pulse",
            sizeClasses[size]
          )}
        />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "rounded-full bg-purple-500 animate-bounce",
            sizeClasses[size]
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-purple-400 animate-bounce",
            sizeClasses[size]
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-purple-600 animate-bounce",
            sizeClasses[size]
          )}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className={cn("animate-spin text-purple-500", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}
