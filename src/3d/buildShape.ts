import * as THREE from "three";
import { Mesh } from "three";

export type Shape = "sphere" | "cube" | "cylinder";

const colors = [0xef4444, 0x22c55e, 0x3b82f6];

const geometryByShape: Record<Shape, THREE.BufferGeometry> = {
  sphere: new THREE.SphereGeometry(1, 32, 32),
  cube: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 2, 32),
};

const materialByColor = new Map<number, THREE.MeshStandardMaterial>();

export function buildShape(shape: Shape): Mesh {
  const color = colors[Math.floor(Math.random() * colors.length)];
  let material = materialByColor.get(color);

  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.05,
    });
    materialByColor.set(color, material);
  }

  return new Mesh(geometryByShape[shape], material);
}
