import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================================
 *  NeonWireMeshes
 *  --------------
 *  Site-wide background ornament: a fixed full-viewport canvas that renders
 *  edges-only wireframe primitives (cubes + cones) in neon purple / blue /
 *  pink. Only the *edges* are drawn (THREE.EdgesGeometry + LineSegments) so
 *  there are NO opaque face surfaces — i.e. no big "X" diagonal across cubes,
 *  no filled cone caps.
 *
 *  Meshes are deliberately clustered on the LEFT and RIGHT sides of the
 *  viewport (avoiding a vertical safe-zone in the middle so they don't fight
 *  page content). They drift, rotate, and bob slowly.
 *
 *  Mount once inside <GlobalBackground />. zIndex/pointer-events are handled
 *  by the parent wrapper there.
 * ========================================================================= */

interface Props {
  /** Total number of meshes to scatter. Split between left & right halves. */
  count?: number;
  /** CSS opacity of the canvas (whole layer). */
  opacity?: number;
  /** Disable the inner bloom-ish additive glow halo (cheaper). */
  showGlow?: boolean;
}

const NEON_COLORS = [
  0xa855f7, // neon purple
  0x7c3aed, // deep violet
  0xc084fc, // light purple
  0x3b82f6, // neon blue
  0x60a5fa, // sky blue
  0xec4899, // neon pink
  0xf472b6, // light pink
];

export default function NeonWireMeshes({
  count = 14,
  opacity = 0.55,
  showGlow = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ----------------------------- scene basics --------------------------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    mount.appendChild(renderer.domElement);

    /* --------------------- spawn helper: edges-only mesh ------------------ */
    type Drift = {
      group: THREE.Group;
      rotSpeed: THREE.Vector3;
      bobAmp: number;
      bobSpeed: number;
      bobPhase: number;
      basePos: THREE.Vector3;
      // Pulse / blink — drives line + halo opacity sinusoidally for the
      // "glowing-edge breathing" look the user asked for. A small subset
      // of meshes get a faster, bigger pulse so they read as "blinking".
      pulseSpeed: number;
      pulsePhase: number;
      pulseDepth: number; // how much amplitude (0 = none, 1 = fully blinks)
      lineMat: THREE.LineBasicMaterial;
      haloMat: THREE.LineBasicMaterial | null;
      lineBaseOpacity: number;
      haloBaseOpacity: number;
    };
    const drifters: Drift[] = [];

    const makeMesh = (i: number) => {
      // pick primitive — alternate cube/cone for variety
      const isCone = i % 2 === 0;
      const size = 0.9 + Math.random() * 1.6;

      const geo: THREE.BufferGeometry = isCone
        ? new THREE.ConeGeometry(size * 0.7, size * 1.4, 4 + Math.floor(Math.random() * 3))
        : new THREE.BoxGeometry(size, size, size);

      // EdgesGeometry strips out triangle face-diagonals — gives the clean
      // box-frame look (no "X" across each face) the user asked for.
      const edges = new THREE.EdgesGeometry(geo, 1);
      const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

      const lineBaseOpacity = 0.95;
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: lineBaseOpacity,
        // additive blending makes neon overlap glow rather than darken
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        // Hint to the GPU that opacity will change every frame.
        // (LineBasicMaterial doesn't strictly need needsUpdate for opacity,
        //  but flagging keeps engine assumptions tidy.)
      });
      const lines = new THREE.LineSegments(edges, lineMat);

      const group = new THREE.Group();
      group.add(lines);

      // Beefier glow halo — gives the "glowing edges" feel (bloom-lite
      // without an actual postprocess pass). Two stacked halos at slightly
      // different scales = soft outer falloff.
      let haloMat: THREE.LineBasicMaterial | null = null;
      const haloBaseOpacity = 0.42;
      if (showGlow) {
        haloMat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: haloBaseOpacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.LineSegments(edges, haloMat);
        halo.scale.setScalar(1.22);
        group.add(halo);

        // outer soft halo (lower opacity, bigger scale) for the bloom feel
        const outerHaloMat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const outerHalo = new THREE.LineSegments(edges, outerHaloMat);
        outerHalo.scale.setScalar(1.55);
        group.add(outerHalo);
      }

      // discard the source filled geometry — we only ever drew its edges
      geo.dispose();

      // Distribute meshes across the FULL viewport (not just the side
      // gutters) so they don't cluster in one place. We still bias slightly
      // toward the edges by skipping a small central dead-zone for the
      // densest cluster, but every mesh has a chance to live anywhere.
      const xRaw = (Math.random() - 0.5) * 22; // -11..+11
      // Push values that fell into the [-2, +2] center band outward so
      // text content stays readable but the field still feels distributed.
      const x = Math.abs(xRaw) < 2 ? xRaw + (xRaw < 0 ? -2 : 2) : xRaw;
      const y = (Math.random() - 0.5) * 16;
      const z = -2 - Math.random() * 10;
      group.position.set(x, y, z);
      group.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(group);

      // ~1 in 3 meshes get a snappy "blink" pulse; the rest breathe slowly.
      const isBlinker = Math.random() < 0.33;
      drifters.push({
        group,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.15
        ),
        bobAmp: 0.3 + Math.random() * 0.6,
        bobSpeed: 0.2 + Math.random() * 0.4,
        bobPhase: Math.random() * Math.PI * 2,
        basePos: group.position.clone(),
        pulseSpeed: isBlinker ? 2.2 + Math.random() * 1.4 : 0.7 + Math.random() * 0.6,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseDepth: isBlinker ? 0.55 : 0.28,
        lineMat,
        haloMat,
        lineBaseOpacity,
        haloBaseOpacity,
      });
    };

    for (let i = 0; i < count; i++) makeMesh(i);

    /* --------------------------- animation loop --------------------------- */
    let rafId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta() + 1 / 60, 0.05); // smoothed dt

      for (const d of drifters) {
        d.group.rotation.x += d.rotSpeed.x * dt;
        d.group.rotation.y += d.rotSpeed.y * dt;
        d.group.rotation.z += d.rotSpeed.z * dt;
        d.group.position.y =
          d.basePos.y + Math.sin(t * d.bobSpeed + d.bobPhase) * d.bobAmp;

        // Pulse / blink: drive line + halo opacity around their base values.
        // Range = base * (1 ± depth). Stays bounded in [0, 1].
        const pulse = Math.sin(t * d.pulseSpeed + d.pulsePhase); // -1..1
        const lineOp = Math.max(
          0,
          Math.min(1, d.lineBaseOpacity * (1 + pulse * d.pulseDepth))
        );
        d.lineMat.opacity = lineOp;
        if (d.haloMat) {
          // Halo pulses harder so the "glow" reads visibly even at small sizes.
          const haloOp = Math.max(
            0,
            Math.min(1, d.haloBaseOpacity * (1 + pulse * d.pulseDepth * 1.6))
          );
          d.haloMat.opacity = haloOp;
        }
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    /* ------------------------------- resize ------------------------------- */
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ----------------------------- pause on tab hide ---------------------- */
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else tick();
    };
    document.addEventListener("visibilitychange", onVis);

    /* ------------------------------ cleanup ------------------------------- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      drifters.forEach((d) => {
        d.group.traverse((obj: THREE.Object3D) => {
          const ls = obj as THREE.LineSegments;
          if (ls.geometry?.dispose) ls.geometry.dispose();
          const mat = ls.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose?.();
        });
        scene.remove(d.group);
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [count, showGlow]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ opacity, zIndex: 1, mixBlendMode: "screen" }}
    />
  );
}
