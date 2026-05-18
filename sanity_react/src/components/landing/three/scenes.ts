/**
 * Three.js Scene JSON definitions.
 * Replace these placeholder scenes with your real exported JSON when ready.
 *
 * Each scene is consumed by <ModelViewer scene={scene} />.
 */

export const controllerScene = {
  background: "transparent",
  camera: { fov: 40, position: [0, 0, 5] },
  lights: [
    { type: "ambient", color: "#ffffff", intensity: 0.4 },
    { type: "point", color: "#a855f7", intensity: 4, position: [3, 2, 3] },
    { type: "point", color: "#3b82f6", intensity: 3, position: [-3, -2, 2] },
  ],
  objects: [
    {
      id: "controller",
      geometry: { type: "box", args: [2.2, 1.1, 0.8] },
      material: { type: "standard", color: "#1a1024", metalness: 0.8, roughness: 0.25, emissive: "#3b0a6b", emissiveIntensity: 0.4 },
      position: [0, 0, 0],
      rotation: [0.3, -0.4, 0.1],
    },
    {
      id: "joystick-l",
      geometry: { type: "cylinder", args: [0.18, 0.18, 0.35, 32] },
      material: { type: "standard", color: "#7c3aed", metalness: 0.6, roughness: 0.3, emissive: "#a855f7", emissiveIntensity: 0.6 },
      position: [-0.55, 0.2, 0.55],
      rotation: [0.3, -0.4, 0.1],
    },
    {
      id: "joystick-r",
      geometry: { type: "cylinder", args: [0.18, 0.18, 0.35, 32] },
      material: { type: "standard", color: "#7c3aed", metalness: 0.6, roughness: 0.3, emissive: "#a855f7", emissiveIntensity: 0.6 },
      position: [0.55, -0.1, 0.55],
      rotation: [0.3, -0.4, 0.1],
    },
  ],
  animations: [
    { target: "controller", property: "rotation.y", to: 6.28318, duration: 12, repeat: -1, ease: "none" },
    { target: "controller", property: "position.y", to: 0.15, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" },
  ],
};

export const phoneScene = {
  background: "transparent",
  camera: { fov: 35, position: [0, 0, 6] },
  lights: [
    { type: "ambient", color: "#ffffff", intensity: 0.5 },
    { type: "point", color: "#a855f7", intensity: 3, position: [2, 3, 3] },
    { type: "point", color: "#06b6d4", intensity: 2, position: [-2, -2, 2] },
  ],
  objects: [
    {
      id: "phone",
      geometry: { type: "box", args: [1.2, 2.4, 0.12] },
      material: { type: "standard", color: "#0a0612", metalness: 0.9, roughness: 0.15, emissive: "#1a0b2e", emissiveIntensity: 0.5 },
      position: [0, 0, 0],
      rotation: [0, -0.25, 0.08],
    },
  ],
  animations: [
    { target: "phone", property: "rotation.y", to: 0.25, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" },
    { target: "phone", property: "position.y", to: 0.1, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" },
  ],
};

export const carScene = {
  background: "transparent",
  camera: { fov: 35, position: [0, 0.5, 6] },
  lights: [
    { type: "ambient", color: "#ffffff", intensity: 0.3 },
    { type: "point", color: "#a855f7", intensity: 5, position: [3, 2, 3] },
    { type: "point", color: "#ec4899", intensity: 4, position: [-3, 1, 2] },
    { type: "point", color: "#06b6d4", intensity: 3, position: [0, -2, 3] },
  ],
  objects: [
    {
      id: "car-body",
      geometry: { type: "box", args: [3, 0.6, 1.2] },
      material: { type: "standard", color: "#2a0e3a", metalness: 0.95, roughness: 0.15, emissive: "#7c3aed", emissiveIntensity: 0.5 },
      position: [0, 0, 0],
      rotation: [0, 0.5, 0],
    },
    {
      id: "car-cabin",
      geometry: { type: "box", args: [1.6, 0.5, 1.0] },
      material: { type: "standard", color: "#0a0612", metalness: 0.9, roughness: 0.1, opacity: 0.85, transparent: true },
      position: [0.1, 0.45, 0],
      rotation: [0, 0.5, 0],
    },
  ],
  animations: [
    { target: "car-body", property: "rotation.y", to: 6.28318, duration: 18, repeat: -1, ease: "none" },
    { target: "car-cabin", property: "rotation.y", to: 6.28318, duration: 18, repeat: -1, ease: "none" },
  ],
};

export const conesScene = {
  background: "transparent",
  camera: { fov: 45, position: [0, 0, 5] },
  lights: [
    { type: "ambient", color: "#ffffff", intensity: 0.4 },
    { type: "point", color: "#06b6d4", intensity: 3, position: [2, 2, 2] },
  ],
  objects: [
    { id: "cone1", geometry: { type: "cone", args: [0.4, 1, 32] }, material: { type: "standard", color: "#06b6d4", emissive: "#06b6d4", emissiveIntensity: 1.5, metalness: 0.5, roughness: 0.4 }, position: [-1, 0, 0] },
    { id: "cone2", geometry: { type: "cone", args: [0.4, 1, 32] }, material: { type: "standard", color: "#a855f7", emissive: "#a855f7", emissiveIntensity: 1.5, metalness: 0.5, roughness: 0.4 }, position: [1, 0.2, 0] },
  ],
  animations: [
    { target: "cone1", property: "rotation.y", to: 6.28, duration: 6, repeat: -1, ease: "none" },
    { target: "cone2", property: "rotation.y", to: -6.28, duration: 8, repeat: -1, ease: "none" },
  ],
};
