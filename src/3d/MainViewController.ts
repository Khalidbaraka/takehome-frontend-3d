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

export function createMainViewController(): MainViewController {
  const view = ThreeEngineController.getInstance();

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

  // I dont understand this funciton why we are setting
  // the isSelected to false and then checking if the original material exists and then setting the material to the original material
  function highlightObject(obj: THREE.Mesh) {
    obj.userData.isSelected = false;
    if (obj.userData.originalMaterial) {
      obj.material = obj.userData.originalMaterial;
    }
  }

  getNotificationCenter().subscribe(
    "shapeSelected",
    (mesh: THREE.Mesh | null) => {
      const objects = view.getObjectsInScene();
      // This is O(n): reset the highlight state of all objects in the scene
      objects.forEach((obj) => {
        highlightObject(obj as THREE.Mesh);
        obj.traverse((child) => highlightObject(child as THREE.Mesh));
      });

      if (mesh === null) {
        selectedShape = null;
        return;
      }

      mesh.userData.isSelected = true;
      mesh.userData.originalMaterial = mesh.material;
      mesh.material = highlightedMaterial;
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

        // herer as well, we are notifying the notification center that a shape has been added and we are passing the current objects in the scene as the payload
        getNotificationCenter().notify("shapeAdded", view.getObjectsInScene());
      }
    },
    selectShape(point: [number, number]) {
      // we are creating a raycaster everytime and its not efficient.
      const raycaster = new RayCastService();
      raycaster.update(point, view.getCamera());

      // This is O(n): we check all objects in the scene for intersection with the ray
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
        selectedShape.parent?.remove(selectedShape);
        getNotificationCenter().notify(
          "shapeRemoved",
          // here as wel we are retrieving all the objects as well
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
      getNotificationCenter().notify("shapeRemoved", view.getObjectsInScene());

      if (shouldClearSelection) {
        selectedShape = null;
        getNotificationCenter().notify("shapeSelected", null);
      }
    },
  };
}
