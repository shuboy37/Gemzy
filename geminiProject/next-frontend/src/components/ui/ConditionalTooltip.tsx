import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

interface ConditionalTooltipProps {
  content: string;
  showTooltip: boolean;
  children: React.ReactNode;
  side: "top" | "right" | "bottom" | "left";
  className?: string;
  arrowClassName?: string;
  wrapperClassName?: string;
}

export const ConditionalTooltip = ({
  content,
  side,
  showTooltip,
  children,
  className,
  arrowClassName,
  wrapperClassName,
}: ConditionalTooltipProps) => {
  if (!showTooltip) {
    return <>{children}</>;
  }

  const trigger = React.isValidElement(children) ? children : <span>{children}</span>;

  return (
    <span className={cn("inline-flex", wrapperClassName)}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={10}
          className={cn(
            "z-[160] rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xl ring-1 ring-black/10 dark:ring-white/15",
            className
          )}
          arrowClassName={cn(
            "border border-border bg-background ring-1 ring-black/10 dark:ring-white/15",
            arrowClassName
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </span>
  );
};
