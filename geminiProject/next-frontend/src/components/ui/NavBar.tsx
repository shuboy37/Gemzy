import { Share2 } from "lucide-react";

export const NavBar = () => {
  return (
    <div className="h-14 overflow-hidden border-b-[1px] bg-transparent">
      <div className="relative flex h-full w-full items-center px-3 py-4">
        <button className="absolute right-8 flex items-center justify-center space-x-[6px] rounded-lg bg-transparent p-3 transition-all duration-200 ease-in-out hover:bg-neutral-700 active:scale-95 active:duration-75">
          <Share2 className="h-4 w-4 text-white" />
          <span className="font-semibold tracking-normal text-pretty whitespace-nowrap text-white">
            Share
          </span>
        </button>
      </div>
    </div>
  );
};
