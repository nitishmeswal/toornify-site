import { useMemo } from "react";
import LaserFlow from "./LaserFlow";

/* ============================================================================
 *  LaserDrips — full-viewport "laser rain" overlay (BACKGROUND layer)
 *  ------------------------------------------------------------------
 *  Visual idea
 *    The original LaserFlow shader paints the beam with a bright flare at the
 *    BOTTOM (where it lands) and the tail fading toward the top — i.e. the
 *    laser is shooting upward / landing on the floor.
 *
 *    For "rain from the sky" we flip every drip vertically (scaleY(-1)) so
 *    the bright BURST is at the TOP of the drip and the beam trails down.
 *    Combined with the falling translateY animation it reads as a laser
 *    dropping out of the sky.
 *
 *  Layers (back → front)
 *    1. TopGlowBar   — pure-CSS aurora running across the very top edge
 *    2. StarStreaks  — many small fast CSS streaks (cheap, up to 40+)
 *    3. LaserDrops   — a few rich WebGL <LaserFlow /> bursts, vertically
 *                      flipped so the flame is at their top
 *
 *  Why the split?
 *    Each <LaserFlow /> creates its own WebGL context and browsers cap
 *    concurrent contexts (~8–16). Mixing real WebGL drops with cheap CSS
 *    streaks gets dense rain without hitting the ceiling.
 * ========================================================================= */

interface LaserDripsProps {
  /** Rich WebGL drops (vertically flipped). Keep ≤ 5. Default 3. */
  laserCount?: number;
  /** CSS streak count. Cheap — go to 40+. Default 26. */
  streakCount?: number;
  /** Hex palette picked from per element. */
  colors?: string[];
  /** z-index of the overlay. Default 0 → sits behind page content. */
  zIndex?: number;
  /** Stable random seed. Default 7. */
  seed?: number;
  /** Show the continuous top glow strip. Default true. */
  showTopGlow?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
}

const DEFAULT_COLORS = [
  "#a855f7",
  "#c084fc",
  "#7c3aed",
  "#d946ef",
  "#8b5cf6",
  "#e879f9",
];

/* deterministic pseudo-random in [0,1) */
function rand(seed: number, i: number, salt: number) {
  const x = Math.sin(seed * 9301 + i * 49297 + salt * 233280) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ types */
interface LaserDropConfig {
  id: number;
  left: number;
  width: number;
  height: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
  flowSpeed: number;
  wispIntensity: number;
}

interface StreakConfig {
  id: number;
  left: number;
  width: number;
  length: number;
  color: string;
  duration: number;
  delay: number;
  travel: number;
  opacity: number;
  blur: number;
  /**
   * 0 = solid gradient streak (fast shooting star)
   * 1 = dashed column (Morse-rain look from reference image 3)
   */
  kind: 0 | 1;
}

/* ------------------------------------------------------------------ build */
function buildLaserDrops(
  count: number,
  colors: string[],
  seed: number
): LaserDropConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (s: number) => rand(seed, i, s);
    const duration = 5 + r(1) * 5; // 5–10 s — slow, dramatic falls
    return {
      id: i,
      left: 8 + r(2) * 84,                  // 8–92%
      width: 100 + Math.floor(r(3) * 90),   // 100–190 px
      height: 280 + Math.floor(r(4) * 240), // 280–520 px
      color: colors[Math.floor(r(5) * colors.length)],
      duration,
      delay: -r(6) * duration,
      opacity: 0.85 + r(7) * 0.15,           // 0.85–1.0 — flames forward
      flowSpeed: 0.6 + r(8) * 0.9,
      wispIntensity: 4 + r(9) * 3,            // a touch hotter
    };
  });
}

function buildStreaks(
  count: number,
  colors: string[],
  seed: number
): StreakConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (s: number) => rand(seed + 1000, i, s);
    const duration = 0.7 + r(1) * 1.6; // 0.7–2.3 s — snappy
    return {
      id: i,
      left: r(2) * 100,
      width: 1.5 + r(3) * 1.5,                // 1.5–3 px
      length: 40 + Math.floor(r(4) * 110),    // 40–150 px
      color: colors[Math.floor(r(5) * colors.length)],
      duration,
      delay: -r(6) * (duration + 2),
      travel: 40 + r(7) * 80,                 // 40–120 vh
      opacity: 0.7 + r(8) * 0.3,              // 0.7–1.0 — clearly visible
      blur: 0.5 + r(9) * 2.5,                 // 0.5–3 px
      kind: r(10) < 0.45 ? 1 : 0,             // ~45% are dashed Morse-style
    };
  });
}

/* ============================================================================
 *  TopGlowBar — horizontal aurora at the very top of the viewport
 * ========================================================================= */
