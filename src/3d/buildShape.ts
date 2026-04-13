import * as THREE from "three";
import { Mesh } from "three";

export type Shape = "sphere" | "cube" | "cylinder";

export function buildShape(shape: Shape): Mesh {
  const colors = [0xef4444, 0x22c55e, 0x3b82f6];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.05,
  });

  switch (shape) {
    case "sphere":
      return new Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        material,
      );
    case "cube":
      return new Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        material,
      );
    case "cylinder":
      return new Mesh(
        new THREE.CylinderGeometry(1, 1, 2, 32),
        material,
      );
  }
}
