const recognitions = [
  { name: "NVIDIA", sub: "Inception Program" },
  { name: "ISB", sub: "" },
  { name: "MICROSOFT", sub: "for Startups" },
  { name: "ATAL", sub: "Incubation Centre" },
  { name: "WADHWANI", sub: "Foundation" },
  { name: "FIRSTWINGS", sub: "" },
];

export default function TrustedBy() {
  return (
    <section className="relative py-10 sm:py-14 border-y border-white/5">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <p className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 mb-6 sm:mb-8">
          Recognised & Backed By
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6">
          {recognitions.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center text-gray-400 hover:text-white transition-colors group cursor-default"
            >
              <span className="text-sm sm:text-lg font-black tracking-wider group-hover:text-purple-300">{p.name}</span>
              {p.sub && <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-600">{p.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
