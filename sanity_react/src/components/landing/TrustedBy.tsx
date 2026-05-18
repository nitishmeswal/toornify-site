const partners = [
  { name: "NODWIN", sub: "GAMING" },
  { name: "SKYESPORTS", sub: "" },
  { name: "THE ESPORTS", sub: "CLUB" },
  { name: "TEAM SOUL", sub: "" },
  { name: "GLOBAL", sub: "ESPORTS" },
  { name: "S8UL", sub: "" },
  { name: "TSM", sub: "" },
];

export default function TrustedBy() {
  return (
    <section className="relative py-14 border-y border-white/5">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 mb-8">
          Trusted by Top Gaming Communities & Organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center text-gray-400 hover:text-white transition-colors group cursor-default"
            >
              <span className="text-lg font-black tracking-wider group-hover:text-purple-300">{p.name}</span>
              {p.sub && <span className="text-[10px] tracking-widest text-gray-600">{p.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
