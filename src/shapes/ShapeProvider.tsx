import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";
import { buildShape, type Shape } from "../3d/buildShape";
import ThreeEngineController from "../3d/engine";
import { RayCastService } from "../3d/raycaster";

export type ShapeNode = {
  id: string;
  type: Shape;
  color: string;
  parentId: string | null;
  childIds: string[];
  displayNumber: number;
};

type ShapeContextValue = {
  projectName: string;
  setProjectName: (projectName: string) => void;
  shapeCount: number;
  rootShapeIds: string[];
  selectedShapeId: string | null;
  getShapeById: (id: string) => ShapeNode | undefined;
  createShape: (shape: Shape) => void;
  deleteShape: (shapeId: string) => void;
  selectShape: (shapeId: string | null) => void;
  selectShapeFromCanvas: (point: [number, number]) => void;
};

export type ShapeActions = Pick<
  ShapeContextValue,
  "createShape" | "deleteShape" | "selectShape" | "selectShapeFromCanvas"
> & {
  deleteSelectedShape: () => void;
};

const ShapeContext = createContext<ShapeContextValue | null>(null);

/**
 * ShapeProvider is the source of truth for app/UI state.
 * It owns the normalized shape tree and uses Three.js only as the rendering layer.
 */
export function ShapeProvider({
  children,
  onReady,
}: PropsWithChildren<{ onReady?: (actions: ShapeActions) => void }>) {
  const engine = ThreeEngineController.getInstance();
  const [projectName, setProjectName] = useState("Untitled Project");
  const [shapeState, setShapeState] = useState(() =>
    buildShapeState(engine.getObjectsInScene() as Mesh[]),
  );
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const selectedMeshRef = useRef<Mesh | null>(null);
  const raycasterRef = useRef(new RayCastService());
  const highlightMaterialRef = useRef(new MeshBasicMaterial({ color: 0xffff00 }));

  const restoreMeshMaterial = useCallback((mesh: Mesh | null) => {
    if (!mesh) {
      return;
    }

    mesh.userData.isSelected = false;
    if (mesh.userData.originalMaterial) {
      mesh.material = mesh.userData.originalMaterial;
      delete mesh.userData.originalMaterial;
    }
  }, []);

  const applySelection = useCallback(
    (mesh: Mesh | null) => {
      if (selectedMeshRef.current === mesh) {
        return;
      }

      restoreMeshMaterial(selectedMeshRef.current);

      if (!mesh) {
        selectedMeshRef.current = null;
        setSelectedShapeId(null);
        return;
      }

      mesh.userData.isSelected = true;
      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = mesh.material;
      }
      mesh.material = highlightMaterialRef.current;
      selectedMeshRef.current = mesh;
      setSelectedShapeId(mesh.uuid);
    },
    [restoreMeshMaterial],
  );

  const getShapeById = useCallback(
    (id: string) => shapeState.shapesById.get(id),
    [shapeState.shapesById],
  );

  const createShape = useCallback(
    (shape: Shape) => {
      const mesh = buildShape(shape);
      const parentId = selectedShapeId;
      const parentMesh = parentId ? shapeState.meshById.get(parentId) ?? null : null;

      mesh.userData.displayNumber = getNextDisplayNumber(shapeState, parentId);
      mesh.position.copy(randomPosition());

      if (parentMesh) {
        parentMesh.add(mesh);
      } else {
        engine.addToScene(mesh);
      }

      engine.trackAddedObject(mesh);
      setShapeState((current) => addShapeNode(current, mesh, parentId));
    },
    [engine, selectedShapeId, shapeState.meshById],
  );

  const deleteShape = useCallback(
    (shapeId: string) => {
      const mesh = shapeState.meshById.get(shapeId);
      if (!mesh) {
        return;
      }

      const idsToDelete = collectMeshSubtreeIds(mesh);
      if (selectedShapeId && idsToDelete.includes(selectedShapeId)) {
        applySelection(null);
      }

      mesh.parent?.remove(mesh);
      engine.trackRemovedObject(mesh);
      setShapeState((current) => removeShapeNode(current, shapeId, idsToDelete));
    },
    [applySelection, engine, selectedShapeId, shapeState.meshById],
  );

  const selectShape = useCallback(
    (shapeId: string | null) => {
      const mesh = shapeId ? shapeState.meshById.get(shapeId) ?? null : null;
      applySelection(mesh);
    },
    [applySelection, shapeState.meshById],
  );

  const selectShapeFromCanvas = useCallback(
    (point: [number, number]) => {
      raycasterRef.current.update(point, engine.getCamera());
      const intersections = raycasterRef.current.getIntersections(
        engine.getObjectsInScene(),
      );
      const mesh = (intersections[0]?.object as Mesh | undefined) ?? null;
      applySelection(mesh);
    },
    [applySelection, engine],
  );

  const deleteSelectedShape = useCallback(() => {
    if (selectedShapeId) {
      deleteShape(selectedShapeId);
    }
  }, [deleteShape, selectedShapeId]);

  const actions = useMemo<ShapeActions>(
    () => ({
      createShape,
      deleteShape,
      deleteSelectedShape,
      selectShape,
      selectShapeFromCanvas,
    }),
    [
      createShape,
      deleteShape,
      deleteSelectedShape,
      selectShape,
      selectShapeFromCanvas,
    ],
  );

  useEffect(() => {
    onReady?.(actions);
  }, [actions, onReady]);

  const value = useMemo<ShapeContextValue>(
    () => ({
      projectName,
      setProjectName,
      shapeCount: shapeState.count,
      rootShapeIds: shapeState.rootShapeIds,
      selectedShapeId,
      getShapeById,
      createShape,
      deleteShape,
      selectShape,
      selectShapeFromCanvas,
    }),
    [
      projectName,
      shapeState,
      selectedShapeId,
      getShapeById,
      createShape,
      deleteShape,
      selectShape,
      selectShapeFromCanvas,
    ],
  );

  return <ShapeContext.Provider value={value}>{children}</ShapeContext.Provider>;
}

