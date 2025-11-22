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
          className={`text-normal ml-2.5 scale-105 bg-stone-100 p-2.5 text-stone-800 transition-all duration-200 ${className}`}
          arrowClassName={arrowClassName}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }
  return <>{children}</>;
};
