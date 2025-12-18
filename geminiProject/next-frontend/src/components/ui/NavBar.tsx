import {
  MessageSquareShare,
  ChevronsLeftRight,
  Search,
  MessageSquarePlus,
  Images,
} from "lucide-react";
import { ConditionalTooltip } from "./ConditionalTooltip";

interface NavBarProps {
  isCollapsible: boolean;
  setIsCollapsible?: (value: boolean) => void;
}

export const NavBar = ({ isCollapsible, setIsCollapsible }: NavBarProps) => {
  return (
    <div className="h-full w-full overflow-hidden bg-transparent">
      <div className="relative flex h-full w-full items-center justify-between px-3 py-4">
        {isCollapsible && (
          <div className="absolute left-6 flex h-12 w-44 divide-x divide-neutral-700 overflow-hidden rounded-xl border border-neutral-700 bg-black/20">
            <ConditionalTooltip
              content="Expand Sidebar"
              side="bottom"
              showTooltip={true}
            >
              <ChevronsLeftRight
                onClick={() => setIsCollapsible && setIsCollapsible(false)}
                className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-white transition-all duration-200 ease-in-out hover:bg-neutral-800 active:scale-95 active:duration-75"
              />
            </ConditionalTooltip>
            <ConditionalTooltip
              content="New Chat"
              side="bottom"
              showTooltip={true}
            >
              <MessageSquarePlus className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-white transition-all duration-200 ease-in-out hover:bg-neutral-800 active:scale-95 active:duration-75" />
            </ConditionalTooltip>
            <ConditionalTooltip
              content="Search"
              side="bottom"
              showTooltip={true}
            >
              <Search className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-white transition-all duration-200 ease-in-out hover:bg-neutral-800 active:scale-95 active:duration-75" />
            </ConditionalTooltip>
            <ConditionalTooltip
              content="Library"
              side="bottom"
              showTooltip={true}
            >
              <Images className="flex h-full w-11 cursor-pointer items-center justify-center p-3 text-white transition-all duration-200 ease-in-out hover:bg-neutral-800 active:scale-95 active:duration-75" />
            </ConditionalTooltip>
          </div>
        )}

        <ConditionalTooltip
          content="Share Chat"
          side="bottom"
          showTooltip={true}
        >
          <button className="absolute right-8 flex items-center justify-center rounded-lg border border-neutral-700 bg-black/20 p-3 transition-all duration-200 ease-in-out hover:bg-neutral-800 active:scale-95 active:duration-75">
            <MessageSquareShare className="size-4 text-white" />
          </button>
        </ConditionalTooltip>
      </div>
    </div>
  );
};
