import { useRef, useState, type ReactNode, type MouseEvent } from "react";

/* ============================================================================
 *  TiltCard
 *  --------
 *  React port of the Uiverse `00Kubi` cyber-card, simplified to use a
 *  pointer-tracked rotation instead of the original 5×5 hover-zone trick.
 *  It produces an identical visual result with one event listener per card
 *  instead of 25 sibling hover targets.
 *
 *  Decorations layered on top of the children:
 *    - corner brackets (4)        — light up on hover with a purple glow
 *    - animated scan line         — vertical sweep on hover
 *    - cyber edge lines           — 4 horizontal rules that grow/fade
 *    - corner glare               — subtle moving highlight
 *    - particle dots              — small float-out specks on hover
 *
 *  Children are rendered as the *content* of the card and receive no
 *  special treatment — pass any JSX you want.
 * ========================================================================= */
interface TiltCardProps {
  children: ReactNode;
  /** Max tilt in degrees on either axis. Default 12. */
  maxTilt?: number;
  /** Adds a className on the outer perspective wrapper. */
  className?: string;
  /** Adds a className on the inner rotated card surface. */
  innerClassName?: string;
}

export default function TiltCard({
  children,
  maxTilt = 12,
  className = "",
  innerClassName = "",
}: TiltCardProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      // invert Y for natural "lean toward cursor" feel
      rx: -(py - 0.5) * 2 * maxTilt,
      ry: (px - 0.5) * 2 * maxTilt,
      mx: px * 100,
      my: py * 100,
    });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  }

  return (
    <div
      className={`group relative ${className}`}
      style={{ perspective: 900 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={surfaceRef}
        className={`relative rounded-2xl will-change-transform ${innerClassName}`}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 140ms ease-out",
        }}
      >
        {/* CARD CONTENT */}
        {children}

        {/* CORNER BRACKETS — light up on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-2 left-2 w-3.5 h-3.5 border-l-2 border-t-2 border-purple-400/40 group-hover:border-purple-300 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.55)] transition-all duration-300 rounded-[2px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-2 right-2 w-3.5 h-3.5 border-r-2 border-t-2 border-purple-400/40 group-hover:border-purple-300 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.55)] transition-all duration-300 rounded-[2px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-2 w-3.5 h-3.5 border-l-2 border-b-2 border-purple-400/40 group-hover:border-purple-300 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.55)] transition-all duration-300 rounded-[2px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-2 w-3.5 h-3.5 border-r-2 border-b-2 border-purple-400/40 group-hover:border-purple-300 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.55)] transition-all duration-300 rounded-[2px]"
        />

        {/* CYBER EDGE LINES — animated horizontal scans */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute left-0 top-[20%] h-px w-full bg-gradient-to-r from-transparent via-purple-400/35 to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          <span className="absolute left-0 top-[50%] h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400/35 to-transparent origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
          <span className="absolute left-0 top-[80%] h-px w-full bg-gradient-to-r from-transparent via-blue-400/35 to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200" />
        </div>

        {/* DIRECTIONAL GLARE following pointer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
          style={{
            background: `radial-gradient(380px circle at ${tilt.mx}% ${tilt.my}%, rgba(168,85,247,0.28), rgba(124,58,237,0.10) 35%, transparent 65%)`,
          }}
        />

        {/* SCAN LINE — vertical sweep using existing global animate-scan-line */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="animate-scan-line absolute inset-0" />
        </div>

        {/* CORNER GLOW BLOBS */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-purple-500/0 group-hover:bg-purple-500/30 blur-2xl transition-colors duration-500" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-fuchsia-500/0 group-hover:bg-fuchsia-500/25 blur-2xl transition-colors duration-500" />
        </div>

        {/* PARTICLE SPECKS — float out on hover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          {[
            { left: "20%", top: "40%", dx: 30, dy: -30, delay: "0s" },
            { left: "78%", top: "62%", dx: -28, dy: -26, delay: "0.4s" },
            { left: "42%", top: "22%", dx: 18, dy: 30, delay: "0.8s" },
            { left: "60%", top: "82%", dx: -20, dy: 28, delay: "1.2s" },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.9)] opacity-0 group-hover:opacity-100"
              style={{
                left: p.left,
                top: p.top,
                animation: `tiltSpeck 2.2s ease-in-out ${p.delay} infinite`,
                ["--dx" as any]: `${p.dx}px`,
                ["--dy" as any]: `${p.dy}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
