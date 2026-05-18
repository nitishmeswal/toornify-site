import { useEffect, useState } from "react";
import LaserDrips from "./LaserDrips";
// NeonWireMeshes intentionally not imported — the user is curating their own
// 3D objects manually. Re-enable later by importing and remounting below.

/* ============================================================================
 *  GlobalBackground
 *  ----------------
 *  Site-wide atmospheric backdrop. Mount ONCE near the top of the React tree
 *  (see <AppContent /> in `@/App.tsx`). It paints, in order from back to front:
 *
 *    1. <video>        — the looped MP4 in `/public/mp_ (1).mp4`
 *    2. dark scrim     — preserves the dark/purple theme + readability of
 *                        text content placed over it
 *    3. <LaserDrips/>  — the existing laser-rain overlay (now global)
 *
 *  All layers are `position: fixed inset-0 pointer-events-none` so they cover
 *  the viewport without intercepting clicks. Page content paints on top
 *  thanks to the natural stacking order.
 *
 *  IMPORTANT: For the video to actually be VISIBLE on a given page, that
 *  page's root wrapper MUST NOT have a fully-opaque background color. We've
 *  already made `@/components/Layout.tsx` and `@/pages/HomeNew.tsx` use a
 *  transparent / translucent root. Other pages that still set their own
 *  `bg-[#xxxxxx]` on the root will hide the video locally — that's intended
 *  per-page opt-in, not a bug.
 * ========================================================================= */

interface Props {
  /** 0..1 — how dark the scrim is. 0 = video at full brightness, 1 = solid. */
  scrimOpacity?: number;
  /** Disable the LaserDrips overlay if you only want the video. */
  showLasers?: boolean;
  /** Desktop video. */
  videoSrc?: string;
  /** Mobile-optimised video (drop file at /public/mp_mobile.mp4). */
  videoSrcMobile?: string;
  /** Width breakpoint (px) below which we switch to the mobile video. */
  mobileBreakpoint?: number;
}

export default function GlobalBackground({
  scrimOpacity = 0.45,
  showLasers = true,
  // %20 is the URL-encoded space. The file on disk is `mp_ (1).mp4` in /public
  videoSrc = "/mp_%20(1).mp4",
  videoSrcMobile = "/mp_mobile.mp4",
  mobileBreakpoint = 768,
}: Props) {
  // Resolve which video to load on mount + on viewport resize. Doing it in JS
  // (instead of a CSS-only swap) lets us actually load only ONE file, which
  // matters because the video is multi-MB.
  const [src, setSrc] = useState(videoSrc);
  useEffect(() => {
    const pick = () =>
      window.innerWidth <= mobileBreakpoint ? videoSrcMobile : videoSrc;
    setSrc(pick());
    const onResize = () => setSrc(pick());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [videoSrc, videoSrcMobile, mobileBreakpoint]);
  return (
    <>
      {/* ----------------------------------------------------------------
       *  Layer 1+2 — video + dark scrim, fixed full viewport
       *  zIndex 0 (default for fixed). Page content with no/transparent
       *  bg will let it show through; pages with opaque bg will hide it
       *  locally — that's by design.
       * ---------------------------------------------------------------- */}
      <div
        aria-hidden
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <video
          // `key` forces React to remount <video> when the source URL flips
          // (desktop ↔ mobile) so the new asset actually loads & autoplays.
          key={src}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundColor: "#070310",
            // ZOOM: scale up so the video bleeds past the viewport edges
            // instead of leaving cropped/dead zones on the sides at wide
            // aspect ratios. transform-origin: center keeps the action
            // centered. Slight blur + lowered saturation softens the
            // shapes baked into the source clip (solid pyramids, colored
            // cubes) so they read as ambient atmosphere rather than
            // competing with the WebGL neon-wireframe meshes on top.
            transform: "scale(1.22)",
            transformOrigin: "center center",
            filter: "blur(3px) saturate(0.85) brightness(0.9)",
          }}
        />
        {/* dark/purple-tinted scrim so foreground content stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(7,3,16,${scrimOpacity * 0.95}) 0%,
              rgba(7,3,16,${scrimOpacity}) 50%,
              rgba(7,3,16,${Math.min(1, scrimOpacity + 0.15)}) 100%)`,
          }}
        />
      </div>

      {/* ----------------------------------------------------------------
       *  Layer 3 — LaserDrips (already a fixed full-viewport overlay).
       *  zIndex above the video/scrim but configurable so a page can mask
       *  it locally if needed.
       * ---------------------------------------------------------------- */}
      {/* Layer 2.5 (Neon wireframe meshes) — removed at user request; they
          will be curating their own 3D objects manually for now. */}

      {showLasers && <LaserDrips laserCount={4} streakCount={42} zIndex={5} />}
    </>
  );
}
