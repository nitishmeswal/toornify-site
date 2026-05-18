import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * ModelViewer — Loads a JSON scene description and renders it with three.js.
 *
 * The JSON structure expected:
 * {
 *   "background": "transparent" | "#000",
 *   "camera": { "fov": 45, "position": [0, 0, 6] },
 *   "lights": [
 *     { "type": "ambient", "color": "#ffffff", "intensity": 0.6 },
 *     { "type": "point", "color": "#a855f7", "intensity": 2, "position": [3, 3, 3] }
 *   ],
 *   "objects": [
 *     {
 *       "id": "controller",
 *       "geometry": { "type": "box", "args": [1, 1, 1] },
 *       "material": { "type": "standard", "color": "#7c3aed", "metalness": 0.6, "roughness": 0.2 },
 *       "position": [0, 0, 0],
 *       "rotation": [0, 0, 0],
 *       "scale": [1, 1, 1]
 *     }
 *   ],
 *   "animations": [
 *     { "target": "controller", "property": "rotation.y", "to": 6.28, "duration": 8, "repeat": -1, "ease": "none" },
 *     { "target": "controller", "property": "position.y", "to": 0.2, "duration": 2, "repeat": -1, "yoyo": true, "ease": "sine.inOut" }
 *   ]
 * }
 *
 * If a `gltfUrl` is provided in an object, it will be loaded via GLTFLoader (when added later).
 */

export interface ModelViewerProps {
  scene: any; // JSON scene definition
  className?: string;
  /** Optional callback once the scene is initialised */
  onReady?: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }) => void;
}

const buildGeometry = (def: any): THREE.BufferGeometry => {
  const { type, args = [] } = def || {};
  switch (type) {
    case "box":
      return new THREE.BoxGeometry(...(args.length ? args : [1, 1, 1]));
    case "sphere":
      return new THREE.SphereGeometry(...(args.length ? args : [0.7, 32, 32]));
    case "cone":
      return new THREE.ConeGeometry(...(args.length ? args : [0.6, 1.4, 32]));
    case "cylinder":
      return new THREE.CylinderGeometry(...(args.length ? args : [0.5, 0.5, 1.2, 32]));
    case "torus":
      return new THREE.TorusGeometry(...(args.length ? args : [0.6, 0.18, 16, 64]));
    case "plane":
      return new THREE.PlaneGeometry(...(args.length ? args : [2, 2]));
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
};

const buildMaterial = (def: any): THREE.Material => {
  const { type = "standard", color = "#a855f7", emissive, emissiveIntensity = 1, metalness = 0.5, roughness = 0.3, opacity = 1, transparent = false, wireframe = false } = def || {};
  switch (type) {
    case "basic":
      return new THREE.MeshBasicMaterial({ color, transparent, opacity, wireframe });
    case "phong":
      return new THREE.MeshPhongMaterial({ color, emissive, transparent, opacity, wireframe });
    case "standard":
    default:
      return new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        emissive: emissive || "#000000",
        emissiveIntensity,
        transparent,
        opacity,
        wireframe,
      });
  }
};

const buildLight = (def: any): THREE.Light => {
  const { type, color = "#ffffff", intensity = 1, position, distance, decay } = def || {};
  let light: THREE.Light;
  switch (type) {
    case "ambient":
      light = new THREE.AmbientLight(color, intensity);
      break;
    case "directional":
      light = new THREE.DirectionalLight(color, intensity);
      break;
    case "point":
      light = new THREE.PointLight(color, intensity, distance, decay);
      break;
    case "hemisphere":
      light = new THREE.HemisphereLight(color, def.groundColor || "#222222", intensity);
      break;
    default:
      light = new THREE.AmbientLight(color, intensity);
  }
  if (position && (light as any).position) (light as any).position.set(...position);
  return light;
};

export default function ModelViewer({ scene, className, onReady }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scene) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const threeScene = new THREE.Scene();
    if (scene.background && scene.background !== "transparent") {
      threeScene.background = new THREE.Color(scene.background);
    }

    const camDef = scene.camera || {};
    const camera = new THREE.PerspectiveCamera(camDef.fov ?? 45, width / height, 0.1, 1000);
    camera.position.set(...(camDef.position ?? [0, 0, 6]) as [number, number, number]);
    if (camDef.lookAt) camera.lookAt(new THREE.Vector3(...camDef.lookAt));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    (scene.lights || []).forEach((l: any) => threeScene.add(buildLight(l)));

    // Objects
    const objectMap = new Map<string, THREE.Object3D>();
    (scene.objects || []).forEach((obj: any) => {
      const geometry = buildGeometry(obj.geometry);
      const material = buildMaterial(obj.material);
      const mesh = new THREE.Mesh(geometry, material);
      if (obj.position) mesh.position.set(...obj.position as [number, number, number]);
      if (obj.rotation) mesh.rotation.set(...obj.rotation as [number, number, number]);
      if (obj.scale) {
        if (Array.isArray(obj.scale)) mesh.scale.set(...obj.scale as [number, number, number]);
        else mesh.scale.setScalar(obj.scale);
      }
      threeScene.add(mesh);
      if (obj.id) objectMap.set(obj.id, mesh);
    });

    // GSAP animations
    const tweens: gsap.core.Tween[] = [];
    (scene.animations || []).forEach((anim: any) => {
      const target = objectMap.get(anim.target);
      if (!target) return;
      const path = anim.property.split(".");
      let obj: any = target;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      const key = path[path.length - 1];
      const tween = gsap.to(obj, {
        [key]: anim.to,
        duration: anim.duration ?? 2,
        repeat: anim.repeat ?? 0,
        yoyo: anim.yoyo ?? false,
        ease: anim.ease ?? "power2.inOut",
        delay: anim.delay ?? 0,
      });
      tweens.push(tween);
    });

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener("pointermove", onPointerMove);

    const tick = () => {
      threeScene.rotation.y += (mouse.x * 0.15 - threeScene.rotation.y) * 0.05;
      threeScene.rotation.x += (-mouse.y * 0.1 - threeScene.rotation.x) * 0.05;
      renderer.render(threeScene, camera);
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    onReady?.({ scene: threeScene, camera, renderer });

    return () => {
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onPointerMove);
      tweens.forEach((t) => t.kill());
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      threeScene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose?.());
          else o.material.dispose?.();
        }
      });
    };
  }, [scene]);

  return <div ref={containerRef} className={className} />;
}
