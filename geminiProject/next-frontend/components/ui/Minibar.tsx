"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  MessageSquarePlus,
  Images,
  ChevronsUpDown,
} from "lucide-react";
import { ConditionalTooltip } from "./ConditionalTooltip";

export const MiniBar = ({
  setIsCollapsible,
  className,
}: {
  setIsCollapsible: (prev: boolean) => void;
  className?: string;
}) => {
  const [position, setPosition] = useState({ x: 56, y: 112 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const minibarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minibarWidth = 44;
    const minibarHeight = 384;

    const constrainedX = Math.max(
      0,
      Math.min(newX, viewportWidth - minibarWidth)
    );
    const constrainedY = Math.max(
      0,
      Math.min(newY, viewportHeight - minibarHeight)
    );

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <div
      ref={minibarRef}
      onMouseDown={handleMouseDown}
      className={`${className} absolute h-96 w-11 cursor-move rounded-3xl bg-gradient-to-b from-white/20 via-white/65 to-white/20 select-none ${
        isDragging ? "z-50" : "z-10"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        boxShadow:
          "0 15px 35px rgba(255, 255, 255, 0.12), " +
          "0 -15px 35px rgba(255, 255, 255, 0.12), " +
          "0 0 20px rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex h-full w-full flex-col py-3">
        <div className="flex h-full flex-col items-center rounded-3xl">
          <ConditionalTooltip
            content="New chat"
            showTooltip={true}
            side="right"
            className="ml-0"
          >
            <MessageSquarePlus className="h-10 w-10 flex-1 cursor-pointer rounded-3xl p-2 text-white transition-all ease-in-out hover:scale-110 hover:bg-black/75" />
          </ConditionalTooltip>
          <ConditionalTooltip
            content="Search"
            showTooltip={true}
            side="right"
            className="ml-0"
          >
            <Search className="h-10 w-10 flex-1 cursor-pointer rounded-3xl p-2 text-white transition-all ease-in-out hover:scale-110 hover:bg-black/75" />
          </ConditionalTooltip>
          <ConditionalTooltip
            content="Expand Sidebar"
            showTooltip={true}
            side="right"
            className="ml-0"
          >
            <ChevronsUpDown
              onClick={() => setIsCollapsible(false)}
              className="h-10 w-10 flex-1 cursor-pointer rounded-3xl p-2 text-white transition-all ease-in-out hover:scale-110 hover:bg-black/75"
            />
          </ConditionalTooltip>
          <ConditionalTooltip
            content="Images"
            showTooltip={true}
            side="right"
            className="ml-0"
          >
            <Images className="h-10 w-10 flex-1 cursor-pointer rounded-3xl p-2 text-white transition-all ease-in-out hover:scale-110 hover:bg-black/75" />
          </ConditionalTooltip>
        </div>
      </div>
    </div>
  );
};
