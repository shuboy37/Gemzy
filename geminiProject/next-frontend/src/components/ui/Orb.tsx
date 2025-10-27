"use client";

interface OrbProps {
  className?: string;
}

export function Orb({ className = "" }: OrbProps) {
  return (
    <div className={`orb-container relative h-12 w-12 ${className}`}>
      {/* Outer Aura Layer */}
      <div className="orb-aura absolute -inset-2 rounded-full"></div>
      {/* Middle Energy Layer */}
      <div className="orb-energy absolute -inset-1 rounded-full"></div>
      {/* Inner Core Layer */}
      <div className="orb-core absolute inset-0 rounded-full"></div>
      {/* Center Spark */}
      <div className="orb-spark absolute inset-3 rounded-full"></div>
    </div>
  );
}