function TopGlowBar({ colors }: { colors: string[] }) {
  const c0 = colors[0] ?? "#a855f7";
  const c2 = colors[2] ?? "#d946ef";
  return (
    <>
      {/* Thin bright core line — clearly visible, but no giant wash */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${c0} 18%, #ffffff 50%, ${c2} 82%, transparent 100%)`,
          filter:
            "drop-shadow(0 0 6px rgba(217,70,239,0.9)) drop-shadow(0 0 14px rgba(168,85,247,0.6))",
          opacity: 1,
        }}
      />
      {/* Subtle short bloom directly under the core (kept tight so it doesn't
         wash out the navbar/hero behind it) */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "70px",
          background: `linear-gradient(180deg,
            rgba(168,85,247,0.18) 0%,
            rgba(168,85,247,0.08) 45%,
            transparent 100%)`,
          filter: "blur(6px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Single traveling shimmer along the core (one is enough) */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: "3px" }}
      >
        <div
          className="absolute inset-y-0"
          style={{
            width: "28%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)",
            filter: "blur(2px)",
            animation: "laserTopShimmer 6s linear infinite",
          }}
        />
      </div>
    </>
  );
}

/* ============================================================================
 *  Main component
 * ========================================================================= */
export default function LaserDrips({
  laserCount = 3,
  streakCount = 26,
  colors = DEFAULT_COLORS,
  zIndex = 0,
  seed = 7,
  showTopGlow = true,
  className = "",
}: LaserDripsProps) {
  const drops = useMemo(
    () => buildLaserDrops(laserCount, colors, seed),
    [laserCount, colors, seed]
  );
  const streaks = useMemo(
    () => buildStreaks(streakCount, colors, seed),
    [streakCount, colors, seed]
  );

  return (
    <div
      aria-hidden
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex }}
    >
      {/* shared keyframes */}
      <style>{`
        @keyframes laserDripFall {
          0%   { transform: translate3d(0, -110%, 0); opacity: 0; }
          8%   { opacity: var(--drip-opacity, 1); }
          88%  { opacity: var(--drip-opacity, 1); }
          100% { transform: translate3d(0, 110vh, 0); opacity: 0; }
        }
        @keyframes laserStreakFall {
          0%   { transform: translate3d(0, -20vh, 0); opacity: 0; }
          10%  { opacity: var(--streak-opacity, 1); }
          85%  { opacity: var(--streak-opacity, 1); }
          100% { transform: translate3d(0, var(--streak-travel, 100vh), 0); opacity: 0; }
        }
        @keyframes laserTopShimmer {
          0%   { transform: translateX(-40%); }
          100% { transform: translateX(140%); }
        }
      `}</style>

      {/* 1) Top glowing aurora strip */}
      {showTopGlow && <TopGlowBar colors={colors} />}

      {/* 2) Cheap CSS streaks (solid + dashed) */}
      {streaks.map((s) => {
        const bg =
          s.kind === 1
            ? // dashed Morse-rain look (reference image 3)
              `repeating-linear-gradient(
                 to bottom,
                 ${s.color} 0px,
                 ${s.color} 7px,
                 transparent 7px,
                 transparent 14px
               )`
            : // solid shooting-star
              `linear-gradient(180deg, transparent 0%, ${s.color} 40%, #ffffff 78%, ${s.color} 92%, transparent 100%)`;

        return (
          <div
            key={`s-${s.id}`}
            className="absolute top-0"
            style={{
              left: `${s.left}%`,
              width: `${s.width}px`,
              height: `${s.length}px`,
              marginLeft: `-${s.width / 2}px`,
              background: bg,
              borderRadius: s.kind === 1 ? "0" : "999px",
              filter: `blur(${s.blur}px) drop-shadow(0 0 5px ${s.color})`,
              ["--streak-opacity" as any]: s.opacity,
              ["--streak-travel" as any]: `${s.travel}vh`,
              animation: `laserStreakFall ${s.duration}s linear ${s.delay}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* 3) Rich WebGL LaserFlow drops — vertically flipped so the bright
            flare sits at the TOP and the beam trails downward, reading as
            a laser falling from the sky. */}
      {drops.map((d) => (
        <div
          key={`l-${d.id}`}
          className="absolute top-0"
          style={{
            left: `${d.left}%`,
            width: `${d.width}px`,
            height: `${d.height}px`,
            marginLeft: `-${d.width / 2}px`,
            ["--drip-opacity" as any]: d.opacity,
            animation: `laserDripFall ${d.duration}s linear ${d.delay}s infinite`,
            willChange: "transform, opacity",
            isolation: "isolate",
          }}
        >
          {/* vertical flip happens on this inner wrapper so the falling
              translateY animation on the parent is unaffected. */}
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: "scaleY(-1)",
              transformOrigin: "center center",
            }}
          >
            <LaserFlow
              color={d.color}
              wispDensity={0.55}
              fogIntensity={0.28}
              fogScale={0.4}
              wispIntensity={d.wispIntensity}
              wispSpeed={20}
              flowSpeed={d.flowSpeed}
              flowStrength={0.35}
              verticalSizing={1.6}
              horizontalSizing={0.25}
              decay={1.1}
              falloffStart={1.2}
              mouseTiltStrength={0}
              mouseSmoothTime={0}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
