export const DarkRadialLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      {/* Theme-aware radial glow background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle 500px at 50% 200px, color-mix(in srgb, var(--primary) 18%, transparent), transparent)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
