import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Animated floating geometric shapes (cubes, triangles, dots)
 * for the dark gaming aesthetic background.
 */
export default function BackgroundParticles({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const colors = ["#7c3aed", "#a855f7", "#3b82f6", "#06b6d4", "#ec4899"];
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < 25; i++) {
      const isBox = Math.random() > 0.5;
      const geo = isBox ? new THREE.BoxGeometry(0.4, 0.4, 0.4) : new THREE.TetrahedronGeometry(0.35);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.25,
        wireframe: Math.random() > 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      meshes.push(mesh);

      gsap.to(mesh.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 6 + Math.random() * 10, repeat: -1, ease: "none" });
      gsap.to(mesh.position, {
        y: mesh.position.y + (Math.random() - 0.5) * 2,
        duration: 3 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    let frame = 0;
    const tick = () => {
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
