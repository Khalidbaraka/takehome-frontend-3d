import * as THREE from "three";
import { getNotificationCenter } from "../notification";
import ThreeEngineController from "./engine";
import { RayCastService } from "./raycaster";
import { buildShape, type Shape } from "./buildShape";

export interface MainViewController {
  createShape(shape: Shape): void;
  selectShape(point: [number, number]): void;
  deleteSelectedShape(): void;
  shapeDeleted(shape: THREE.Mesh): void;
}

/**
 * @deprecated ShapeProvider is the source of truth for app/UI state.
 * This controller remains as a bridge to the Three.js scene and canvas interactions.
 */
export function createMainViewController(): MainViewController {
  const view = ThreeEngineController.getInstance();
  const raycaster = new RayCastService();

  let selectedShape: THREE.Mesh | null = null;
  let nextShapeNumber = 1;
  const highlightedMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  function randomPosition() {
    return new THREE.Vector3(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
    );
  }

  function restoreMeshMaterial(mesh: THREE.Mesh | null) {
    if (!mesh) {
      return;
    }

    mesh.userData.isSelected = false;
    if (mesh.userData.originalMaterial) {
      mesh.material = mesh.userData.originalMaterial;
      delete mesh.userData.originalMaterial;
    }
  }

  function selectMesh(mesh: THREE.Mesh) {
    mesh.userData.isSelected = true;
    if (!mesh.userData.originalMaterial) {
      mesh.userData.originalMaterial = mesh.material;
    }
    mesh.material = highlightedMaterial;
  }

  getNotificationCenter().subscribe(
    "shapeSelected",
    (mesh: THREE.Mesh | null) => {
      restoreMeshMaterial(selectedShape);

      if (mesh === null) {
        selectedShape = null;
        return;
      }

      selectMesh(mesh);
      selectedShape = mesh;
    },
  );

  return {
    createShape(shape: Shape) {
      const newMesh = buildShape(shape);

      if (newMesh) {
        newMesh.userData.displayNumber = nextShapeNumber++;
        newMesh.position.copy(randomPosition());

        if (selectedShape) {
          selectedShape.add(newMesh);
        } else {
          view.addToScene(newMesh);
        }

        view.trackAddedObject(newMesh);
        getNotificationCenter().notify("shapeAdded", view.getObjectsInScene());
      }
    },
    selectShape(point: [number, number]) {
      raycaster.update(point, view.getCamera());

      const objects = view.getObjectsInScene();
      const selectedObjects = raycaster.getIntersections(objects);
      if (!selectedObjects.length) {
        getNotificationCenter().notify("shapeSelected", null);
        return;
      }

      const firstObject = selectedObjects[0].object;
      getNotificationCenter().notify("shapeSelected", firstObject);
    },
    deleteSelectedShape() {
      if (selectedShape) {
        const shapeToRemove = selectedShape;
        selectedShape.parent?.remove(selectedShape);
        view.trackRemovedObject(shapeToRemove);
        getNotificationCenter().notify(
          "shapeRemoved",
          view.getObjectsInScene(),
        );
        getNotificationCenter().notify("shapeSelected", null);
      }
    },
    shapeDeleted(shape: THREE.Mesh) {
      const shouldClearSelection =
        selectedShape !== null &&
        (selectedShape === shape ||
          shape.children.includes(selectedShape) ||
          shape.getObjectById(selectedShape.id) !== undefined);

      shape.parent?.remove(shape);
      view.trackRemovedObject(shape);
      getNotificationCenter().notify("shapeRemoved", view.getObjectsInScene());

      if (shouldClearSelection) {
        selectedShape = null;
        getNotificationCenter().notify("shapeSelected", null);
      }
    },
  };
}