export function useShapes() {
  const context = useContext(ShapeContext);
  if (!context) {
    throw new Error("useShapes must be used within ShapeProvider");
  }

  return context;
}

type ShapeState = {
  shapesById: Map<string, ShapeNode>;
  meshById: Map<string, Mesh>;
  rootShapeIds: string[];
  count: number;
};

function buildShapeState(rootMeshes: Mesh[]): ShapeState {
  const shapesById = new Map<string, ShapeNode>();
  const meshById = new Map<string, Mesh>();
  const rootShapeIds: string[] = [];

  const visit = (mesh: Mesh, parentId: string | null) => {
    const childMeshes = mesh.children.filter(isMesh);
    const node: ShapeNode = {
      id: mesh.uuid,
      type: getShapeType(mesh),
      color: getMeshColor(mesh),
      parentId,
      childIds: childMeshes.map((child) => child.uuid),
      displayNumber: mesh.userData.displayNumber ?? 0,
    };

    shapesById.set(node.id, node);
    meshById.set(node.id, mesh);

    if (parentId === null) {
      rootShapeIds.push(node.id);
    }

    childMeshes.forEach((child) => visit(child, node.id));
  };

  rootMeshes.filter(isMesh).forEach((mesh) => visit(mesh, null));

  return {
    shapesById,
    meshById,
    rootShapeIds,
    count: shapesById.size,
  };
}

function addShapeNode(current: ShapeState, mesh: Mesh, parentId: string | null): ShapeState {
  const shapesById = new Map(current.shapesById);
  const meshById = new Map(current.meshById);
  const rootShapeIds = [...current.rootShapeIds];

  const node: ShapeNode = {
    id: mesh.uuid,
    type: getShapeType(mesh),
    color: getMeshColor(mesh),
    parentId,
    childIds: [],
    displayNumber: mesh.userData.displayNumber ?? 0,
  };

  shapesById.set(node.id, node);
  meshById.set(node.id, mesh);

  if (parentId) {
    const parent = shapesById.get(parentId);
    if (parent) {
      shapesById.set(parentId, {
        ...parent,
        childIds: [...parent.childIds, node.id],
      });
    }
  } else {
    rootShapeIds.push(node.id);
  }

  return {
    shapesById,
    meshById,
    rootShapeIds,
    count: current.count + 1,
  };
}

function getNextDisplayNumber(state: ShapeState, parentId: string | null) {
  const siblingIds = parentId
    ? state.shapesById.get(parentId)?.childIds ?? []
    : state.rootShapeIds;

  return (
    siblingIds.reduce((maxNumber, siblingId) => {
      const sibling = state.shapesById.get(siblingId);
      return Math.max(maxNumber, sibling?.displayNumber ?? 0);
    }, 0) + 1
  );
}

function removeShapeNode(
  current: ShapeState,
  shapeId: string,
  idsToDelete: string[],
): ShapeState {
  const shapesById = new Map(current.shapesById);
  const meshById = new Map(current.meshById);
  const shape = shapesById.get(shapeId);

  idsToDelete.forEach((id) => {
    shapesById.delete(id);
    meshById.delete(id);
  });

  let rootShapeIds = current.rootShapeIds.filter((id) => !idsToDelete.includes(id));

  if (shape?.parentId) {
    const parent = shapesById.get(shape.parentId);
    if (parent) {
      shapesById.set(shape.parentId, {
        ...parent,
        childIds: parent.childIds.filter((id) => id !== shapeId),
      });
    }
  } else {
    rootShapeIds = rootShapeIds.filter((id) => id !== shapeId);
  }

  return {
    shapesById,
    meshById,
    rootShapeIds,
    count: current.count - idsToDelete.length,
  };
}

function collectMeshSubtreeIds(rootMesh: Mesh) {
  const result: string[] = [];
  rootMesh.traverse((object) => {
    if (object instanceof Mesh) {
      result.push(object.uuid);
    }
  });
  return result;
}

function getShapeType(mesh: Mesh): Shape {
  switch (mesh.geometry.type) {
    case "BoxGeometry":
      return "cube";
    case "CylinderGeometry":
      return "cylinder";
    default:
      return "sphere";
  }
}

function getMeshColor(mesh: Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return (
    (material as { color?: { getStyle: () => string } }).color?.getStyle() ?? "unknown"
  );
}

function randomPosition() {
  return new Vector3(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
  );
}

function isMesh(child: unknown): child is Mesh {
  return child instanceof Mesh;
}
