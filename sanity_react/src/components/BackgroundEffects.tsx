export function BackgroundEffects() {
  return (
    <>
      {/* Background effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
      ></div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>
    </>
  );
}
