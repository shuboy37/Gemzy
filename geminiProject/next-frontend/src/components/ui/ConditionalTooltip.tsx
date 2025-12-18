import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

interface ConditionalTooltipProps {
  content: string;
  showTooltip: boolean;
  children: React.ReactNode;
  side: "top" | "right" | "bottom" | "left";
  className?: string;
  arrowClassName?: string;
}

export const ConditionalTooltip = ({
  content,
  side,
  showTooltip,
  children,
  className,
  arrowClassName,
}: ConditionalTooltipProps) => {
  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className={`ml-2.5 scale-100 bg-stone-100 px-2 py-1 text-xs text-stone-800 transition-all duration-200 ${className}`}
          arrowClassName={arrowClassName}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }
  return <>{children}</>;
};
