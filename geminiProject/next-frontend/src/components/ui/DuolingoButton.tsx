"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DuolingoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "disabled"
    | "icon"
    | "destructive"
    | "dashedOutline"
    | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  loading?: boolean;
}

export const baseStyles =
  "font-semibold w-full rounded-lg relative transition-transform active:translate-y-0.5 active:shadow-none focus:outline-none flex items-center justify-center focus-visible:ring-2 focus-visible:ring-transparent focus-visible:ring-offset-2";

export const variantStyles = {
  primary:
    "border border-b-2 border-primary/80 bg-primary bg-clip-padding text-primary-foreground shadow-[0_3px_0_var(--ring)] hover:bg-primary/90 focus-visible:ring-ring",
  secondary:
    "border border-b-2 border-border bg-secondary bg-clip-padding text-secondary-foreground shadow-[0_3px_0_var(--border)] hover:bg-secondary/80 focus-visible:ring-ring",
  disabled:
    "cursor-not-allowed border-b-2 border-border bg-muted text-muted-foreground shadow-[0_3px_0_var(--border)]",
  icon: "flex items-center justify-center border-b-2 border-primary/80 bg-primary p-0 text-primary-foreground shadow-[0_3px_0_var(--ring)] hover:bg-primary/90 focus:ring-ring focus-visible:ring-ring",
  destructive:
    "border-b-2 border-destructive/80 bg-destructive text-destructive-foreground shadow-[0_3px_0_var(--destructive)] hover:bg-destructive/90 focus:ring-destructive",
  dashedOutline:
    "border-2 border-b-[4px] border-dashed border-border bg-background bg-clip-padding text-foreground hover:bg-accent focus:ring-ring",
  emerald:
    "border border-b-2 border-primary/80 bg-primary bg-clip-padding text-primary-foreground shadow-[0_3px_0_var(--ring)] hover:bg-primary/90 focus:ring-ring",
};

export const sizeStyles = {
  sm: "text-sm py-2 px-4",
  md: "text-base py-3 px-6",
  lg: "text-lg py-4 px-8",
  icon: "h-10 w-10",
};

const DuolingoButton = forwardRef<HTMLButtonElement, DuolingoButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      disabled,
      loading = false,
      ...props
    },
    ref
  ) => {
    const variantStyle =
      disabled || loading ? variantStyles.disabled : variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyle, sizeStyle, className)}
        disabled={disabled || loading || variant === "disabled"}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner variant={variant} />
            {size !== "icon" && (
              <span className="ml-2 opacity-80">Loading...</span>
            )}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

DuolingoButton.displayName = "DuolingoButton";

export default DuolingoButton;

export function LoadingSpinner({ variant }: { variant: string }) {
  const spinnerColor =
    variant === "secondary" || variant === "dashedOutline"
      ? "text-muted-foreground"
      : "text-primary-foreground";

  return (
    <svg
      className={`h-5 w-5 animate-spin ${spinnerColor}`}
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
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
